---
title: Map the catalogue to DCAT 3 through a JSON-LD context
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
# Map the catalogue to DCAT 3 through a JSON-LD context

## Context and Problem Statement

The catalogue of the Analytics Building Block describes datasets, their versions and schemas, and the indicators based on them (see `spec/requirements/data-catalogue.md`). Two groups of consumers read it:

* business applications and dashboards, which want plain JSON with stable field names, and
* open data portals and linked data tools, which expect a standard catalogue vocabulary.

The catalogue is versioned at its core: every delivery creates a new, immutable dataset version, and consumers must be able to find the current version and all earlier ones. The specification needs a vocabulary for these attributes that portals understand, without forcing every client to process RDF.

## Decision Drivers

* Plain JSON responses for simple clients, without RDF knowledge
* A standard vocabulary for datasets and their versions, so that the catalogue can be read by open data portals without a mapping per product
* Versioning of datasets expressed in the vocabulary itself, not only in fields of this specification
* No separate vocabulary invented for terms that already exist
* The core stays small: a full catalogue output for open data portals is not required in this version

## Considered Options

* **Option 1:** DCAT 3 terms, linked to plain JSON responses through a JSON-LD context
* **Option 2:** Full DCAT-AP output as RDF (Turtle, RDF/XML or JSON-LD documents)
* **Option 3:** schema.org `Dataset`
* **Option 4:** Field names defined only by this specification, without a vocabulary

## Decision Outcome

*To be completed by the Analytics Working Group.*

This draft recommends **Option 1**. DCAT 3 is the first version of DCAT that models versions (`dcat:version`, `dcat:hasVersion`, `dcat:hasCurrentVersion`), which matches the immutable dataset versions of this building block. A JSON-LD context gives the field names of this specification a meaning in DCAT 3 and related vocabularies, while the responses remain plain JSON: simple clients ignore the `@context`, linked data tools read valid DCAT.

### Consequences

* The reading catalogue endpoints (`GET /v1/catalogue`, `GET /v1/datasets`, `GET /v1/datasets/{id}`, `GET /v1/datasets/{id}/versions`, `GET /v1/indicators`) carry an `@context` that refers to a context document of this specification
* The context maps fields to DCAT 3, DCTERMS and PROV-O terms (see the mapping table in `spec/requirements/data-catalogue.md`); fields without a counterpart, such as `indicators`, `origin` or `checksum`, get terms in a namespace of this specification
* Dataset and dataset version are named after DCAT 3 properties in the base model (see `spec/7-data-structures.md`)
* Requests remain plain JSON without a context
* A full DCAT-AP catalogue for open data portals is not part of this version
* Open: the address of the JSON-LD context document, which the working group defines

### Confirmation

Confirmed by the Analytics Working Group. The outcome is implemented in the Data Catalogue requirements, in the base model of section 7 and in the `@context` of the catalogue schemas in `api/openapi.yaml`.

Amended on 2026-11-03: the API definition was aligned with the [GovStack Cross-BB API Design Guide](https://github.com/jeremi/govstack-api-design-guide) 0.3.0-draft. Paths now carry the major version (`/v1/...`), field names are camelCase, and datasets and indicators are listed through the paginated collections `GET /v1/datasets` and `GET /v1/indicators`, which carry the `@context` as well. The decision for DCAT 3 through a JSON-LD context is unchanged.

## Pros and Cons of the Options

### Option 1: DCAT 3 through a JSON-LD context

* Good, because clients that do not need linked data see plain JSON and are not affected
* Good, because DCAT 3 models versions of datasets, which DCAT 2 does not
* Good, because DCAT is the vocabulary of open data portals, and DCAT-AP is an application profile of it, so a later full output builds on the same terms
* Good, because one context document serves every implementation, and the mapping is fixed by the specification, not by each product
* Neutral, because the context document has to be published and kept stable at a permanent address
* Bad, because a response is valid DCAT only as far as the context maps its fields; fields in the namespace of this specification are unknown to portals

### Option 2: Full DCAT-AP output as RDF

* Good, because open data portals in Europe can harvest it directly
* Bad, because every client would need RDF processing, or the specification would need two parallel outputs
* Bad, because DCAT-AP adds mandatory properties and controlled vocabularies of the European Union that do not apply in every GovStack country
* Bad, because it enlarges the core for a use case that not every installation has

### Option 3: schema.org Dataset

* Good, because search engines understand it and it can be embedded in web pages
* Bad, because it has no model for versions of a dataset comparable to DCAT 3
* Bad, because open data portals and statistics offices use DCAT, not schema.org, as their catalogue vocabulary

### Option 4: No vocabulary

* Good, because it is the simplest option for implementations and clients
* Bad, because every portal or linked data tool would need its own mapping per product
* Bad, because the specification would define terms that already exist in a W3C Recommendation

## More information

* [DCAT 3](https://www.w3.org/TR/vocab-dcat-3/), in particular the section on versioning
* [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)
* [DCAT-AP](https://semiceu.github.io/DCAT-AP/)
* ANALYTICS-ADR-4 (PROV-O), whose terms the same context uses
