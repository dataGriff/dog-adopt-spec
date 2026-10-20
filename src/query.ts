// Turns raw query-string values into what the generated zod query schemas
// expect. The OpenAPI says array parameters may be repeated or comma
// separated and booleans are the words true/false; URLSearchParams gives
// us strings, and zod.coerce.boolean would turn "false" into true, so the
// conversion happens here, once, for every service.

const BOOLEAN_WORDS: Record<string, boolean> = { true: true, false: false, '1': true, '0': false };

export interface QueryShape {
  /** Parameter names whose schema is an array. */
  arrays?: readonly string[];
  /** Parameter names whose schema is a boolean. */
  booleans?: readonly string[];
  /** Parameter names whose schema is a number or integer. */
  numbers?: readonly string[];
}

const PAGING = ['page', 'pageSize'] as const;

export const LIST_DOGS_QUERY_SHAPE: QueryShape = {
  arrays: ['status'],
  booleans: ['goodWithKids', 'goodWithDogs', 'goodWithCats'],
  numbers: [...PAGING, 'lat', 'lng', 'radiusKm'],
};
export const LIST_RESCUE_DOGS_QUERY_SHAPE: QueryShape = { arrays: ['status'], numbers: PAGING };
export const LIST_RESCUES_QUERY_SHAPE: QueryShape = { booleans: ['hasDogs'], numbers: PAGING };
export const DAILY_AVAILABILITY_QUERY_SHAPE: QueryShape = {};

/**
 * Converts URLSearchParams into a plain object ready for a generated
 * `*QueryParams` zod schema. A value that is not a boolean word or not
 * numeric is left as the original string so the schema reports it as
 * invalid rather than silently coercing.
 */
export function normalizeQuery(params: URLSearchParams, shape: QueryShape = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const arrays = new Set(shape.arrays ?? []);
  const booleans = new Set(shape.booleans ?? []);
  const numbers = new Set(shape.numbers ?? []);
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    if (arrays.has(key)) {
      out[key] = values.flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
    } else if (booleans.has(key)) {
      const raw = values[values.length - 1]!.trim().toLowerCase();
      out[key] = raw in BOOLEAN_WORDS ? BOOLEAN_WORDS[raw] : values[values.length - 1];
    } else if (numbers.has(key)) {
      const raw = values[values.length - 1]!.trim();
      out[key] = raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : values[values.length - 1];
    } else {
      out[key] = values[values.length - 1];
    }
  }
  return out;
}
