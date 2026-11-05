# 4 Key Digital Functionalities

This section names the functionalities of the Analytics Building Block: the services it provides to actors outside of it. Each functionality is described, together with its requirements, in its own file in the folder `requirements/` (see [Section 6](6-functional-requirements.md)). Each functionality realises one or more of the capabilities described in [Section 2.3](2-description.md) and is either part of the **core**, which every conformant solution meets, or of a named **extension**, which a solution may claim in addition.

> **Note**
>
> Capabilities and extensions are declared in [`metadata.yml`](metadata.yml), following the GovSpecs 2.0 model (ARCH-TDR-1, ARCH-ADR-7). These decision records are proposed and not yet decided.

## 4.1 Core functionalities

The core consists of five functionalities, each reachable by an actor outside the building block. Together they realise the capabilities _Pooled Data Foundation_, _Trustworthy Indicators_ and _Reusable Statistics_.

| Functionality | Actor | What it provides | Realises |
| ------------- | ----- | ---------------- | -------- |
| [Data Ingestion](requirements/data-ingestion.md) | Supplying systems (registries, business applications), data stewards | Accepts dataset versions by API or file (push), validates them against the schema, acknowledges them with a receipt | Pooled Data Foundation |
| [Data Catalogue](requirements/data-catalogue.md) | Data stewards, consuming systems, open data portals | Describes datasets and indicators, their versions, schemas, code lists and provenance | all three |
| [Indicator Calculation](requirements/indicator-calculation.md) | Data stewards | Manages versioned indicator definitions and calculates versioned values from them, with a provenance record | Trustworthy Indicators |
| [Data Access](requirements/data-access.md) | Consuming systems, BI tools | Delivers indicator values (JSON-stat, CSV), provenance records and dataset contents, limited to the caller's authorisation | Reusable Statistics |
| [Publication Events](requirements/publication-events.md) | Subscribing systems | Announces new versions of datasets and indicators | Reusable Statistics |

The typical sequence is: a data steward creates a dataset with its schema in the catalogue; a supplying system delivers a dataset version; the data steward defines and publishes an indicator and starts a calculation; a consuming system is notified and retrieves the values. The order of defining the indicator and the first delivery is free. The flows are described in [Section 9](9-workflows.md).

## 4.2 Extensions

The following extensions are declared in [`metadata.yml`](metadata.yml) but not yet specified in this version. A solution can therefore not yet claim them.

| Extension | What it provides |
| --------- | ---------------- |
| Source Reconciliation | Several estimates per unit, deviation against a threshold, recorded human decision on the official value |
| Proactive Triggers | Threshold rules on indicators that send a signal to external systems |
| Geospatial Data | Spatial dimensions, administrative boundaries, access via OGC API |
| SQL Access | Read-only SQL access to fixed views |
| Natural Language Query | Questions in everyday language, generated query shown before execution |
| Predictive Scoring | Model versions, scoring API, provenance of every score |
| Open Data Publication | DCAT catalogue for open data portals |
| Data Pull | The building block fetches dataset versions from registered sources on a schedule |
| Iceberg Provision | Read access for query engines to dataset contents via the Iceberg REST Catalog API |
| Statistical Exchange (SDMX) | Full SDMX REST interface for statistics offices and international reporting |
| Reproducibility | Guarantee that values can be recalculated exactly |
