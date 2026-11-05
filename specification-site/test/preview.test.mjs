import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const rendererRoot = process.env.GOVSTACK_SITE_RENDERER
  || path.resolve(sourceRoot, '../govstack-specification-site');
const require = createRequire(path.join(rendererRoot, 'package.json'));
const YAML = require('yaml');
const workflowPath = path.join(sourceRoot, '.github/workflows/preview-pages.yml');
const loadWorkflow = async () => YAML.parse(await readFile(workflowPath, 'utf8'));
const deploymentGuard = "github.repository == 'jeremi/bb-analytics' && github.ref == 'refs/heads/docs/govstack-site-rendering'";
const immutableAction = /^[^./][^@]*@[0-9a-f]{40}$/;

function assertImmutableActions(steps) {
  for (const step of steps.filter(({ uses }) => uses)) {
    if (step.uses.startsWith('./')) continue;
    assert.match(step.uses, immutableAction, `${step.uses} must use a full commit SHA`);
  }
}

test('preview publication runs only for its branch or manual dispatch', async () => {
  const workflow = await loadWorkflow();
  assert.deepEqual(Object.keys(workflow.on).sort(), ['push', 'workflow_dispatch']);
  assert.deepEqual(workflow.on.push, { branches: ['docs/govstack-site-rendering'] });
  assert.ok(Object.hasOwn(workflow.on, 'workflow_dispatch'));
  assert.equal(workflow.on.pull_request, undefined);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.match(workflow.env.RENDERER_REF, /^[0-9a-f]{40}$/);
});

test('preview build is repository-bound, tested, checked, and uploaded immutably', async () => {
  const workflow = await loadWorkflow();
  const build = workflow.jobs.build;
  assert.equal(build.if, deploymentGuard);
  const checkoutSteps = build.steps.filter(({ uses }) => uses?.startsWith('actions/checkout@'));
  assert.ok(checkoutSteps.length >= 2, 'source and renderer must both be checked out');
  for (const step of checkoutSteps) {
    assert.equal(String(step.with?.['persist-credentials']), 'false');
  }
  const rendererCheckout = checkoutSteps.find(({ with: inputs }) => inputs?.path === 'renderer');
  assert.ok(rendererCheckout?.with.repository, 'the renderer must come from a published repository');
  assert.equal(rendererCheckout.with.ref, '${{ env.RENDERER_REF }}');

  const testIndex = build.steps.findIndex(({ run }) => run?.includes('npm test'));
  const buildIndex = build.steps.findIndex(({ uses }) => uses === './renderer');
  const uploadIndex = build.steps.findIndex(({ uses }) => uses?.startsWith('actions/upload-pages-artifact@'));
  assert.ok(testIndex >= 0, 'consumer tests must run');
  assert.ok(buildIndex > testIndex, 'the checked build must follow consumer tests');
  assert.ok(uploadIndex > buildIndex, 'the Pages artifact must follow the checked build');
  assert.equal(build.steps[buildIndex].with.base, '/bb-analytics/');
  assert.equal(String(build.steps[buildIndex].with.unofficial), 'true');
  assertImmutableActions(build.steps);
});

test('deployment is repository-bound and has only the Pages authority it needs', async () => {
  const workflow = await loadWorkflow();
  const deployment = workflow.jobs.deploy;
  assert.equal(deployment.if, deploymentGuard);
  assert.deepEqual(deployment.needs, 'build');
  assert.deepEqual(deployment.permissions, { pages: 'write', 'id-token': 'write' });
  assert.equal(deployment.environment.name, 'github-pages');
  const deploy = deployment.steps.find(({ uses }) => uses?.startsWith('actions/deploy-pages@'));
  assert.ok(deploy, 'deployment must use actions/deploy-pages');
  assertImmutableActions(deployment.steps);
});
