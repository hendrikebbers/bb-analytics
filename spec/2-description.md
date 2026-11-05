# 2 Description

This specification describes the Analytics Building Block as an **indicator service with traceable provenance**. A conformant solution accepts datasets from registries and other government systems, calculates versioned key figures from them (called _indicators_) and makes both available through a stable, standards-based contract. For every value it publishes, it records which definition and which data the value was derived from.

**Purpose.** Public authorities get key figures whose sources and calculation can be shown and checked. Other systems, such as dashboards, open data portals or case management applications, can use these figures without depending on a particular product.

## 2.1 Indicators and the indicator service

An **indicator** is a precisely defined key figure with a unit and dimensions, for example _"share of households receiving benefits, by district and quarter"_ or _"unemployment rate, by region and year"_.

The **indicator service** is the software that provides such figures reliably. It does four things:

1. **Accept data.** It takes in the datasets that indicators are calculated from, validates each delivery against a registered schema and stores it as a new, immutable dataset version.
2. **Calculate indicators.** For every indicator it holds a versioned definition of how the indicator is calculated, and it produces the indicator values from that definition.
3. **Store and version results.** Every calculation result is stored as its own, immutable result version. Queries return the latest result by default, and earlier results remain retrievable. Because indicator values are aggregated and contain no personal data, they are not subject to the retention limits of the underlying data.
4. **Deliver results.** It provides indicator values and datasets through standard interfaces and announces new versions as events.

### Versioned indicators

Versioning applies at two levels:

* **Definitions are versioned.** If the formula, unit, scope or a dimension changes (for example new district boundaries), a new definition version is created. The previous definition remains available unchanged, and values calculated with it stay linked to it.
* **Values are versioned.** When corrected or late data arrives, a new result version is created instead of overwriting earlier figures. This keeps visible which figure was published at which point in time, which matters for revisions and for decisions that were based on an earlier state.

_Example:_ the rate for the second quarter is published in July as 12.4 %. After late reports, the result version from September shows 12.9 %. Both remain retrievable, and each one refers to the dataset versions it was calculated from.

### Traceable provenance

Traceable provenance means that for every value it is known which definition version and which dataset versions it was calculated from. The building block keeps this provenance record permanently, even after the underlying data has been deleted or anonymised. The record itself contains no personal data.

A guarantee that a recalculation produces exactly the same value goes further than provenance and is not part of this version.

## 2.2 Results, not architecture

Earlier drafts of this specification described the building block as a data lakehouse, that is, through one particular way of building it. A lakehouse is only one of many ways to store and evaluate analytical data. This specification does not prescribe an architecture. It describes results: what goes in and what comes out. That is why the **indicator definition** is at the centre: a binding, versioned description of how a key figure is calculated from which data.

The main reason is interchangeability, which is exactly what GovStack tests. If the contract is tied to an architecture, consumers depend on its table structures and query language, and switching products breaks their applications. A contract built on datasets, indicators and their values stays the same across products and architectures.

Possible implementations range, roughly from small to large, over the following approaches. "Big data" is not an architecture of its own but a property of the data (volume, velocity, variety); the technologies for it are mostly found in data lakes and lakehouses.

| Approach | Core idea | Good fit for | Points to note for the core |
| -------- | --------- | ------------ | --------------------------- |
| Relational database with calculation scripts | One database (e.g. PostgreSQL), indicators as versioned queries or scripts | Small statistics offices, few data sources | Limited scaling; versioning has to be built |
| Analytical column store | A database optimised for analysis (e.g. ClickHouse, DuckDB) | Medium to large volumes, fast dashboards | Immutable dataset versions are a matter of discipline, not built in |
| Data warehouse | Data is cleaned on load and brought into fixed structures (e.g. star schema) | Established, stable key figures; exists in many administrations | Rigid with new sources; history handling well solved |
| Data lake | Raw data as files on low-cost storage, structure applied on read | Very large or unstructured volumes (satellite data, logs) | Hard to control without an additional layer |
| Lakehouse | Data lake plus table formats with transactions and time travel | Large countries, many sources, data science | Heavy infrastructure; time travel helps reproducibility |
| SDMX statistics platform | Specialised software for publishing statistics (e.g. .Stat Suite) | Statistics offices, international reporting obligations | Strong on output, weaker on accepting arbitrary raw data |
| Data virtualisation | No central copy; queries run directly against source systems | Quick start without moving data | Reproducibility only with snapshots, because sources change |
| Data mesh | More an organisational than a technical model: each authority runs its data as a "product" under common rules | Federal or strongly decentralised administrations | Needs a common contract, otherwise silos reappear |

Each of these approaches can fulfil the core, as long as it provides the interfaces and keeps dataset versions unchanged; the difference lies in the effort required. The data mesh case shows the strength of the indicator approach most clearly: if each authority runs its own instance, the common contract ensures that key figures are defined and queried the same way everywhere.

## 2.3 Capabilities

Three capabilities describe what the core makes possible. They are informative and do not name any technology. Extensions bring further capabilities (see 2.4).

| ID | Capability | Description | Realised by |
| -- | ---------- | ----------- | ----------- |
| `pooled-data-foundation` | Pooled data foundation | Different authorities and business applications store statistically relevant data in one shared, validated and access-controlled place, instead of each building its own data collection. | Core |
| `trustworthy-indicators` | Trustworthy indicators | Decision makers use indicator values whose sources and calculation are traceable. | Core |
| `reusable-statistics` | Reusable statistics | Other systems and open data portals use the datasets and indicators of this building block without depending on a particular product. | Core |

The core consists of five functionalities: **data ingestion**, **data catalogue**, **indicator calculation**, **data access** and **publication events**. Each of them can be reached by an actor outside the building block. They are described in [Section 4](4-key-digital-functionalities.md).

## 2.4 Core and extensions

The core is deliberately small, so that a wide range of products can fulfil it. Everything that a conformant product may legitimately lack is placed in a named **extension**. A product may claim an extension in addition to the core; it claims it entirely or not at all, and must then meet all of its REQUIRED requirements. GovMarket shows claimed extensions as a fact (for example _"Analytics 1.0: Core, Source Reconciliation, Proactive Triggers"_), not as a score.

> **Note**
>
> The split into capabilities, core and extensions follows the GovSpecs 2.0 model (ARCH-ADR-7, ARCH-TDR-1). These decision records are proposed and not yet decided by the Architecture Committee.

This version specifies only the core. Possible extensions are declared in [`metadata.yml`](metadata.yml) and listed in [Section 4.2](4-key-digital-functionalities.md); their requirements will be written in later versions.

## 2.5 Actors

| Actor | Role |
| ----- | ---- |
| Data stewards | Describe datasets and their schemas, define and publish indicators, start calculations and withdraw faulty deliveries. |
| Supplying systems | Registries and business applications that deliver dataset versions. |
| Consuming systems | Dashboards, BI tools, business applications and open data portals that read indicator values and datasets. |
| Subscribing systems | Systems that are notified about new versions of datasets and indicators. |

## 2.6 Relationship to other Building Blocks

The core relies on the following building blocks:

* **Identity BB** issues the tokens of all callers. This is governed by the cross-functional requirements and is not a separate requirement of this building block.
* **Information Mediator** carries deliveries across organisational boundaries. This is also governed by the cross-functional requirements.
* **Scheduler BB** can optionally trigger calculations on a schedule. It only needs the existing operation for starting a calculation.

Details are described in [Section 9](9-workflows.md).

## 2.7 Out of scope

Everything listed here is either implementation, operation, the task of another building block or already covered by the cross-functional requirements.

| Topic | Where it belongs |
| ----- | ---------------- |
| Bronze/silver/gold layers, Iceberg/Delta, MPP, OLAP and OLTP engines | Implementation; can be described as an informative design in a guide |
| Availability zones, SLAs, GitOps/IaC, ephemeral compute nodes | Operation; cross-functional deployment requirements, Cloud Infrastructure BB, procurement |
| TLS, OAuth/OIDC, API versioning, access logging | Cross-functional requirements, inherited |
| Dashboards and visualisation | Outside the building block; connected via JSON-stat and CSV |
| Extraction and change data capture from source systems | Information Mediator, source systems |
| Pseudonymisation and re-identification | Registry or the receiving business application |
| Workflow control after a trigger | Workflow BB |
| Domain models for education, climate or social protection | Domain profiles that extend this specification |

The last point deserves emphasis. A climate profile (IPCC categories, UNFCCC tables) or an education profile would be a separate, small specification that extends the Analytics Building Block. This keeps the core domain-neutral, and the domain groups can maintain their own models.

**Personal data** does not appear in the core model. Datasets may contain pseudonyms, but the building block treats them like any other attribute and does not link them to persons.
