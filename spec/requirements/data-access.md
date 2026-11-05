---
title: Data Access
description: |
  Consuming systems and BI tools read indicator values, provenance records and dataset contents.
  Indicator values are delivered in standard formats (JSON-stat and CSV) with SDMX terms and code
  lists, limited to what the caller is authorised to see.
realises: [reusable-statistics]
conformance: CORE
requirements:
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns the values of an indicator as a JSON-stat 2.0 dataset through the values API.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns the values of an indicator as CSV in long format with the defined columns.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block answers a request to the values API without a format parameter with JSON-stat.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns on GET /v1/indicators/{indicatorId}/values without filters all values of the current result version that the caller is authorised to see.
    api_operation_id: getValues
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block filters the output of the values API with the filter syntax of the SDMX REST API v2 (parameter c) for all dimensions including the time period.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block maps dimensions, codes, labels and values to JSON-stat according to the defined rules.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block includes observation status, definition version and result version in the JSON-stat output.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns the current result version when none is requested and an earlier one on request.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns in JSON-stat only values that the caller is authorised to see.
    api_operation_id: getValues
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block additionally lists its indicators as a JSON-stat collection.
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns on request only the values that have changed since a given point in time (parameter updatedAfter as in SDMX).
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block rejects requests to the values API with unknown or unsupported parameters with an error according to RFC 9457.
    documentation: |
      Condition: this includes filter parameters when the implementation offers no filters, so that a
      client can recognise whether filters are available.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block marks result versions that are based on a withdrawn dataset version with basedOnWithdrawn in the values API.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block uses the SDMX code lists CL_OBS_STATUS for observation status and CL_UNIT_MULT for unit multiplier, and CL_FREQ when it states a frequency.
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block outputs time periods in the SDMX time format (for example 2024, 2024-Q1, 2024-03).
    api_operation_id: getValues
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block returns every provenance record on GET /v1/lineage/{calculationId} in the format W3C PROV-O as JSON-LD, also after underlying data has been deleted or withdrawn.
    api_operation_id: getLineage
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: FILE
    statement: The Analytics Building Block exports a dataset version as a CSV file.
    api_operation_id: exportDatasetVersion
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block accepts latest instead of a version number for the newest version of a dataset.
    api_operation_id: getDatasetVersion
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block checks the authorisation of the caller through the access management of the platform on every access to a dataset or indicator and returns only what the caller is authorised to see.
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block delivers results above a configured size as an asynchronous download.
    api_operation_id: getDownload
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block states in the catalogue the size limit above which it delivers results as an asynchronous download.
    documentation: |
      Condition: the implementation delivers results as asynchronous downloads.
    api_operation_id: getCatalogue
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block states a SHA-256 checksum for every asynchronous download.
    api_operation_id: getDownloadContent
  - status: DRAFT
    level: RECOMMENDED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block reports errors of the provenance, export and download operations according to RFC 9457.
    api_operation_id: getLineage
---

# Data Access

The **values API** is the core access to indicator values. It follows the principle _SDMX as the model, JSON-stat as the format_: terms, code lists and time formats come from SDMX, and values are delivered in two mandatory formats. JSON-stat 2.0 is the default for web applications and dashboards; CSV in long format is meant for Excel, scripts and simple tools. Because JSON-stat has no query language of its own, this specification defines the query itself.

## Query

| Level | Definition |
| ----- | ---------- |
| Format | JSON-stat 2.0, class `dataset` for indicator values; class `collection` for the list of indicators (recommended). |
| Query | `GET /v1/indicators/{indicatorId}/values` without filters returns all values of the current result version. Filters are recommended and follow the SDMX REST API v2: `c[<dimension>]=<codes>` per dimension, also for the time period, with the SDMX operators (for example `c[timePeriod]=ge:2023`). Further parameters: `format` (`jsonstat` as default or `csv`), `resultVersion` (the current one if not stated) and `updatedAfter` (only values changed since that point in time). Unknown or unsupported parameters are rejected with an error according to RFC 9457. |
| Mapping | Fixed rules for mapping indicator, dimensions, values and status to the JSON-stat structure (below). |
| Vocabulary | Observation status and unit multiplier from the SDMX code lists `CL_OBS_STATUS` and `CL_UNIT_MULT`, frequency (if stated) from `CL_FREQ`; time periods in the SDMX time format; code lists of the dimensions from the schemas of the input data, versioned in the catalogue. |
| CSV | CSV according to RFC 4180, UTF-8, comma as delimiter, point as decimal separator; one row per value with fixed columns (below). |

## Mapping to JSON-stat

| JSON-stat element | Content | Base model |
| ----------------- | ------- | ---------- |
| `label` | Title of the indicator | Indicator definition |
| `id`, `size` | Dimensions in the order of the indicator definition, `timePeriod` last; number of codes per dimension | Dimensions of the indicator definition |
| `role` | `time` for `timePeriod`; `geo` for the geographic dimension, if the indicator definition marks one | Indicator definition |
| `dimension.{name}.category` | `index` with the codes, `label` with the labels from the code list | Code lists of the indicator definition |
| `value` | Values in the order of the dimensions, missing values as `null` | Indicator value |
| `status` | Observation status per value, codes from SDMX `CL_OBS_STATUS`, in any of the JSON-stat forms (single string, array or object by position). A value without an entry has the status `A` (normal value) | Observation status of the indicator value |
| `updated` | Calculation time of the result version | Provenance record |
| `extension` | `indicatorId`, `definitionVersion`, `resultVersion`, `unit`, `basedOnWithdrawn` (if the result version is based on a withdrawn dataset version) | Indicator value, provenance record |
| `dimension.{name}.href` | Reference to the code list of the dimension as a JSON-stat dimension response (with version) | Code list in the catalogue |

Example, for the unemployment rate by region:

```http
GET /v1/indicators/ur/values?format=jsonstat&c[region]=R01,R02&c[timePeriod]=2023,2024
```

```json
{
  "version": "2.0",
  "class": "dataset",
  "label": "Unemployment rate",
  "id": ["region", "timePeriod"],
  "size": [2, 2],
  "role": { "time": ["timePeriod"], "geo": ["region"] },
  "updated": "2026-09-30T08:00:00Z",
  "dimension": {
    "region": {
      "label": "Region",
      "category": {
        "index": ["R01", "R02"],
        "label": { "R01": "North region", "R02": "South region" }
      }
    },
    "timePeriod": {
      "label": "Time period",
      "category": { "index": ["2023", "2024"] }
    }
  },
  "value": [3.9, 4.2, 3.4, 3.7],
  "status": { "1": "P", "3": "P" },
  "extension": {
    "indicatorId": "ur",
    "definitionVersion": "2",
    "resultVersion": "c-501",
    "unit": "%"
  }
}
```

Regions, values and identifiers are fictitious. The status `P` is the code for provisional values from the SDMX code list `CL_OBS_STATUS`; the values at positions 0 and 2 have no entry and therefore the status `A`.

## CSV in long format

A query always concerns one indicator, so the columns are fixed by its definition: one row per value, one column per dimension (named as in the indicator definition) and fixed columns for everything else.

| Column | Content |
| ------ | ------- |
| `indicatorId`, `definitionVersion`, `resultVersion` | Identifier of the indicator, version of the definition, result version |
| One column per dimension | Code from the code list of the dimension, in the order of the indicator definition |
| `timePeriod` | Time period in the SDMX time format |
| `value` | Value; empty if missing |
| `observationStatus` | Code from `CL_OBS_STATUS`; stated in every row, including `A` for normal values |
| `unitMultiplier` | Code from `CL_UNIT_MULT` |
| `basedOnWithdrawn` | `true` if the result version is based on a withdrawn dataset version, otherwise `false`; the same in every row |

```csv
indicatorId,definitionVersion,resultVersion,region,timePeriod,value,observationStatus,unitMultiplier,basedOnWithdrawn
ur,2,c-501,R01,2023,3.9,A,0,false
ur,2,c-501,R01,2024,4.2,P,0,false
ur,2,c-501,R02,2023,3.4,A,0,false
ur,2,c-501,R02,2024,3.7,P,0,false
```

## Provenance, export and downloads

* `GET /v1/lineage/{calculationId}` returns the provenance record of a calculation as W3C PROV-O in JSON-LD.
* `GET /v1/datasets/{datasetId}/contents/{version}?format=csv` exports the content of a dataset version as a CSV file.
* Results above a configured size are delivered as an asynchronous download that is polled via `GET /v1/downloads/{downloadId}` and fetched via `GET /v1/downloads/{downloadId}/content`.

## Authorisation

Read permissions are governed by the access management of the platform. The building block returns no data and sends no events that the caller is not authorised for.

> **Warning**
>
> **Open:** whether the building block should maintain its own access classes for datasets and indicators (with the strictest class inherited by indicators and a deliberate release of aggregated values), or leave read permissions entirely to the platform, is not yet decided.
