import { describe, expect, it } from 'vitest';
import { bearerMatches, canonicalJson, problem, problemResponse, ProblemError, sha256Hex, timingSafeEqual } from './index.js';
import { ListDogs400Response } from './generated/zod.js';

describe('security helpers', () => {
  it('timingSafeEqual compares bytes and handles empty strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'ab')).toBe(false);
    expect(timingSafeEqual('', '')).toBe(true);
    expect(timingSafeEqual('', 'a')).toBe(false);
  });
  it('bearerMatches accepts only a well-formed matching bearer header', () => {
    expect(bearerMatches('Bearer s3cret', 's3cret')).toBe(true);
    expect(bearerMatches('bearer s3cret', 's3cret')).toBe(true);
    expect(bearerMatches('Bearer wrong', 's3cret')).toBe(false);
    expect(bearerMatches('Basic s3cret', 's3cret')).toBe(false);
    expect(bearerMatches(null, 's3cret')).toBe(false);
    expect(bearerMatches('Bearer s3cret', undefined)).toBe(false);
    expect(bearerMatches('Bearer s3cret extra', 's3cret')).toBe(false);
  });
  it('canonicalJson and sha256Hex are stable across key order', async () => {
    expect(canonicalJson({ b: 1, a: [{ d: 2, c: 3 }] })).toBe('{"a":[{"c":3,"d":2}],"b":1}');
    expect(await sha256Hex(canonicalJson({ b: 1, a: 2 }))).toBe(await sha256Hex(canonicalJson({ a: 2, b: 1 })));
  });
});

describe('problem helpers', () => {
  it('builds bodies that satisfy the contract Problem schema', async () => {
    const body = problem('validation_failed', { errors: [{ path: 'pageSize', message: 'too big' }] });
    expect(ListDogs400Response.safeParse(body).success).toBe(true);
    const res = problemResponse('not_found', { detail: 'no dog' });
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toBe('application/problem+json');
    expect((await res.json()).errorCode).toBe('not_found');
    expect(new ProblemError('unauthorized').toResponse().status).toBe(401);
  });
});
