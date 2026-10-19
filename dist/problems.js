// RFC 9457 problem details exactly as the OpenAPI Problem schema defines
// them, with the contract's errorCode vocabulary and type URIs.
import { PROBLEM_TYPES } from './constants.js';
export const PROBLEM_TITLES = {
    validation_failed: 'The request did not validate',
    not_found: 'No such resource',
    unauthorized: 'Missing or invalid service token',
    idempotency_conflict: 'Idempotency-Key already used with a different body',
    internal_error: 'Something went wrong',
};
export const PROBLEM_STATUSES = {
    validation_failed: 400,
    not_found: 404,
    unauthorized: 401,
    idempotency_conflict: 409,
    internal_error: 500,
};
/** Builds a Problem body for an errorCode. */
export function problem(code, { detail, instance, errors } = {}) {
    return {
        type: PROBLEM_TYPES[code],
        title: PROBLEM_TITLES[code],
        status: PROBLEM_STATUSES[code],
        errorCode: code,
        ...(detail ? { detail } : {}),
        ...(instance ? { instance } : {}),
        ...(errors && errors.length ? { errors } : {}),
    };
}
/** A Response carrying a Problem body as application/problem+json. */
export function problemResponse(code, options = {}, headers = {}) {
    return new Response(JSON.stringify(problem(code, options)), {
        status: PROBLEM_STATUSES[code],
        headers: { 'content-type': 'application/problem+json', ...headers },
    });
}
/** Thrown anywhere in a handler; an error middleware turns it into problemResponse. */
export class ProblemError extends Error {
    errorCode;
    options;
    constructor(errorCode, options = {}) {
        super(options.detail ?? PROBLEM_TITLES[errorCode]);
        this.errorCode = errorCode;
        this.options = options;
        this.name = 'ProblemError';
    }
    toResponse(headers) {
        return problemResponse(this.errorCode, this.options, headers);
    }
}
/** Maps zod issues onto the Problem errors array. Accepts any object with zod-shaped issues so no zod import is needed here. */
export function issuesToErrors(error) {
    return error.issues.map((issue) => ({ path: issue.path.map(String).join('.') || '(root)', message: issue.message }));
}
