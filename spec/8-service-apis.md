# 8 Service APIs

This section provides a reference for the APIs that are implemented by the Analytics Building Block. The APIs defined here establish a blueprint for how the building block interacts with other building blocks and applications. Additional APIs may be implemented by a solution, but the listed APIs define the minimal set of functionality that every implementation provides.

The [GovStack architecture](https://specs.govstack.global/architecture) describes how 'adaptors' may be used to translate an existing API to the patterns described here. An existing product, for example an SDMX platform or a data warehouse, can be made conformant by an adaptor that provides these interfaces.

## 8.1 OpenAPI definition

The core interface is defined in [`api/openapi.yaml`](../api/openapi.yaml) (OpenAPI 3.1, version `1.0.0-draft`). It covers the five core functionalities and follows the [GovStack Cross-BB API Design Guide](https://github.com/jeremi/govstack-api-design-guide) version `0.3.0-draft`. Requirement traceability is kept in [`api/coverage.yaml`](../api/coverage.yaml); the shared GovStack schemas are vendored in [`api/common/`](../api/common/).

> **Note**
>
> Once the OpenAPI file is published at its final location, it will be embedded here with the GitBook OpenAPI widget, linking to the raw URL of the file.

**Basics that apply to all operations:**

* All resource paths start with the major version `/v1`. The unversioned `/health` endpoint reports liveness.
* HTTP according to RFC 9110 over TLS. Every request carries an OAuth 2.0 access token, issued through the Identity BB. Officials such as data stewards and analysts use a user token (`analyticsUserAuth`); supplying systems, portals and other building blocks use client credentials (`analyticsServiceAuth`). Scopes follow the pattern `bb:analytics:<resource>:<action>`. No operation is citizen-facing.
* Read permissions are governed by the access management of the platform. The building block returns no data and sends no events that the caller is not authorised for.
* Requests and responses use JSON according to RFC 8259 unless stated otherwise; field names use camelCase, except in documents defined by external standards (Data Package, Table Schema, JSON-stat, JSON-LD, PROV-O, CloudEvents). Points in time follow RFC 3339.
* Errors are returned as Problem Details according to RFC 9457 (`application/problem+json`) with a `type` of the form `https://govstack.global/problems/analytics/<problem>` and the `traceId` of the request. Problem fields carry no personal data and no system-internal details. Validation errors of a delivery are not HTTP errors; they are listed in the receipt with resource, row, field and violated rule.
* Every request may carry a W3C `traceparent` header, which the building block propagates.
* Every POST that creates a resource or starts processing requires an `Idempotency-Key` header. A retry with the same key returns the original response; the same key with a different request is rejected with `422`.
* Collections (datasets, indicators, dataset versions, subscriptions) are paginated with `pageSize` and an opaque `cursor`; responses have the form `{ "items": [...], "pageInfo": { "nextCursor": ... } }`.
* Asynchronous work (deliveries, calculations, large downloads) answers `202 Accepted` with a `Location` header and the current state of a receipt, calculation or download, which is polled with `GET` until it reaches a terminal status.
* The API does not localise content; problem texts are in English.
* Every operation carries the property `x-govstack-analytics-requirement-level` with `MUST` (required in the core) or `SHOULD` (recommended). It corresponds to the level `REQUIRED` or `RECOMMENDED` of the requirements in [Section 6](6-functional-requirements.md), each of which names its operation in `api_operation_id`.

## 8.2 Operations

The operations are grouped by the tags of the OpenAPI definition.

### 8.2.1 Catalogue

Datasets, schemas, versions, indicators and code lists. Functionality: [Data Catalogue](requirements/data-catalogue.md).

| Operation | Method and path | Level | Purpose |
| --------- | --------------- | ----- | ------- |
| `getCatalogue` | `GET /v1/catalogue` | MUST | Entry point with links to datasets and indicators, executable calculation languages, size limit for asynchronous downloads; JSON-LD context (DCAT 3) |
| `listDatasets` | `GET /v1/datasets` | MUST | Paginated catalogue entries of the datasets; filters `processingStage` (SHOULD) and `origin` |
| `createDataset` | `POST /v1/datasets` | MUST | Create a dataset; the building block sets the origin |
| `getDataset` | `GET /v1/datasets/{datasetId}` | MUST | Catalogue entry of a dataset |
| `putSchema` | `PUT /v1/datasets/{datasetId}/schema` | MUST | Register a Table Schema; creates a new schema version |
| `getCurrentSchema` | `GET /v1/datasets/{datasetId}/schema` | MUST | Current Table Schema |
| `getSchemaVersion` | `GET /v1/datasets/{datasetId}/schema/{schemaVersion}` | MUST | Earlier Table Schema |
| `listDatasetVersions` | `GET /v1/datasets/{datasetId}/versions` | MUST | All versions, including withdrawn ones, paginated |
| `getDatasetVersion` | `GET /v1/datasets/{datasetId}/versions/{version}` | MUST | Metadata of a dataset version; `latest` instead of a number is recommended |
| `getCodelist` | `GET /v1/codelists/{codelistId}/versions/{schemaVersion}` | MUST | Code list `<datasetId>.<field>` as a JSON-stat dimension response |
| `listIndicators` | `GET /v1/indicators` | MUST | Paginated catalogue entries of the indicators |
| `getIndicator` | `GET /v1/indicators/{indicatorId}` | MUST | Catalogue entry of an indicator |

### 8.2.2 Ingestion

Delivery and validation of dataset versions. Functionality: [Data Ingestion](requirements/data-ingestion.md).

| Operation | Method and path | Level | Purpose |
| --------- | --------------- | ----- | ------- |
| `deliverDatasetVersion` | `POST /v1/datasets/{datasetId}/versions` | MUST | Deliver a Data Package (multipart request according to RFC 7578) with header `Idempotency-Key`; answers `202` with a receipt |
| `getReceipt` | `GET /v1/receipts/{receiptId}` | MUST | Poll the validation result of a delivery |
| `withdrawDatasetVersion` | `POST /v1/datasets/{datasetId}/versions/{version}/withdraw` | MUST | Withdraw a dataset version with a reason; only data stewards |

### 8.2.3 Indicators

Indicator definitions and calculations. Functionality: [Indicator Calculation](requirements/indicator-calculation.md).

| Operation | Method and path | Level | Purpose |
| --------- | --------------- | ----- | ------- |
| `createIndicator` | `POST /v1/indicators` | MUST | Create an indicator with identifier and title |
| `createDefinitionVersion` | `POST /v1/indicators/{indicatorId}/versions` | MUST | Create and publish a definition version; immutable afterwards |
| `getDefinitionVersion` | `GET /v1/indicators/{indicatorId}/versions/{definitionVersion}` | MUST | A published definition version |
| `startCalculation` | `POST /v1/indicators/{indicatorId}/calculations` | MUST | Start a calculation; answers `202` with the calculation |
| `getCalculation` | `GET /v1/calculations/{calculationId}` | MUST | Poll the status of a calculation |

### 8.2.4 Values, Provenance and Export

Retrieval of indicator values, provenance records and dataset contents. Functionality: [Data Access](requirements/data-access.md).

| Operation | Method and path | Level | Purpose |
| --------- | --------------- | ----- | ------- |
| `getValues` | `GET /v1/indicators/{indicatorId}/values` | MUST | Indicator values as JSON-stat 2.0 (default) or CSV; parameters `format` and `resultVersion` (MUST), `c` and `updatedAfter` (SHOULD) |
| `getLineage` | `GET /v1/lineage/{calculationId}` | MUST | Provenance record as W3C PROV-O in JSON-LD |
| `exportDatasetVersion` | `GET /v1/datasets/{datasetId}/contents/{version}` | MUST | Content of a dataset version as CSV; `410` if the content was deleted |
| `getDownload` | `GET /v1/downloads/{downloadId}` | SHOULD | Poll an asynchronous download above the configured size limit |
| `getDownloadContent` | `GET /v1/downloads/{downloadId}/content` | SHOULD | Fetch the prepared file, with SHA-256 checksum in `Repr-Digest` |

### 8.2.5 Events

Subscriptions and the events of the [event catalogue](requirements/publication-events.md). Functionality: [Publication Events](requirements/publication-events.md).

| Operation | Method and path | Level | Purpose |
| --------- | --------------- | ----- | ------- |
| `createSubscription` | `POST /v1/subscriptions` | MUST | Subscribe to event types with a callback endpoint (`sink`) |
| `listSubscriptions` | `GET /v1/subscriptions` | MUST | The caller's subscriptions, paginated |
| `getSubscription` | `GET /v1/subscriptions/{subscriptionId}` | SHOULD | A subscription |
| `deleteSubscription` | `DELETE /v1/subscriptions/{subscriptionId}` | MUST | End a subscription |

The events themselves are defined as `webhooks` in the OpenAPI definition. Each is a CloudEvents 1.0 message (`application/cloudevents+json`) with a type prefixed by `global.govstack.analytics`.

| Event type | Level |
| ---------- | ----- |
| `dataset.version.published` | MUST |
| `dataset.version.withdrawn` | MUST |
| `indicator.definition.published` | MUST |
| `indicator.values.published` | MUST |
| `indicator.calculation.failed` | MUST |
| `delivery.checked` | SHOULD |
| `dataset.version.contentRemoved` | SHOULD |

## 8.3 Open points

> **Warning**
>
> * **Transfer of the Data Package.** The OpenAPI file specifies a multipart request; whether a ZIP archive or references to files should also be allowed is not yet decided.
> * **Plain CSV delivery.** A delivery of a CSV file without a Data Package has been proposed but not decided.
> * **Access classes.** Whether the building block maintains its own access classes for datasets and indicators is an open decision (see [Data Access](requirements/data-access.md)).
> * **Address of the JSON-LD context document.** To be defined by the working group.
> * **Registration of the BB code.** The code `analytics` used in problem types, scopes and event types still has to be agreed with the GovStack API Working Group.
