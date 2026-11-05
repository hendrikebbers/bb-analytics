---
title: Use Data Package Standard 2.0 to describe datasets and deliver their versions
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
# Use Data Package Standard 2.0 to describe datasets and deliver their versions

## Context and Problem Statement

The Analytics Building Block can hold any number of datasets, from any domain: benefit payments from a social registry, enrolment figures from an education system, labour market data from a statistics office. Indicators are calculated from these datasets (see `spec/requirements/indicator-calculation.md`). Which datasets an installation holds is not fixed by this specification; data stewards create them at run time.

Analytics on such data is only trustworthy if every dataset is **described**. Without a description, data is collected "wild", without a schema: a field changes its type from one delivery to the next, a code appears that nobody knows, a mandatory value is missing, and an indicator silently calculates something different from what its definition says. The building block must therefore know for every dataset which fields it has, what type each field has, which fields are mandatory, which fields form the key and which codes are permitted. It must check every delivery against this description and reject what does not conform (see `spec/requirements/data-ingestion.md`). The description is also the source of field roles and code lists (see `spec/requirements/data-catalogue.md`).

This description must be **generic**. It must work for any dataset without a model per domain, and it must not be tied to a particular way of storing data. This specification deliberately prescribes no architecture (see `spec/2-description.md`, 2.2): an implementation may store datasets in a relational database, a column store, a data lake or a lakehouse. A description in the form of SQL table definitions, a database-specific schema or the schema of a particular file format would bind every implementation and every supplier to that technology. The description has to state what the data means and how it is structured, not how it is stored.

The specification therefore needs two things that must fit together:

* a **schema language** for datasets: fields, types, mandatory fields, keys and permitted codes, independent of any storage technology, and
* an **envelope** for a delivery: data files plus a machine-readable description that refers to that schema.

Suppliers range from national registries to small authorities whose only export is a spreadsheet saved as CSV. The format must work for both, and an implementation must be able to validate deliveries with existing tools rather than with code written for this building block.

## Decision Drivers

* Every dataset is described by a schema; no data is accepted without one
* The schema language is generic: it describes any dataset without a domain model of this specification
* The schema language is independent of storage technology and query language, in particular not tied to SQL
* Suppliers with little digitalisation can deliver CSV, including Excel exports with a semicolon delimiter and a byte order mark
* One schema language for validation, field roles and code lists, so that the catalogue does not hold a second description of the same data
* Open validators and libraries exist in common languages, so that implementations and suppliers can check deliveries before they are sent
* The format states its own version, so that a later version of the standard can be adopted without breaking existing deliveries
* Not tied to statistics: datasets are raw input data from registries, not yet statistical cubes

## Considered Options

* **Option 1:** Data Package Standard 2.0 (Data Package, Data Resource, Table Schema, Table Dialect)
* **Option 2:** W3C CSV on the Web (CSVW)
* **Option 3:** JSON Schema for the records, with an envelope defined by this specification
* **Option 4:** SDMX-CSV with an SDMX Data Structure Definition
* **Option 5:** SQL table definitions (`CREATE TABLE`)

## Decision Outcome

*To be completed by the Analytics Working Group.*

This draft recommends **Option 1**. Table Schema describes a dataset by its logical structure, fields, types, constraints, keys and permitted codes, without any reference to how or where it is stored. Data Package 2.0 covers schema language and envelope in one standard, is designed around CSV, and describes delimiters and encodings in the Table Dialect, which is exactly what deliveries from spreadsheets need. Table Schema provides types, `primaryKey` and `categories`, from which the building block derives field roles and code lists without a second schema. Every package and schema states its version in `$schema`.

### Consequences

* Deliveries are Data Packages; the data file of a resource is CSV or JSON Lines (see `spec/requirements/data-ingestion.md`)
* The registered schema of a dataset is a Table Schema, versioned by the building block (see `spec/7-data-structures.md`, 7.2.3)
* Code lists are generated from the `categories` of the Table Schema; their labels are monolingual, because `categories` allows only one `label`
* Open: whether the additional field property `role` is permitted by Data Package Standard 2.0, or must move into a namespaced property
* Open: how the unit of a field is stated, since Table Schema has no standard property for it
* Open: how the Data Package is transferred over HTTP (multipart request, ZIP archive or references to files), and whether a plain CSV delivery without a package is allowed (`spec/10-other-resources.md`, open decisions)

### Confirmation

Confirmed by the Analytics Working Group. The outcome is implemented in the requirements of Data Ingestion and Data Catalogue, in section 7.2.3 and in the operations `deliverDatasetVersion` and `putSchema` of `api/openapi.yaml`.

## Pros and Cons of the Options

### Option 1: Data Package Standard 2.0

* Good, because envelope and schema language come from one standard
* Good, because it is built around CSV, and the Table Dialect describes delimiter, quoting and encoding of real-world exports
* Good, because `categories` and `primaryKey` give the building block code lists and field roles without a second description
* Good, because open validators exist (for example the Frictionless libraries for Python and JavaScript) and suppliers can check deliveries in advance
* Good, because every document states its profile and version in `$schema`
* Neutral, because version 2.0 (2024) is recent and not every tool supports it yet; version 1 documents can be distinguished by their `$schema`
* Bad, because there is no standard property for a unit or for the role of a field, so the specification has to add or define them

### Option 2: W3C CSV on the Web (CSVW)

* Good, because it is a W3C Recommendation and links columns to RDF vocabularies
* Good, because it describes CSV dialects and column types
* Bad, because it covers only CSV, so JSON Lines deliveries would need a second schema language
* Bad, because tool support is thin and has hardly developed since 2015
* Bad, because its RDF orientation adds complexity that suppliers with little digitalisation do not need

### Option 3: JSON Schema with an own envelope

* Good, because JSON Schema is widely known and has validators in every language
* Bad, because it describes JSON documents, not tables: CSV deliveries would have to be converted before validation
* Bad, because there is no standard for keys, CSV dialects or code lists with labels, so the specification would define its own envelope and conventions

### Option 4: SDMX-CSV with a Data Structure Definition

* Good, because it is the international standard for statistical data and fits the SDMX model used for indicators
* Bad, because a DSD describes a statistical cube with dimensions and measures, not arbitrary raw data from a registry
* Bad, because creating and maintaining DSDs needs specialised tools and knowledge that most suppliers lack

### Option 5: SQL table definitions

* Good, because every relational database understands them, and many data stewards know SQL
* Bad, because it ties the description to relational storage, while this specification prescribes no architecture
* Bad, because types, constraints and syntax differ between SQL dialects, so a definition is not portable even between relational databases
* Bad, because there is no standard way to state permitted codes with labels, or to validate a CSV file against a definition without loading it into a database
* Bad, because suppliers without a database would have to understand database definitions to check their deliveries

## More information

* [Data Package Standard 2.0](https://datapackage.org/)
* [W3C CSV on the Web](https://www.w3.org/TR/tabular-data-primer/)
* `spec/5-cross-cutting-requirements.md`, 5.3.1
