# GovStack Analytics Building Block — Technical Specification

Working draft of the Analytics Building Block technical specification, proposed in
[pull request 1](https://github.com/GovStackWorkingGroup/bb-analytics/pull/1).
It is under discussion and is not an approved GovStack specification.

Earlier material was published on the Experience Digital Transformation GitBook:
https://experience-digital-transform.gitbook.io/experience-digital-transformation/analytics/technical-specifications

The specification lives in [`spec/`](spec/README.md). `spec/SUMMARY.md` provides the page order, so the folder can be connected to a GitBook space with Git Sync.

## Render the GovStack website

The shared GovStack specification renderer provides the branded navigation,
search, requirement cards and interactive [API reference](resources/api-reference.md).
The existing GitBook chapters and API files remain the source.

With Node 24.11 or later and a checkout of
[`govstack-specification-site`](https://github.com/jeremi/govstack-specification-site)
at commit `567eb981cd0c2a1bb9163b2cecbfc12a1b7412fd`:

```sh
export GOVSTACK_SITE_RENDERER=/absolute/path/to/govstack-specification-site
npm --prefix "$GOVSTACK_SITE_RENDERER" ci --ignore-scripts
npm --prefix specification-site test
npm --prefix specification-site run check -- --base /bb-analytics/ --unofficial
npm --prefix specification-site run preview -- --base /bb-analytics/ --unofficial
```

The preview is served at `http://127.0.0.1:4321/bb-analytics/`. Pull requests run
the same checked build and upload a downloadable `analytics-specification-site`
artifact. Hosting and Pages deployment are not enabled by this change.
See `specification-site/README.md` for output paths and publication metadata.

## Repo Structure

```sh
README.md
/spec # the markdown files which are used to build the specification in GitBook
/api # the openapi specification
/test # the test plan and tests
  plan.md
/examples # examples for deploying, configuring, and testing applications which implement the behaviors specified by this building block
  /application-a
    README.md # instructions for deployment/testing
    docker-compose.yaml # example deployment file
      db
      web
      adaptor
      security-server
    Caddyfile # example config for "adaptor"
    Dockerfile # dockerfile to build "adaptor"
  /application-b
  /application-c
```

## ORB setup

Documentation for ORB setup is available here:
[ORB setup instruction](https://govstack-global.atlassian.net/wiki/spaces/GH/pages/191692823/ORB+setup+instruction)
