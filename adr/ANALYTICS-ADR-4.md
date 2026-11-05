---
title: Record provenance as W3C PROV-O serialised in JSON-LD
status: proposed
date: 2026-11-02
decision-makers:
  - Analytics Working Group
consulted:
  - Architecture Working Group
informed:
  - GovMarket
---
<!-- markdownlint-disable-next-line MD025 -->
# Record provenance as W3C PROV-O serialised in JSON-LD

## Context and Problem Statement

Traceable provenance is the central promise of the Analytics Building Block: for every value it is known which definition version and which dataset versions it was calculated from (see `spec/2-description.md`, 2.1). Every calculation produces exactly one result version and one **provenance record**. The record is kept permanently, also after the underlying data has been deleted or withdrawn, and contains no personal data (see `spec/7-data-structures.md`, 7.2.6). Derived dataset versions have a provenance record as well.

The provenance record is retrieved through `GET /v1/lineage/{id}`. The specification needs a format for it that auditors and other systems can read across products and over many years.

## Decision Drivers

* A standard model of provenance, so that the record can be read without knowing the product that produced it
* Durable: records are kept permanently and must remain understandable long after the product has changed
* Consistent with the catalogue, which already uses DCAT 3 through a JSON-LD context (see ANALYTICS-ADR-2), so that identifiers and terms can be shared
* Readable as plain JSON by clients that do not process linked data
* Describes a completed calculation, not the run-time state of a pipeline

## Considered Options

* **Option 1:** W3C PROV-O, serialised as JSON-LD
* **Option 2:** PROV-JSON
* **Option 3:** OpenLineage
* **Option 4:** A JSON structure defined by this specification

## Decision Outcome

*To be completed by the Analytics Working Group.*

This draft recommends **Option 1**. PROV-O is a W3C Recommendation whose core terms map directly to the provenance record: the calculation is a `prov:Activity` that `prov:used` the input dataset versions, `prov:generated` the result version and was guided by the definition version through `prov:qualifiedAssociation` and `prov:hadPlan`. DCAT 3 already builds on PROV-O, so catalogue and provenance record share one vocabulary, and the JSON-LD serialisation keeps the record readable as JSON.

### Consequences

* `GET /v1/lineage/{id}` returns the provenance record as PROV-O in JSON-LD (see `spec/requirements/data-access.md`)
* The calculation is identified as `urn:analytics:calculation:<calculationId>`; the same identifier names the result version
* Each input dataset version in `prov:used` carries its checksum (`checksum`, a term of this specification), its supplying system (`prov:wasAttributedTo`) and its time of receipt (`dct:issued`)
* The field `suppliedBy` of a dataset version maps to `prov:wasAttributedTo` in the catalogue context as well
* Open: whether the provenance record uses the same JSON-LD context document as the catalogue or a context of its own

### Confirmation

Confirmed by the Analytics Working Group. The outcome is implemented in the Data Access and Data Catalogue requirements, in section 7.2.6 and in the operation `getLineage` and the schema `ProvActivity` of `api/openapi.yaml`.

Amended on 2026-11-03: the API definition was aligned with the [GovStack Cross-BB API Design Guide](https://github.com/jeremi/govstack-api-design-guide) 0.3.0-draft. The path is now `/v1/lineage/{calculationId}` and the dataset version field is `suppliedBy`. The decision for PROV-O in JSON-LD is unchanged.

## Pros and Cons of the Options

### Option 1: PROV-O in JSON-LD

* Good, because it is a W3C Recommendation, stable since 2013, which suits records kept permanently
* Good, because its core model (entity, activity, agent) matches calculation, dataset versions and supplying systems directly
* Good, because DCAT 3 uses PROV-O, so catalogue and provenance record share terms and identifiers
* Good, because JSON-LD lets simple clients read the record as JSON
* Neutral, because the qualified form needed for `prov:hadPlan` is more verbose than the rest of the record
* Bad, because few analytics products produce PROV-O natively, so most implementations need an adaptor

### Option 2: PROV-JSON

* Good, because it is a direct JSON serialisation of the PROV data model
* Bad, because it is only a W3C Member Submission, not a Recommendation
* Bad, because it is not linked data, so it cannot share terms with the DCAT catalogue

### Option 3: OpenLineage

* Good, because many data platforms and orchestrators emit it, and tools such as Marquez collect it
* Good, because it has an active open source community
* Bad, because it models run-time events of jobs and runs in a pipeline, not a permanent record of a completed calculation
* Bad, because its structure follows the tools it was made for and changes with them, which does not suit permanent records
* Neutral, because an implementation may still use OpenLineage internally and derive the PROV-O record from it

### Option 4: Own JSON structure

* Good, because it could be tailored exactly to this building block
* Bad, because auditors and other systems would need knowledge of this specification to read it
* Bad, because it would duplicate a model that a W3C Recommendation already defines

## More information

* [W3C PROV-O](https://www.w3.org/TR/prov-o/)
* [PROV-JSON](https://www.w3.org/submissions/prov-json/)
* [OpenLineage](https://openlineage.io/)
* [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)
