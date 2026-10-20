export declare const ORG: "uk.co.dogadopt";
export declare const DOG_STATUSES: readonly ["available", "reserved", "fostered", "on_hold", "adopted", "withdrawn"];
/** Statuses listDogs returns when no status filter is given, and that count towards a rescue's dogCount. */
export declare const ENQUIRABLE_STATUSES: readonly ["available", "reserved", "fostered", "on_hold"];
export declare const FOUND_DOG_STATUSES: readonly ["available", "reserved", "fostered", "on_hold"];
export declare const AGE_CATEGORIES: readonly ["Puppy", "Young", "Adult", "Senior"];
export declare const DOG_SIZES: readonly ["Small", "Medium", "Large"];
export declare const GENDERS: readonly ["Male", "Female"];
export declare const RESCUE_TYPES: readonly ["Full", "Provisional"];
export declare const PAGE_SIZE_DEFAULT = 24;
export declare const PAGE_SIZE_MAX = 100;
export declare const SNAPSHOT_MAX_DOGS = 2000;
/** Cloudflare Queue names, as declared in the AsyncAPI servers. */
export declare const QUEUES: {
    readonly finderSnapshots: "dogadopt-finder-snapshots";
    readonly dogEvents: "dogadopt-dog-events";
};
/** AsyncAPI channel addresses. */
export declare const CHANNELS: {
    readonly finderSnapshotCaptured: "finder.snapshot.captured.v1";
    readonly finderAdapterFailed: "finder.adapter.failed.v1";
    readonly dogListed: "dogs.listed.v1";
    readonly dogUpdated: "dogs.updated.v1";
    readonly dogWithdrawn: "dogs.withdrawn.v1";
};
/** CloudEvents `type` values. */
export declare const EVENT_TYPES: {
    readonly finderSnapshotCaptured: "uk.co.dogadopt.finder.snapshot.captured.v1";
    readonly finderAdapterFailed: "uk.co.dogadopt.finder.adapter.failed.v1";
    readonly dogListed: "uk.co.dogadopt.dogs.listed.v1";
    readonly dogUpdated: "uk.co.dogadopt.dogs.updated.v1";
    readonly dogWithdrawn: "uk.co.dogadopt.dogs.withdrawn.v1";
};
/** CloudEvents `source` values. */
export declare const EVENT_SOURCES: {
    readonly finder: "/finder";
    readonly dogsApi: "/dogs-api";
};
/** Problem `type` URIs. */
export declare const PROBLEM_TYPES: {
    readonly validation_failed: "https://api.dogadopt.co.uk/problems/validation";
    readonly not_found: "https://api.dogadopt.co.uk/problems/not-found";
    readonly unauthorized: "https://api.dogadopt.co.uk/problems/unauthorized";
    readonly idempotency_conflict: "https://api.dogadopt.co.uk/problems/idempotency-conflict";
    readonly internal_error: "https://api.dogadopt.co.uk/problems/internal";
};
/**
 * Derives the age category from a birth date as the OpenAPI AgeCategory
 * description defines it. Month and day are optional; a missing month is
 * taken as July, a missing day as the 1st, so an age is never over-stated
 * by more than half a year.
 */
export declare function ageCategoryFromBirth(birthYear: number, birthMonth: number | null | undefined, birthDay: number | null | undefined, now?: Date): 'Puppy' | 'Young' | 'Adult' | 'Senior';
