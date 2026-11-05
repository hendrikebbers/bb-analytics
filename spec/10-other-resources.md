# 10 Other Resources

## 10.1 Cross-Building Block Workflows

No cross-building block workflows have been defined for the Analytics Building Block yet. The workflows of the building block itself, including its use of the Identity BB, the Information Mediator and the Scheduler BB, are described in [Section 9](9-workflows.md).

Neighbouring building blocks:

| Building Block | Relationship |
| -------------- | ------------ |
| Identity BB | Issues the tokens of all callers (core, via the cross-functional requirements) |
| Information Mediator | Carries deliveries across organisational boundaries (core, via the cross-functional requirements) |
| Scheduler BB | Starts calculations on a schedule (optional in the core) |

The specifications are published at [specs.govstack.global](https://specs.govstack.global/).

## 10.2 Key Decision Log

The following decisions shape this version of the specification.

The choice of the central standards is recorded in architecture decision records in the folder [`adr/`](../adr/):

| ADR | Decision |
| --- | -------- |
| [ANALYTICS-ADR-1](../adr/ANALYTICS-ADR-1.md) | Data Package Standard 2.0 to describe datasets and deliver their versions |
| [ANALYTICS-ADR-2](../adr/ANALYTICS-ADR-2.md) | DCAT 3 for the catalogue, linked through a JSON-LD context |
| [ANALYTICS-ADR-3](../adr/ANALYTICS-ADR-3.md) | JSON-stat 2.0 as output format for indicator values, with SDMX as the model |
| [ANALYTICS-ADR-4](../adr/ANALYTICS-ADR-4.md) | W3C PROV-O in JSON-LD for the provenance record |
| [ANALYTICS-ADR-5](../adr/ANALYTICS-ADR-5.md) | CloudEvents 1.0 for publication events |

All of them are proposed and not yet decided by the working group. Further decisions:

| Decision | Rationale |
| -------- | --------- |
| **Results, not architecture.** The specification describes datasets, indicators and their values instead of a lakehouse or any other architecture. | Interchangeability: a contract built on results stays the same across products and architectures (see [Section 2.2](2-description.md)). |
| **Small core first.** This version specifies only the core; extensions are declared in `metadata.yml` but not yet specified. | The core remains achievable for small installations; extensions are specified in later versions. |
| **Source Reconciliation is an extension.** | A conformant product with only one data source legitimately does not need it. This is the most important deviation from the original proposal (see 10.3). |
| **Structure of the indicator definition follows SDMX** (Data Structure Definition and Dataflow). The calculation states its language; there is no mandatory language, VTL 2.1 and Apache Ossie are recommended. | Definitions are only portable between products sharing a language, but inputs and outputs stay interchangeable regardless. |
| **Output formats: JSON-stat and CSV in the core**, terms and code lists from SDMX. | SDMX as the model, JSON-stat as the format: simple for web clients, consistent with official statistics. |
| **Provenance is core, exact recalculation is an extension.** | No widely used product offers guaranteed recalculation today; provenance is achievable for every implementation. |
| **Harmonisation via origin and processing stage** (provisional). The core distinguishes `ORIGINAL`/`DERIVED` and a free processing stage, without prescribing a procedure. | Keeps the core independent of harmonisation methods. |
| **One identifier for calculation, result version and provenance record.** | A calculation produces exactly one result version and one provenance record; values only refer to their result version. |
| **Correction by new delivery, withdrawal by data stewards.** | Dataset versions stay immutable; dependent result versions are marked instead of silently changed. |
| **Event catalogue with fixed types, triggers and contents**, as CloudEvents 1.0, containing no data values. | Subscribers can rely on the events across products; events do not leak data. |

## 10.3 Future Considerations

### Open decisions

1. **Source Reconciliation: core or extension?** As core it would be the distinguishing feature of the building block but would exclude simple products; as an extension the core stays small. This specification follows the recommendation to make it an extension; the working group still has to decide.
2. **Specification format.** Classic building block template or GovSpecs 2.0 with capabilities and extensions. This specification uses the classic chapters together with the GovSpecs 2.0 requirements model, which is not yet decided (ARCH-ADR-5, ARCH-ADR-6, ARCH-ADR-7, ARCH-TDR-1).
3. **Access control.** Whether the building block maintains its own access classes for datasets and indicators, with the strictest class inherited by indicators and a deliberate release of aggregated values, or leaves read permissions entirely to the access management of the platform. Own classes make it traceable why a figure from confidential data may be public, but require a common classification model. Until this is decided, the specification only requires that the building block returns nothing and sends no events the caller is not authorised for.
4. **Signature method for events.** Required, but not yet named.
5. **Transfer of the Data Package** (multipart request, ZIP archive or references to files), and whether a plain CSV delivery without a Data Package is allowed.
6. **Field properties in Table Schema.** Whether Data Package Standard 2.0 allows the additional property `role`, and how the unit of a field is stated.
7. **Address of the JSON-LD context document** for the catalogue responses.

### Candidate products

A product like the .Stat Suite of the SIS-CC community is already SDMX-based and would need an adaptor for the values API. The stack of the earlier reference implementation (Airflow, ClickHouse, Superset) would need an API adaptor for ingestion, catalogue and the values API. Both are permitted under the GovStack adaptor model.

### Domain profiles

Domain-specific models, such as a climate profile (IPCC categories, UNFCCC tables) or an education profile, are expected as separate, small specifications that extend the Analytics Building Block. This keeps the core domain-neutral, and the domain groups can maintain their own models.

### Next steps

* Prepare decision 1 (Source Reconciliation) for the working group.
* Discuss the core/extension split with the authors of the original proposal (ITU, INA Digital Edu) before it goes to the working group.
* Complete the OpenAPI definition of the core.
* Check whether the .Stat Suite is suitable as a candidate product.
