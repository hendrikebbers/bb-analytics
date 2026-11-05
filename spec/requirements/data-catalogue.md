---
title: Data Catalogue
description: |
  The catalogue describes the datasets and indicators of the building block, their versions, schemas,
  code lists and provenance. Data stewards create datasets and register their schemas; consumers and
  open data portals find out what is available and how it is structured.
realises: [pooled-data-foundation, trustworthy-indicators, reusable-statistics]
conformance: CORE
requirements:
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block lists its datasets and indicators with their versions through the catalogue API.
    api_operation_id: listDatasets
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block records for every dataset version its schema, the supplying system and the time of receipt.
    api_operation_id: getDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block lists on GET /v1/datasets/{datasetId}/versions all versions of a dataset with number, schema version, time of receipt, checksum and status, including withdrawn versions and versions whose content was deleted.
    api_operation_id: listDatasetVersions
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns on GET /v1/datasets/{datasetId} the catalogue entry of a dataset with a reference to its current schema, its latest valid version, a reference to all versions and the dependent indicators.
    api_operation_id: getDataset
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns the current Table Schema of a dataset on GET /v1/datasets/{datasetId}/schema.
    api_operation_id: getCurrentSchema
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns every earlier Table Schema of a dataset on GET /v1/datasets/{datasetId}/schema/{schemaVersion}.
    api_operation_id: getSchemaVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block includes the JSON-LD context of this specification, which maps the fields to DCAT 3 and related vocabularies, in the responses of the reading catalogue endpoints.
    api_operation_id: getCatalogue
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block provides at least the mandatory attributes of every object of the base data model through the API.
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block marks every dataset as ORIGINAL or DERIVED.
    api_operation_id: getDataset
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block applies the field role stated in the Table Schema and derives missing roles by convention.
    documentation: |
      Constraint: by convention, key fields are identifiers, a key field with a time type is the time,
      and all other fields are measures.
    api_operation_id: putSchema
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block rejects a schema in which several fields qualify as time and none is explicitly marked as time.
    api_operation_id: putSchema
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block links every derived dataset version through a provenance record to the dataset versions it was produced from.
    api_operation_id: getLineage
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block stores the processing stage of a dataset from a code list defined by the installation and allows the catalogue to be filtered by it.
    api_operation_id: listDatasets
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block generates the code lists of its indicators from the property categories of the fields in the Table Schemas of the input datasets and publishes them in the catalogue and as JSON-stat dimension responses.
    documentation: |
      Constraint: a code list is identified as `<datasetId>.<field>`, and its version is the schema
      version it was taken from.
    api_operation_id: getCodelist
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block reports errors of the catalogue operations according to RFC 9457.
    api_operation_id: putSchema
---

# Data Catalogue

The catalogue is the place where datasets are created and described, and where every consumer finds out which datasets and indicators exist, in which versions, and how they are structured.

## Datasets and schemas

A data steward creates a dataset with `POST /v1/datasets` and registers its schema with `PUT /v1/datasets/{id}/schema`. The schema is a **Table Schema** according to Data Package Standard 2.0; its version is stated in the field `$schema`. Every change to the schema creates a new schema version, and earlier schema versions remain retrievable.

## Origin and processing stage

Every dataset carries two pieces of information that are deliberately different in strictness:

* **Origin** (fixed): `ORIGINAL` means the data was delivered to the building block in this form. `DERIVED` means the building block produced it itself from other dataset versions; the provenance record then names the input versions. This is the only distinction the specification needs for provenance. The building block sets it itself; it is not stated when a dataset is created.
* **Processing stage** (free): a label from a code list that each installation defines, for example _raw / harmonised_, _raw / cleaned / harmonised / aggregated_ or _bronze / silver / gold_. The specification only requires that the stage is visible in the catalogue and can be filtered on.

If data is harmonised outside the building block and the result is delivered, it is `ORIGINAL` with the stage _harmonised_. If the building block harmonises itself, the result is `DERIVED`. Because this version of the specification has no harmonisation rule as an object, the building block knows what a derived version was made from, but not bindingly how.

## Field roles

Every field of a Table Schema has a role: **identifier**, **time**, **measure** or **attribute**. It determines how the building block treats the dataset in calculations and outputs. Convention is the default, an explicit statement takes precedence:

1. If a field carries the property `role` (`identifier`, `time`, `measure`, `attribute`) in the schema, it applies.
2. Otherwise the convention applies: key fields from `primaryKey` are identifiers, a key field with a time type (`year`, `yearmonth`, `date`) is the time, all other fields are measures.
3. If several fields qualify as time by convention, the role must be stated explicitly; otherwise the building block rejects the schema.

> **Warning**
>
> **Open:** whether Data Package Standard 2.0 allows the additional property `role` in a Table Schema is still to be checked.

## Code lists

Permitted codes and their labels are stated in the Table Schema in the property `categories` of Data Package Standard 2.0, as a list of `value` and `label`. From this, the building block generates the code list. Its identifier combines dataset and field (for example `labour_market_regional.region`), and its version is the version of the schema. Every schema change therefore produces a new version of the code list, and every label can be traced back to dataset, field and schema version. Two limits apply: `label` is monolingual, and a code list shared by several datasets is only possible through the optional reference in the indicator definition.

## DCAT through a JSON-LD context

The responses of the reading catalogue endpoints (`GET /v1/catalogue`, `GET /v1/datasets`, `GET /v1/datasets/{id}`, `GET /v1/datasets/{id}/versions`, `GET /v1/indicators`) remain plain JSON with the field names of this specification, but carry an `@context` that refers to a context document of the specification. It maps every field to its term in DCAT 3, DCTERMS or PROV-O. Simple clients can ignore the `@context`; for linked data tools the response is valid DCAT. Requests remain plain JSON without a context.

| Field | Term |
| ----- | ---- |
| `datasetId` | `dct:identifier` |
| `title` | `dct:title` |
| `publisher` | `dct:publisher` |
| `schema` | `dct:conformsTo` |
| `version` | `dcat:version` |
| `versionsHref` | `dcat:hasVersion` |
| `latestVersion` | `dcat:hasCurrentVersion` |
| `receivedAt` | `dct:issued` |
| `suppliedBy` | `prov:wasAttributedTo` |

Fields without a counterpart, such as `indicators`, `origin` or `checksum`, get terms in a namespace of this specification. The address of the context document is defined by the working group.
