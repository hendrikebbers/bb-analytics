---
title: Format publication events as CloudEvents 1.0
status: proposed
date: 2026-11-02
decision-makers:
  - Analytics Working Group
consulted:
  - Architecture Working Group
  - Information Mediator Working Group
informed:
  - GovMarket
---
<!-- markdownlint-disable-next-line MD025 -->
# Format publication events as CloudEvents 1.0

## Context and Problem Statement

The Analytics Building Block notifies subscribing systems about new dataset versions, published indicator definitions, new result versions, failed calculations, checked deliveries and withdrawn or removed content (see `spec/requirements/publication-events.md`). Subscribers register a callback endpoint and receive events over HTTP.

Events go to systems built with different products and languages, and subscribers must be able to rely on the same events across implementations of this building block. The specification needs a common format for the envelope of an event: type, source, time, identifier and the affected resource. It fixes the content of `data` itself in its event catalogue.

## Decision Drivers

* A vendor-neutral envelope that subscribers can process with existing libraries
* Transport-independent, so that events can later also travel over a message broker or the Information Mediator
* Common metadata (type, source, time, identifier, subject) defined once, not per event type
* Room for the event catalogue of this specification, which fixes types, triggers and contents
* Events carry only identifiers and version information, no data values

## Considered Options

* **Option 1:** CloudEvents 1.0, structured JSON format, delivered over HTTP
* **Option 2:** An event format defined by this specification
* **Option 3:** Standard Webhooks
* **Option 4:** W3C WebSub

## Decision Outcome

*To be completed by the Analytics Working Group.*

This draft recommends **Option 1**. CloudEvents is a graduated CNCF specification with SDKs for common languages and protocol bindings for HTTP, Kafka, AMQP and MQTT. It defines the common metadata, and the specification adds only what is specific to this building block: the type prefix `global.govstack.analytics`, the `subject` as path of the affected resource and the content of `data` per event type.

### Consequences

* Every event is a CloudEvents 1.0 message in structured JSON format with `specversion`, `id`, `source` (base address of the installation), `type`, `time` and `subject`
* Event types start with the reversed domain name `global.govstack.analytics`, following the CloudEvents recommendation and the GovStack API Design Guide
* The field names of the subscription resource follow the CloudEvents Subscriptions API. Because that API is a working draft (0.1-wip), the resource is defined in this specification until a version 1.0 appears
* Every event is signed so that the recipient can verify sender and integrity
* Open: the signature method for events, which CloudEvents does not define (candidates include HTTP Message Signatures, RFC 9421, and the signature scheme of Standard Webhooks)
* Open: whether events are also delivered through the publish and subscribe mechanism of the Information Mediator Building Block, and how the CloudEvents envelope is carried there

### Confirmation

Confirmed by the Analytics Working Group. The outcome is implemented in the Publication Events requirements, in the event catalogue, in section 7.2.7 and in the subscription operations and webhooks of `api/openapi.yaml`.

Amended on 2026-11-03: the API definition was aligned with the [GovStack Cross-BB API Design Guide](https://github.com/jeremi/govstack-api-design-guide) 0.3.0-draft. Following rule 16.3 of the guide, event types start with `global.govstack.analytics` instead of `org.govstack.analytics`, and `dataset.version.content_removed` is renamed `dataset.version.contentRemoved`. The decision for CloudEvents 1.0 is unchanged.

## Pros and Cons of the Options

### Option 1: CloudEvents 1.0

* Good, because it is a graduated CNCF specification with broad industry support
* Good, because SDKs exist for common languages, so subscribers do not write their own parsers
* Good, because protocol bindings allow the same events to travel over HTTP or a message broker
* Good, because the event catalogue of this specification fits into `type`, `subject` and `data` without extensions
* Neutral, because the Subscriptions API is still a working draft, so the subscription resource has to be defined here for now
* Bad, because it does not define how events are signed, so the specification has to choose a method itself

### Option 2: Own event format

* Good, because it could be tailored exactly to this building block
* Bad, because every subscriber would need its own parser and validation
* Bad, because it could not reuse broker integrations and tools that already understand CloudEvents

### Option 3: Standard Webhooks

* Good, because it defines signatures, retries and verification of webhook calls, which CloudEvents leaves open
* Bad, because it covers only HTTP webhooks, not other transports
* Bad, because it defines less of the event metadata, so the specification would define type, source and subject itself
* Neutral, because its signature scheme could still be combined with CloudEvents

### Option 4: W3C WebSub

* Good, because it is a W3C Recommendation for publish and subscribe over HTTP
* Bad, because it is built around topics and content feeds, not typed events with metadata
* Bad, because it is little used outside web feeds, and libraries are scarce

## More information

* [CloudEvents 1.0](https://cloudevents.io/) and its [HTTP protocol binding](https://github.com/cloudevents/spec/blob/main/cloudevents/bindings/http-protocol-binding.md)
* [CloudEvents Subscriptions API](https://github.com/cloudevents/spec/blob/main/subscriptions/spec.md) (working draft)
* [Standard Webhooks](https://www.standardwebhooks.com/)
* [RFC 9421](https://www.rfc-editor.org/rfc/rfc9421), HTTP Message Signatures
