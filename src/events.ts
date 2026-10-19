// CloudEvents envelopes for every AsyncAPI message, as zod schemas that
// wrap the generated OpenAPI schemas. Kept in step with the AsyncAPI
// documents by src/events.test.ts, which validates these against the
// AsyncAPI JSON Schema and vice versa.
import { z } from 'zod';
import { IngestRescueSnapshotBody } from './generated/zod.js';
import { DOG_STATUSES, EVENT_SOURCES, EVENT_TYPES } from './constants.js';

const envelope = <T extends string, S extends string, D extends z.ZodTypeAny>(type: T, source: S, data: D) =>
  z.object({
    specversion: z.literal('1.0'),
    id: z.uuid(),
    source: z.literal(source),
    type: z.literal(type),
    subject: z.string(),
    time: z.iso.datetime({ offset: true }),
    datacontenttype: z.literal('application/json'),
    data,
  });

export const rescueSnapshotSchema = IngestRescueSnapshotBody;

export const snapshotCapturedEvent = envelope(
  EVENT_TYPES.finderSnapshotCaptured,
  EVENT_SOURCES.finder,
  z.object({ rescueId: z.uuid(), snapshot: rescueSnapshotSchema }).strict(),
);
export type SnapshotCapturedEvent = z.infer<typeof snapshotCapturedEvent>;

export const adapterFailedEvent = envelope(
  EVENT_TYPES.finderAdapterFailed,
  EVENT_SOURCES.finder,
  z.object({
    rescueId: z.uuid(),
    adapter: z.string(),
    mode: z.enum(['live', 'fixture']),
    url: z.url().optional(),
    message: z.string().max(2000),
  }).strict(),
);
export type AdapterFailedEvent = z.infer<typeof adapterFailedEvent>;

const dogRef = z.object({
  dogId: z.uuid(),
  rescueId: z.uuid(),
  externalId: z.string(),
  snapshotId: z.uuid(),
  status: z.enum(DOG_STATUSES),
});

export const dogListedEvent = envelope(EVENT_TYPES.dogListed, EVENT_SOURCES.dogsApi, dogRef.extend({ name: z.string() }));
export type DogListedEvent = z.infer<typeof dogListedEvent>;

export const dogUpdatedEvent = envelope(EVENT_TYPES.dogUpdated, EVENT_SOURCES.dogsApi, dogRef.extend({ changedFields: z.array(z.string()).min(1) }));
export type DogUpdatedEvent = z.infer<typeof dogUpdatedEvent>;

export const dogWithdrawnEvent = envelope(EVENT_TYPES.dogWithdrawn, EVENT_SOURCES.dogsApi, dogRef.extend({ lastSeenAt: z.iso.datetime({ offset: true }) }));
export type DogWithdrawnEvent = z.infer<typeof dogWithdrawnEvent>;

export type FinderEvent = SnapshotCapturedEvent | AdapterFailedEvent;
export type DogEvent = DogListedEvent | DogUpdatedEvent | DogWithdrawnEvent;

/** Builds a CloudEvents envelope. The id doubles as the ingest Idempotency-Key for snapshots. */
export function makeEvent<T extends string, S extends string, D>(type: T, source: S, subject: string, data: D, id: string = crypto.randomUUID(), time: Date = new Date()) {
  return { specversion: '1.0' as const, id, source, type, subject, time: time.toISOString(), datacontenttype: 'application/json' as const, data };
}
