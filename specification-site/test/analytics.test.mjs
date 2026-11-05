import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import test from 'node:test';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const rendererRoot = process.env.GOVSTACK_SITE_RENDERER
  || path.resolve(sourceRoot, '../govstack-specification-site');
const require = createRequire(path.join(rendererRoot, 'package.json'));
const YAML = require('yaml');
const { generateSite } = await import(pathToFileURL(path.join(rendererRoot, 'adapters/framework.mjs')));
const load = async (relative) => YAML.parse(await readFile(path.join(sourceRoot, relative), 'utf8'));

test('publication uses the canonical capability and extension metadata', async () => {
  const publication = await load('metadata.yml');
  const canonical = await load('spec/metadata.yml');
  assert.deepEqual(publication.capabilities, canonical.capabilities);
  assert.deepEqual(publication.extensions, canonical.extensions);
  assert.equal(publication.name, 'Analytics');
  assert.match(publication.versions[0].version, /draft/);
  assert.equal(publication.url, undefined, 'do not invent an official publication URL');
});

test('every GitBook chapter, all ADRs and the draft API are rendered at the project subpath', async (t) => {
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'analytics-site-'));
  t.after(() => rm(scratch, { recursive: true, force: true }));
  const manifest = await generateSite({ sourceRoot, siteRoot: scratch, base: '/bb-analytics/', unofficial: true });
  const summary = await readFile(path.join(sourceRoot, 'spec/SUMMARY.md'), 'utf8');
  const chapters = [...summary.matchAll(/\]\(([^)]+\.md)\)/g)].map((match) => `spec/${match[1]}`);
  const published = new Set(manifest.pages.map((page) => page.source));
  for (const chapter of chapters) assert.ok(published.has(chapter), `missing GitBook chapter ${chapter}`);
  for (let index = 1; index <= 5; index += 1) assert.ok(published.has(`adr/ANALYTICS-ADR-${index}.md`));
  let requirements = 0;
  for (const chapter of chapters.filter((page) => page.startsWith('spec/requirements/'))) {
    const source = await readFile(path.join(sourceRoot, chapter), 'utf8');
    const frontmatter = YAML.parse(/^---\n([\s\S]*?)\n---/.exec(source)[1]);
    requirements += frontmatter.requirements.length;
    const route = manifest.pages.find((page) => page.source === chapter).route;
    const rendered = await readFile(path.join(scratch, 'src/content/docs', `${route}.md`), 'utf8');
    assert.equal((rendered.match(/<article class="requirement-card /g) || []).length, frontmatter.requirements.length);
    assert.match(rendered, /noindex, nofollow/);
    assert.doesNotMatch(rendered, /\{%/);
  }
  assert.equal(manifest.requirementCount, requirements);
  assert.equal(manifest.apiReferences.length, 1);
  const reference = manifest.apiReferences[0];
  assert.equal(reference.role, 'normative');
  assert.equal(reference.contract, 'api/openapi.yaml');
  const page = await readFile(path.join(scratch, 'src/content/docs/resources/api-reference.md'), 'utf8');
  assert.match(page, /data-scalar-reference/);
  assert.match(page, /\/bb-analytics\/api-reference\/analytics\.json/);
  for (const file of ['api/openapi.yaml', 'api/common/govstack-openapi-common.yaml', 'spec/metadata.yml']) {
    assert.deepEqual(await readFile(path.join(scratch, 'public', file)), await readFile(path.join(sourceRoot, file)));
  }
  const bundled = JSON.parse(await readFile(path.join(scratch, 'public/api-reference/analytics.json'), 'utf8'));
  const original = await load('api/openapi.yaml');
  assert.deepEqual(Object.keys(bundled.paths), Object.keys(original.paths));
  assert.deepEqual(Object.keys(bundled.webhooks), Object.keys(original.webhooks));
  assert.equal(manifest.warnings.length, 0);
  for (const chapter of chapters) {
    const route = manifest.pages.find((page) => page.source === chapter).route;
    assert.doesNotMatch(await readFile(path.join(scratch, 'src/content/docs', `${route}.md`), 'utf8'), /\{%/);
  }
});

test('CI checks pull requests and uploads a review artifact without deploying', async () => {
  const workflow = await load('.github/workflows/specification-site-check.yml');
  assert.ok(workflow.on.pull_request);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.match(workflow.env.RENDERER_REF, /[0-9a-f]{40}/);
  const steps = workflow.jobs.build.steps;
  assert.ok(steps.some((step) => step.run?.includes('npm test')));
  assert.ok(steps.some((step) => step.uses === './renderer' && step.with.unofficial === 'true'));
  assert.ok(steps.some((step) => step.uses?.startsWith('actions/upload-artifact@')));
  assert.ok(!steps.some((step) => /deploy-pages/.test(step.uses || '')));
});
