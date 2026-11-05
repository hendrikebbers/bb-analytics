---
title: Data Ingestion
description: |
  Supplying systems and data stewards deliver dataset versions to the building block. Each delivery
  is validated against the registered schema, acknowledged with a receipt and, if accepted, stored as
  a new, immutable dataset version. Faulty deliveries are corrected by a new delivery or withdrawn by
  a data steward.
realises: [pooled-data-foundation]
conformance: CORE
requirements:
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block accepts a dataset version as a Data Package according to Data Package Standard 2.0 over HTTP through the ingestion API and returns a receipt with a unique identifier.
    api_operation_id: deliverDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block accepts Data Packages and Table Schemas according to Data Package Standard 2.0 that state their version in the field $schema.
    api_operation_id: deliverDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block rejects a delivery that does not conform to the registered schema and names the violated rule.
    api_operation_id: getReceipt
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block numbers the dataset versions of a dataset consecutively starting at 1 and states dataset and version number as separate values in receipts and events.
    documentation: |
      Constraint: where a single identifier is needed, it is written `<datasetId>:<version>`.
    api_operation_id: getReceipt
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block sets the origin of a dataset itself, ORIGINAL for everything received through data ingestion and DERIVED for versions it produces itself.
    api_operation_id: createDataset
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block withdraws a dataset version on POST /v1/datasets/{datasetId}/versions/{version}/withdraw with a stated reason by deleting its content and keeping its metadata with the status WITHDRAWN and the reason.
    api_operation_id: withdrawDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block allows only data stewards, not supplying systems, to withdraw a dataset version.
    api_operation_id: withdrawDatasetVersion
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: FILE
    statement: The Analytics Building Block accepts a dataset version delivered as a CSV file.
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: FILE
    statement: The Analytics Building Block accepts a dataset version delivered as a JSON Lines file with one JSON object per line.
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block accepts text formats encoded in UTF-8.
    api_operation_id: deliverDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: FILE
    statement: The Analytics Building Block accepts CSV files with and without a UTF-8 byte order mark.
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: FILE
    statement: The Analytics Building Block applies the CSV delimiter stated in the Table Dialect of a resource and uses the comma according to RFC 4180 when none is stated.
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns the original receipt instead of creating a second dataset version when a delivery is repeated with the same value in the Idempotency-Key header.
    api_operation_id: deliverDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block leaves the content of an accepted dataset version unchanged.
    documentation: |
      Constraint: the content may only be removed as a whole, by withdrawal or by an operational
      deletion or anonymisation rule; corrections are delivered as a new dataset version.
    api_operation_id: getDatasetVersion
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block reports errors of the ingestion operations according to RFC 9457.
    api_operation_id: deliverDatasetVersion
---

# Data Ingestion

Before a supplying system can deliver, the dataset must exist in the catalogue with a registered schema (see [Data Catalogue](data-catalogue.md)). The supplying system can retrieve that schema to check its data in advance.

## Delivery

A dataset version is delivered as a **Data Package** according to Data Package Standard 2.0. The package is the envelope, the Table Schema is the basis for validation, and the data file itself may be CSV or JSON Lines. Every package and every schema states its version in the field `$schema` (for example `https://datapackage.org/profiles/2.0/tableschema.json`).

The delivery is answered with `202 Accepted` and a **receipt**. Validation runs asynchronously; the receipt has the status `VALIDATING`, `ACCEPTED` or `REJECTED`. An accepted receipt names the new dataset version and its checksum. Supplying systems can poll the receipt or subscribe to the event `delivery.checked` instead (see [Publication Events](publication-events.md)). Polling is optional: the building block validates, creates the dataset version and sends its events whether or not the receipt is ever retrieved.

The header `Idempotency-Key` prevents a duplicate version if a delivery is repeated after a network error.

> **Warning**
>
> **Open:** how the Data Package is transferred over HTTP (multipart request, ZIP archive or references to files) is not yet decided. It belongs in the OpenAPI definition.

## Formats and character encoding

* Every implementation accepts text formats in UTF-8. Further encodings may be supported in addition; they are not part of this specification.
* The encoding of a delivery is stated in the HTTP header (`Content-Type: text/csv; charset=utf-8`) or in the field `encoding` of the Data Package. Without a statement, UTF-8 applies. JSON Lines is always UTF-8 by its own specification.
* For CSV, the comma according to RFC 4180 is the default. Another delimiter, such as the semicolon of German Excel exports, can be stated in the Table Dialect of the resource (field `dialect`). A byte order mark at the start of the file, as Excel produces it, is allowed.

## Correction and withdrawal

Dataset versions are immutable. There are two ways of dealing with faulty deliveries, depending on whether the data is merely wrong or should never have arrived:

* **Correction.** Wrong but harmless data, such as a wrong reference date or a typo, is replaced by a corrected delivery. It becomes the next version, `latest` points to it, and the next calculation produces a new result version. The faulty version and the result versions based on it remain part of the history.
* **Withdrawal.** Data that should never have arrived, such as the wrong dataset, test data or personal data delivered by mistake, is withdrawn by a data steward with `POST /v1/datasets/{id}/versions/{v}/withdraw` and a reason. The building block deletes the content, keeps the metadata with the status `withdrawn` and the reason, and sends `dataset.version.withdrawn`. `latest` and new calculations skip the version. Result versions based on it remain retrievable but are marked `basedOnWithdrawn` in the values API; a new calculation with the last valid version restores the correct state. Supplying systems cannot withdraw.
