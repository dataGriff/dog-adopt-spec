// Values that appear in more than one contract, named once.
export const ORG = 'uk.co.dogadopt';
export const DOG_STATUSES = ['available', 'reserved', 'fostered', 'on_hold', 'adopted', 'withdrawn'];
/** Statuses listDogs returns when no status filter is given, and that count towards a rescue's dogCount. */
export const ENQUIRABLE_STATUSES = ['available', 'reserved', 'fostered', 'on_hold'];
export const FOUND_DOG_STATUSES = ['available', 'reserved', 'fostered', 'on_hold'];
export const AGE_CATEGORIES = ['Puppy', 'Young', 'Adult', 'Senior'];
export const DOG_SIZES = ['Small', 'Medium', 'Large'];
export const GENDERS = ['Male', 'Female'];
export const RESCUE_TYPES = ['Full', 'Provisional'];
export const PAGE_SIZE_DEFAULT = 24;
export const PAGE_SIZE_MAX = 100;
export const SNAPSHOT_MAX_DOGS = 2000;
/** Cloudflare Queue names, as declared in the AsyncAPI servers. */
export const QUEUES = {
    finderSnapshots: 'dogadopt-finder-snapshots',
    dogEvents: 'dogadopt-dog-events',
};
/** AsyncAPI channel addresses. */
export const CHANNELS = {
    finderSnapshotCaptured: 'finder.snapshot.captured.v1',
    finderAdapterFailed: 'finder.adapter.failed.v1',
    dogListed: 'dogs.listed.v1',
    dogUpdated: 'dogs.updated.v1',
    dogWithdrawn: 'dogs.withdrawn.v1',
};
/** CloudEvents `type` values. */
export const EVENT_TYPES = {
    finderSnapshotCaptured: `${ORG}.finder.snapshot.captured.v1`,
    finderAdapterFailed: `${ORG}.finder.adapter.failed.v1`,
    dogListed: `${ORG}.dogs.listed.v1`,
    dogUpdated: `${ORG}.dogs.updated.v1`,
    dogWithdrawn: `${ORG}.dogs.withdrawn.v1`,
};
/** CloudEvents `source` values. */
export const EVENT_SOURCES = {
    finder: '/finder',
    dogsApi: '/dogs-api',
};
/** Problem `type` URIs. */
export const PROBLEM_TYPES = {
    validation_failed: 'https://api.dogadopt.co.uk/problems/validation',
    not_found: 'https://api.dogadopt.co.uk/problems/not-found',
    unauthorized: 'https://api.dogadopt.co.uk/problems/unauthorized',
    idempotency_conflict: 'https://api.dogadopt.co.uk/problems/idempotency-conflict',
    internal_error: 'https://api.dogadopt.co.uk/problems/internal',
};
/**
 * Derives the age category from a birth date as the OpenAPI AgeCategory
 * description defines it. Month and day are optional; a missing month is
 * taken as July, a missing day as the 1st, so an age is never over-stated
 * by more than half a year.
 */
export function ageCategoryFromBirth(birthYear, birthMonth, birthDay, now = new Date()) {
    const birth = Date.UTC(birthYear, (birthMonth ?? 7) - 1, birthDay ?? 1);
    const years = (now.getTime() - birth) / (365.25 * 24 * 60 * 60 * 1000);
    if (years < 1)
        return 'Puppy';
    if (years < 3)
        return 'Young';
    if (years < 8)
        return 'Adult';
    return 'Senior';
}
