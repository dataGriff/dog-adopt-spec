import type { components } from './generated/openapi.js';
export type Problem = components['schemas']['Problem'];
export type ErrorCode = Problem['errorCode'];
export type ProblemFieldError = NonNullable<Problem['errors']>[number];
export declare const PROBLEM_TITLES: Record<ErrorCode, string>;
export declare const PROBLEM_STATUSES: Record<ErrorCode, number>;
export interface ProblemOptions {
    detail?: string;
    instance?: string;
    errors?: ProblemFieldError[];
}
/** Builds a Problem body for an errorCode. */
export declare function problem(code: ErrorCode, { detail, instance, errors }?: ProblemOptions): Problem;
/** A Response carrying a Problem body as application/problem+json. */
export declare function problemResponse(code: ErrorCode, options?: ProblemOptions, headers?: HeadersInit): Response;
/** Thrown anywhere in a handler; an error middleware turns it into problemResponse. */
export declare class ProblemError extends Error {
    readonly errorCode: ErrorCode;
    readonly options: ProblemOptions;
    constructor(errorCode: ErrorCode, options?: ProblemOptions);
    toResponse(headers?: HeadersInit): Response;
}
/** Maps zod issues onto the Problem errors array. Accepts any object with zod-shaped issues so no zod import is needed here. */
export declare function issuesToErrors(error: {
    issues: ReadonlyArray<{
        path: ReadonlyArray<PropertyKey>;
        message: string;
    }>;
}): ProblemFieldError[];
