import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ListDogsQueryParams, ListRescuesQueryParams, GetDog200Response, IngestRescueSnapshotBody } from './generated/zod.js';
import { LIST_DOGS_QUERY_SHAPE, LIST_RESCUES_QUERY_SHAPE, normalizeQuery } from './query.js';
import { ageCategoryFromBirth, PAGE_SIZE_DEFAULT } from './constants.js';

const root = fileURLToPath(new URL('..', import.meta.url));

describe('normalizeQuery with the generated query schemas', () => {
  it('applies defaults and parses comma separated and repeated arrays', () => {
    const parsed = ListDogsQueryParams.parse(normalizeQuery(new URLSearchParams('status=adopted,withdrawn&status=available'), LIST_DOGS_QUERY_SHAPE));
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(PAGE_SIZE_DEFAULT);
    expect(parsed.status).toEqual(['adopted', 'withdrawn', 'available']);
  });
  it('treats false as false, not as a truthy string', () => {
    const parsed = ListDogsQueryParams.parse(normalizeQuery(new URLSearchParams('goodWithKids=false&goodWithCats=true'), LIST_DOGS_QUERY_SHAPE));
    expect(parsed.goodWithKids).toBe(false);
    expect(parsed.goodWithCats).toBe(true);
    expect(ListRescuesQueryParams.parse(normalizeQuery(new URLSearchParams('hasDogs=false'), LIST_RESCUES_QUERY_SHAPE)).hasDogs).toBe(false);
  });
  it.each(['pageSize=101', 'page=0', 'page=abc', 'size=Huge', 'status=lost', 'lat=91', 'goodWithKids=maybe', 'unknown=1'])('rejects %s', (qs) => {
    expect(ListDogsQueryParams.safeParse(normalizeQuery(new URLSearchParams(qs), LIST_DOGS_QUERY_SHAPE)).success).toBe(false);
  });
});

describe('Dog response schema', () => {
  const dog = {
    id: '2b7c0d5a-9c3e-4f0a-8a1b-7e6d5c4b3a21', name: 'Bella', status: 'available', age: 'Adult', size: 'Medium', gender: 'Female',
    breeds: ['Staffordshire Bull Terrier'], unresolvedBreeds: [], goodWithKids: true, goodWithDogs: null, goodWithCats: false,
    imageUrl: null, profileUrl: 'https://www.cardiffdogshome.co.uk/dog/bella-2/', description: null,
    birthYear: 2021, birthMonth: null, birthDay: null, rescueSinceDate: null, statusNotes: null,
    rescue: { id: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d', name: 'Cardiff Dogs Home', region: 'South Wales', website: 'https://www.cardiffdogshome.co.uk' },
    firstSeenAt: '2026-10-19T08:00:00.000Z', lastSeenAt: '2026-10-19T08:00:00.000Z', createdAt: '2026-10-19T08:00:00.000Z', updatedAt: '2026-10-19T08:00:00.000Z',
  };
  it('accepts a complete dog and one with distanceKm', () => {
    expect(GetDog200Response.safeParse(dog).success).toBe(true);
    expect(GetDog200Response.safeParse({ ...dog, distanceKm: 3.2 }).success).toBe(true);
  });
  it('rejects a dog missing a required nullable field or carrying an extra one', () => {
    const { statusNotes, ...missing } = dog;
    expect(GetDog200Response.safeParse(missing).success).toBe(false);
    expect(GetDog200Response.safeParse({ ...dog, extra: 1 }).success).toBe(false);
  });
});

describe('RescueSnapshot body schema', () => {
  it('fills defaults for optional dog fields', () => {
    const parsed = IngestRescueSnapshotBody.parse({
      capturedAt: '2026-10-19T08:00:00Z', source: { adapter: 'cardiff-dogs-home', url: 'https://www.cardiffdogshome.co.uk/', mode: 'fixture' }, complete: true,
      dogs: [{ externalId: 'bella-2', name: 'Bella', age: 'Adult', size: 'Medium', gender: 'Female', breeds: ['Staffie'] }],
    });
    expect(parsed.dogs[0]!.status).toBe('available');
    expect(parsed.dogs[0]!.goodWithKids).toBeNull();
    expect(parsed.dogs[0]!.profileUrl).toBeNull();
  });
  it('rejects unknown properties and a bad adapter name', () => {
    const base = { capturedAt: '2026-10-19T08:00:00Z', source: { adapter: 'Cardiff', url: 'https://x.y/', mode: 'fixture' }, complete: true, dogs: [] };
    expect(IngestRescueSnapshotBody.safeParse(base).success).toBe(false);
    expect(IngestRescueSnapshotBody.safeParse({ ...base, source: { ...base.source, adapter: 'cardiff' }, extra: 1 }).success).toBe(false);
  });
});

describe('seed data', () => {
  const rescues = JSON.parse(readFileSync(`${root}seed/rescues.json`, 'utf8')) as any[];
  const breeds = JSON.parse(readFileSync(`${root}seed/breeds.json`, 'utf8')) as { name: string; synonyms: string[] }[];
  it('rescues have unique ids and names, valid types and UK coordinates', () => {
    expect(new Set(rescues.map((r) => r.id)).size).toBe(rescues.length);
    expect(new Set(rescues.map((r) => r.name)).size).toBe(rescues.length);
    for (const r of rescues) {
      expect(['Full', 'Provisional']).toContain(r.type);
      expect(r.region).toBeTruthy();
      if (r.latitude != null) expect(r.latitude).toBeGreaterThan(49);
      if (r.latitude != null) expect(r.latitude).toBeLessThan(61);
      if (r.website) expect(r.website).toMatch(/^https?:\/\//);
    }
  });
  it('breed synonyms are unique and never a canonical name', () => {
    const names = new Set(breeds.map((b) => b.name.toLowerCase()));
    const all = breeds.flatMap((b) => b.synonyms.map((s) => s.toLowerCase()));
    expect(new Set(all).size).toBe(all.length);
    for (const s of all) expect(names.has(s)).toBe(false);
  });
});

describe('ageCategoryFromBirth', () => {
  const now = new Date('2026-10-19T00:00:00Z');
  it.each([[2026, 'Puppy'], [2025, 'Young'], [2024, 'Young'], [2023, 'Adult'], [2019, 'Adult'], [2018, 'Senior']])('%i -> %s', (year, expected) => {
    expect(ageCategoryFromBirth(year, null, null, now)).toBe(expected);
  });
});
