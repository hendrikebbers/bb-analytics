# Analytics specification site

This thin wrapper uses the shared
[GovStack specification renderer](https://github.com/jeremi/govstack-specification-site),
pinned in CI to `567eb981cd0c2a1bb9163b2cecbfc12a1b7412fd`. It owns the Astro,
Starlight, Pagefind, Mermaid and Scalar dependencies; this repository adds no
second frontend application or dependency lockfile.

## Source layout

The renderer reads the repository root. `toc.yml` lists every existing GitBook
chapter in its original order, the five proposed ADRs, API documentation and a
separate Scalar API page. `spec/SUMMARY.md` remains the GitBook navigation.
`api-references.yml` points Scalar at `api/openapi.yaml`; its `normative` role
means it is the contract proposed by this draft, not an approved standard.
The existing Service APIs chapter stays a prose page. The ADR directory uses
lowercase `adr/` so legacy redirect paths and generated routes agree on both
case-sensitive Linux and case-insensitive macOS filesystems. ADR text is unchanged.
GitBook-specific hint directives are portable Markdown blockquotes, preserving
the callout text for both renderers.

Root `metadata.yml` is a Git symlink to `spec/metadata.yml`, keeping the capability
and extension definitions in one file. Clone with symlink support, as on Linux
and macOS. On Windows, enable Git symlinks before cloning. `unversioned-draft`
is a preview label because this draft has no assigned specification version.
No official publication URL, release date, owner-group URN or person URN is
invented. `authors.yml` credits the draft author identified by the source PR.

## Local checks and preview

Use Node 24.11 or later. Check out the renderer revision pinned above and set
`GOVSTACK_SITE_RENDERER` to its absolute path. Install dependencies there:

```sh
npm --prefix "$GOVSTACK_SITE_RENDERER" ci --ignore-scripts
npm --prefix /absolute/path/to/bb-analytics/specification-site test
npm --prefix /absolute/path/to/bb-analytics/specification-site run check -- --base /bb-analytics/ --unofficial
npm --prefix /absolute/path/to/bb-analytics/specification-site run preview -- --base /bb-analytics/ --unofficial
```

Without the environment variable the wrapper looks for a sibling
`govstack-specification-site` checkout. Commands work from any directory.
`check` runs the renderer tests, Astro checks, build, link and anchor checks,
search checks and an isolated HTTP preview check. `npm test` covers wrapper
arguments, source navigation, metadata, draft requirements, the bundled API,
unchanged downloads and the CI configuration.

Output defaults to a source-specific directory under the renderer's `dist/`.
Set `--output /absolute/path/to/site` to choose a different output outside both
source and renderer. Use the same `--base`, `--output` and `--unofficial`
arguments for `check`, `preview`, `check:built` and `test:served`.

## CI and hosting

The build workflow checks pull requests, pushes to `playground-hendrik` and
manual dispatches. It pins the renderer to a published full commit; an optional
`GOVSTACK_SITE_RENDERER_REF` repository variable must also be a full commit.
It uploads the checked static site as `analytics-specification-site` for review.
All pages carry an unofficial preview notice and `noindex, nofollow` metadata.

The check workflow has read-only repository permissions and no deployment step.

The separate `preview-pages.yml` workflow publishes the
[hosted review preview](https://jeremi.github.io/bb-analytics/) from
`docs/govstack-site-rendering` in `jeremi/bb-analytics` only. Both its build and
deployment jobs check the exact repository and branch. It runs the consumer
tests and shared checked build before uploading a Pages artifact. Only the
deployment job receives `pages: write` and `id-token: write` permissions.

Pages uses the GitHub Actions publishing source. The `github-pages` environment
allows deployments from this preview branch. Pushes to the branch update the
site automatically. Manual dispatch requires the workflow file on the fork's
default branch, so it is unavailable in this branch-only setup. Neither Hendrik's
fork nor the GovStack repository deploys this preview.
Remove the fork-specific preview workflow before upstream adoption; the
build-only check workflow can remain.
