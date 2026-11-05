# 6 Functional Requirements

The functional requirements of the Analytics Building Block are organised by functionality. Each functionality from [Section 4](4-key-digital-functionalities.md) has its own file in the folder `requirements/`. The file carries the requirements in its YAML front matter and describes the functionality, its workflows and its data structures in the body.

> **Note**
>
> This form follows the GovSpecs 2.0 requirements model (ARCH-ADR-5 for status and level, ARCH-ADR-7 for core and extensions). These decision records are proposed and not yet decided; the `interaction` classifier has not yet been discussed by the Architecture Working Group.

## 6.1 Functionalities

### Core

Every conformant solution meets all REQUIRED requirements of these functionalities.

* [Data Ingestion](requirements/data-ingestion.md)
* [Data Catalogue](requirements/data-catalogue.md)
* [Indicator Calculation](requirements/indicator-calculation.md)
* [Data Access](requirements/data-access.md)
* [Publication Events](requirements/publication-events.md)

### Extensions

The extensions declared in [`metadata.yml`](metadata.yml) have no requirements yet in this version (see [Section 4.2](4-key-digital-functionalities.md)).

## 6.2 Form of a requirement

Each requirement is a single, verifiable statement whose subject is the Analytics Building Block. Conditions and constraints that do not fit into one sentence are given in `documentation`.

```yaml
---
title: Data Ingestion                 # as in the table of functionalities in Section 4
description: |                        # business view, no requirements language
  Supplying systems and data stewards deliver dataset versions ...
realises: [pooled-data-foundation]    # capability ids from metadata.yml
conformance: CORE                     # CORE | EXTENSION
extension:                            # extension id from metadata.yml, only for EXTENSION
requirements:
  - status: DRAFT
    level: REQUIRED
    observability: OBSERVABLE
    interaction: SERVICE_API
    statement: The Analytics Building Block rejects a delivery that does not conform to the registered schema and names the violated rule.
    documentation:
    api_operation_id: getReceipt      # operation in api/openapi.yaml
---
```

| Field | Values | Meaning |
| ----- | ------ | ------- |
| `id` | number | Issued when the requirement is accepted; drafts have no `id`. Numbers are never reused. |
| `status` | `DRAFT`, `CANDIDATE`, `ACCEPTED`, `WITHDRAWN`, `PUBLISHED`, `DEPRECATED` | Life cycle of the requirement. Only `PUBLISHED` requirements take part in compliance. |
| `level` | `REQUIRED`, `RECOMMENDED` | A solution failing a REQUIRED requirement is not compliant; for RECOMMENDED requirements GovMarket reports the share met. |
| `observability` | `OBSERVABLE`, `AUDITABLE` | Verified from outside the running system, or by inspecting evidence listed in `documentation`. |
| `mutability` | `IMMUTABLE`, `EXTENSIBLE`, `REPLACEABLE`, `INAPPLICABLE` | What an extending specification, such as a domain profile, may do with the requirement. Default: `REPLACEABLE`. |
| `interaction` | `SERVICE_API`, `CONSUMED_API`, `PROTOCOL`, `EVENT`, `FILE`, `INTERNAL`, … | Across which boundary the requirement is exercised. `SERVICE_API` requirements name their operation in `api_operation_id`. |

All requirements of this version are drafts (`status: DRAFT`) and therefore have no number yet.

## 6.3 Building Block Components

This specification deliberately prescribes no internal components or architecture (see [Section 2.2](2-description.md)). A conformant solution may be built on a relational database, an analytical column store, a data warehouse, a lakehouse, an SDMX platform or any other approach, as long as it provides the interfaces and keeps dataset versions unchanged.

From the outside, the building block presents the following interface areas. They correspond to the tags of the [OpenAPI definition](8-service-apis.md):

| Interface area | Functionality |
| -------------- | ------------- |
| Ingestion | Data Ingestion |
| Catalogue | Data Catalogue |
| Indicators | Indicator Calculation |
| Values, Provenance, Export | Data Access |
| Events | Publication Events |
