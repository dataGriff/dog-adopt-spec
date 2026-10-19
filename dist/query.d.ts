export interface QueryShape {
    /** Parameter names whose schema is an array. */
    arrays?: readonly string[];
    /** Parameter names whose schema is a boolean. */
    booleans?: readonly string[];
    /** Parameter names whose schema is a number or integer. */
    numbers?: readonly string[];
}
export declare const LIST_DOGS_QUERY_SHAPE: QueryShape;
export declare const LIST_RESCUE_DOGS_QUERY_SHAPE: QueryShape;
export declare const LIST_RESCUES_QUERY_SHAPE: QueryShape;
export declare const DAILY_AVAILABILITY_QUERY_SHAPE: QueryShape;
/**
 * Converts URLSearchParams into a plain object ready for a generated
 * `*QueryParams` zod schema. A value that is not a boolean word or not
 * numeric is left as the original string so the schema reports it as
 * invalid rather than silently coercing.
 */
export declare function normalizeQuery(params: URLSearchParams, shape?: QueryShape): Record<string, unknown>;
