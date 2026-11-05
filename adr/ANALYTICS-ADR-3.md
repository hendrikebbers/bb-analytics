---
title: Deliver indicator values as JSON-stat 2.0, with SDMX as the model
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
# Deliver indicator values as JSON-stat 2.0, with SDMX as the model

## Context and Problem Statement

The values API is the core access to indicator values (see `spec/requirements/data-access.md`). Its consumers are dashboards, web applications, business applications and analysts using scripts or spreadsheets. An indicator value is a statistical observation: a value for a combination of dimension codes and a time period, with an observation status, a unit and code lists with labels.

The structure of indicators already follows SDMX (Data Structure Definition and Dataflow, see `spec/7-data-structures.md`, 7.2.4), including the code lists `CL_OBS_STATUS`, `CL_UNIT_MULT` and `CL_FREQ` and the SDMX time format. The specification needs an output format for these values that web clients can process easily and that is consistent with official statistics.

## Decision Drivers

* Easy to consume in web applications and dashboards, without an SDMX library
* Dimensions, codes, labels, values and status in one response, so that a client can render a table or chart without further calls
* Consistent with the SDMX model used for indicator definitions and code lists
* Existing client libraries, so that consumers do not write parsers for this building block
* A second, simple format for spreadsheets and scripts

## Considered Options

* **Option 1:** JSON-stat 2.0 as default format, CSV in long format as second mandatory format
* **Option 2:** SDMX-JSON 2.0 as default format
* **Option 3:** CSV only
* **Option 4:** A JSON structure defined by this specification

## Decision Outcome

*To be completed by the Analytics Working Group.*

This draft recommends **Option 1**, following the principle *SDMX as the model, JSON-stat as the format*. JSON-stat 2.0 represents a statistical cube compactly, with dimensions, categories, labels, values and status in one document, and is used by statistics offices for their web APIs. Because JSON-stat has no query language of its own, the values API takes its filter syntax from the SDMX REST API v2. CSV in long format serves spreadsheets and scripts.

### Consequences

* `GET /v1/indicators/{indicatorId}/values` returns a JSON-stat 2.0 dataset by default and CSV on request (`format=csv`)
* The mapping of indicator, dimensions, values and status to JSON-stat is fixed by this specification (see the mapping table in `spec/requirements/data-access.md`)
* Values that JSON-stat does not provide for, such as `indicatorId`, `definitionVersion`, `resultVersion`, `unit` and `basedOnWithdrawn`, are carried in the JSON-stat property `extension`
* Code lists are additionally published as JSON-stat dimension responses
* Indicators may additionally be listed as a JSON-stat collection (recommended)
* The full SDMX REST interface is not part of this version

### Confirmation

Confirmed by the Analytics Working Group. The outcome is implemented in the Data Access requirements, in section 7.2.5 and in the operation `getValues` and the schema `JsonStatDataset` of `api/openapi.yaml`.

Amended on 2026-11-03: the API definition was aligned with the [GovStack Cross-BB API Design Guide](https://github.com/jeremi/govstack-api-design-guide) 0.3.0-draft. The path is now `/v1/indicators/{indicatorId}/values`, and the fields in `extension` and the CSV columns are camelCase. The decision for JSON-stat 2.0 and SDMX is unchanged.

## Pros and Cons of the Options

### Option 1: JSON-stat 2.0 and CSV

* Good, because a single response carries everything a dashboard needs to render values with labels
* Good, because client libraries exist (for example JSON-stat Toolkit for JavaScript, pyjstat for Python, rjstat for R)
* Good, because statistics offices already use it for their web APIs, so consumers may know it
* Good, because CSV in long format covers spreadsheets and scripts with the same columns for every indicator
* Neutral, because it has no query language, so the filter syntax is taken from SDMX
* Bad, because fields specific to this building block have to go into `extension`, which generic JSON-stat clients ignore
* Bad, because JSON-stat is maintained by a small open project, not by a standards body

### Option 2: SDMX-JSON 2.0

* Good, because it is part of the SDMX standard and fits the model of the indicators exactly
* Good, because statistics offices and international organisations can consume it directly
* Bad, because the structure is considerably more complex, and web clients need an SDMX library or own code
* Bad, because structure and data are often split across messages, so a dashboard needs more calls

### Option 3: CSV only

* Good, because every tool can read it
* Bad, because labels, code lists and status cannot be carried in one self-describing document
* Bad, because web applications would have to fetch and join structure information themselves

### Option 4: Own JSON structure

* Good, because it could be tailored exactly to this building block
* Bad, because every consumer would need its own parser
* Bad, because it contradicts the aim of standard interfaces that do not depend on a particular product

## More information

* [JSON-stat 2.0](https://json-stat.org/full/)
* [SDMX 3.0](https://sdmx.org/) and [SDMX REST API v2](https://github.com/sdmx-twg/sdmx-rest)
* `spec/5-cross-cutting-requirements.md`, 5.3.1
