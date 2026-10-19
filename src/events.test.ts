import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { adapterFailedEvent, dogListedEvent, dogUpdatedEvent, dogWithdrawnEvent, makeEvent, snapshotCapturedEvent } from './events.js';
import { EVENT_SOURCES, EVENT_TYPES } from './constants.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const finder = JSON.parse(readFileSync(`${root}dist/finder.asyncapi.json`, 'utf8'));
const dogsApi = JSON.parse(readFileSync(`${root}dist/dogs-api.asyncapi.json`, 'utf8'));

// The AsyncAPI payload schema is the record; the zod schema here must
// accept exactly what it accepts. Each example in the AsyncAPI document
// is checked against both, and a zod-built event is checked against the
// JSON Schema.
function jsonSchemaValidator(doc: any, messageName: string) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  const payload = { ...doc.components.messages[messageName].payload, components: doc.components };
  return ajv.compile(payload);
}

describe('finder AsyncAPI examples', () => {
  const message = finder.components.messages.SnapshotCaptured;
  const validate = jsonSchemaValidator(finder, 'SnapshotCaptured');
  for (const example of message.examples) {
    it(`example ${example.name} validates against the JSON Schema and the zod schema`, () => {
      expect(validate(example.payload), JSON.stringify(validate.errors)).toBe(true);
      expect(snapshotCapturedEvent.safeParse(example.payload).success).toBe(true);
    });
  }
  it('a zod-built SnapshotCaptured event validates against the JSON Schema', () => {
    const event = makeEvent(EVENT_TYPES.finderSnapshotCaptured, EVENT_SOURCES.finder, '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', {
      rescueId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      snapshot: {
        capturedAt: new Date().toISOString(),
        source: { adapter: 'cardiff-dogs-home', url: 'https://www.cardiffdogshome.co.uk/', mode: 'fixture' as const },
        complete: true,
        dogs: [{ externalId: 'x', name: 'X', age: 'Adult' as const, size: 'Small' as const, gender: 'Male' as const, breeds: [] }],
      },
    });
    expect(snapshotCapturedEvent.parse(event)).toBeTruthy();
    expect(validate(event), JSON.stringify(validate.errors)).toBe(true);
  });
  it('rejects a snapshot dog with a status only the API may set', () => {
    const bad = { ...message.examples[0].payload };
    bad.data = { ...bad.data, snapshot: { ...bad.data.snapshot, dogs: [{ ...bad.data.snapshot.dogs[0], status: 'withdrawn' }] } };
    expect(validate(bad)).toBe(false);
    expect(snapshotCapturedEvent.safeParse(bad).success).toBe(false);
  });
  it('AdapterFailed agrees between zod and JSON Schema', () => {
    const validateFailed = jsonSchemaValidator(finder, 'AdapterFailed');
    const event = makeEvent(EVENT_TYPES.finderAdapterFailed, EVENT_SOURCES.finder, '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', {
      rescueId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', adapter: 'cardiff-dogs-home', mode: 'fixture' as const, message: 'boom',
    });
    expect(adapterFailedEvent.parse(event)).toBeTruthy();
    expect(validateFailed(event), JSON.stringify(validateFailed.errors)).toBe(true);
  });
});

describe('dogs-api AsyncAPI', () => {
  const ref = { dogId: '2b7c0d5a-9c3e-4f0a-8a1b-7e6d5c4b3a21', rescueId: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', externalId: 'bella-2', snapshotId: '9d8c7b6a-5f4e-4d3c-8b2a-1f0e9d8c7b6a', status: 'available' as const };
  it('DogListed example validates against both', () => {
    const validate = jsonSchemaValidator(dogsApi, 'DogListed');
    const example = dogsApi.components.messages.DogListed.examples[0].payload;
    expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
    expect(dogListedEvent.safeParse(example).success).toBe(true);
  });
  it('DogUpdated and DogWithdrawn built with zod validate against the JSON Schema', () => {
    const updated = makeEvent(EVENT_TYPES.dogUpdated, EVENT_SOURCES.dogsApi, ref.dogId, { ...ref, changedFields: ['name'] });
    const withdrawn = makeEvent(EVENT_TYPES.dogWithdrawn, EVENT_SOURCES.dogsApi, ref.dogId, { ...ref, status: 'withdrawn' as const, lastSeenAt: new Date().toISOString() });
    expect(dogUpdatedEvent.parse(updated)).toBeTruthy();
    expect(dogWithdrawnEvent.parse(withdrawn)).toBeTruthy();
    expect(jsonSchemaValidator(dogsApi, 'DogUpdated')(updated)).toBe(true);
    expect(jsonSchemaValidator(dogsApi, 'DogWithdrawn')(withdrawn)).toBe(true);
    expect(dogUpdatedEvent.safeParse({ ...updated, data: { ...updated.data, changedFields: [] } }).success).toBe(false);
  });
});
