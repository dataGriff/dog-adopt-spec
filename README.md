# dog-adopt-spec

The contracts for the Dog Adopt system, and the `@dogadopt/contracts` package generated from them. Every other Dog Adopt repository is built against this one:

| Repository | Role | Consumes |
| --- | --- | --- |
| [dog-adopt-api](https://github.com/dataGriff/dog-adopt-api) | Cloudflare Worker + D1. Serves dogs and rescues, ingests finder snapshots. | zod schemas, OpenAPI document, seed data |
| [dog-adopt-finder](https://github.com/dataGriff/dog-adopt-finder) | Cloudflare Worker + Queue. One adapter per rescue website, posts snapshots to the API. | snapshot schema, CloudEvents envelopes, API client |
| [dog-adopt-web](https://github.com/dataGriff/dog-adopt-web) | Cloudflare Pages site. Browses dogs through the API. | API client and types |

The gated artifacts under `services/` are the record. If an implementation disagrees with one of them, the implementation is wrong; if an artifact is wrong, that is a versioned change here.

## Layout

```
system.yaml                         the system: name, org, which services exist
services/
  dogs-api/
    service.yaml                    manifest: artifacts, what it produces and consumes
    openapi/dogs-api.openapi.yaml   the HTTP API (public read + finder ingest)
    asyncapi/dogs-api.asyncapi.yaml dogs.listed/updated/withdrawn events
    features/*.feature              acceptance criteria (Gherkin)
    data-contracts/*.odcs.yaml      the dogs and rescues datasets (ODCS v3)
  finder/
    service.yaml
    asyncapi/finder.asyncapi.yaml   finder.snapshot.captured / finder.adapter.failed
    features/capture-snapshot.feature
  web/
    service.yaml
    features/browse-dogs.feature
seed/                               rescues.json and breeds.json, the reference data every environment starts with
src/                                the package: hand-written helpers + src/generated (do not edit)
dist/                               committed build output so the package installs from git
scripts/                            generate, validate, check-drift
```

## The package

```ts
import {
  createDogsApiClient,            // typed fetch client from the OpenAPI paths
  ListDogsQueryParams,            // zod, one per operation: *QueryParams, *Params, *Header, *Body, *200Response ...
  IngestRescueSnapshotBody,
  normalizeQuery, LIST_DOGS_QUERY_SHAPE,  // URLSearchParams -> what the zod query schemas expect
  snapshotCapturedEvent, makeEvent,       // CloudEvents envelopes for every AsyncAPI message
  problemResponse, ProblemError, issuesToErrors,   // RFC 9457 bodies with the contract's errorCodes
  bearerMatches, canonicalJson, sha256Hex,         // service-token check and idempotency hashing
  EVENT_TYPES, CHANNELS, QUEUES, ENQUIRABLE_STATUSES, ageCategoryFromBirth,
  type Dog, type Rescue, type RescueSnapshot, type paths,
} from '@dogadopt/contracts';
import openapi from '@dogadopt/contracts/openapi.json';
import rescues from '@dogadopt/contracts/seed/rescues.json';
```

Install it from git, pinned to a commit so an install without the lockfile resolves to exactly what was tested (on release, pin a tag instead):

```json
"@dogadopt/contracts": "github:dataGriff/dog-adopt-spec#<commit sha>"
```

`dist/` is committed so no build runs on install. CI fails if `dist/` or `src/generated/` is stale.

## Working on the contracts

```sh
pnpm install
pnpm validate      # lint OpenAPI (Redocly), parse AsyncAPI, parse Gherkin, check data contracts and manifests
pnpm generate      # regenerate src/generated and dist from the YAML
pnpm test          # zod <-> AsyncAPI JSON Schema agreement, query normalisation, seed data
pnpm build         # all of the above plus typecheck
pnpm check:drift   # what CI runs: generate, then fail on any diff
```

Change a contract, bump the `version` in the artifact and in its `service.yaml`, run `pnpm build`, commit the regenerated output with the change.

### Conventions

- JSON over HTTP is camelCase; stored columns are snake_case (see the data contracts).
- Errors are RFC 9457 problem details with a stable `errorCode`.
- Events are CloudEvents 1.0 structured JSON. The envelope `id` of a `finder.snapshot.captured.v1` message is the `Idempotency-Key` of the ingest call it produces.
- Only factual, non-copyrightable data is ever captured from rescue websites: no descriptions, no copied images.
- Live fetching of rescue websites is a decision not yet taken. The finder contract requires it to be off unless explicitly enabled.

## Serving the specs over MCP

The layout follows the sysspec convention (system manifest, service manifests, gated artifacts by kind) so the repository can be served by a sysspec MCP server for agents to read `get_service`, `get_operation`, `get_acceptance_criteria` and friends.
