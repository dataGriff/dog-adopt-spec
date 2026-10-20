/* eslint-disable */
// Generated from services/dogs-api/openapi/dogs-api.openapi.yaml. Do not edit.
export interface paths {
    "/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness check */
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/dogs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List dogs
         * @description Returns dogs matching the filters, newest first. By default only dogs a person could enquire about are returned (available, reserved, fostered, on_hold); pass `status` to choose explicitly. When `lat` and `lng` are given each dog carries a `distanceKm` from that point, computed from its rescue's coordinates, and results are ordered by distance; dogs whose rescue has no coordinates sort last.
         */
        get: operations["listDogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/dogs/{dogId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a dog */
        get: operations["getDog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rescues": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List rescues
         * @description Returns rescues alphabetically by name with a count of their listed dogs.
         */
        get: operations["listRescues"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rescues/{rescueId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a rescue */
        get: operations["getRescue"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rescues/{rescueId}/dogs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List a rescue's dogs
         * @description Same filters and defaults as listDogs, scoped to one rescue.
         */
        get: operations["listRescueDogs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/breeds": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List breeds
         * @description All canonical breed names, alphabetically, with their known synonyms.
         */
        get: operations["listBreeds"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/reports/daily-availability": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Daily count of available dogs
         * @description One row per calendar day (UTC) from `from` to `to` inclusive with the number of dogs whose status was `available` at the end of that day. Days before any data exists report zero.
         */
        get: operations["getDailyAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ingest/rescues/{rescueId}/snapshots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ingest a rescue snapshot
         * @description Reconciles a snapshot of the dogs currently listed on a rescue's website into the dogs held for that rescue. Dogs are matched on `externalId` within the rescue. New dogs are created, changed dogs are updated, and when the snapshot is `complete` any dog of that rescue that was previously listed by the finder but is absent from the snapshot is marked `withdrawn`. Dogs with an unknown breed name keep the breed as a free-text `unresolvedBreeds` entry and are not rejected. The call is idempotent on the `Idempotency-Key` header: a replay returns the original result.
         */
        post: operations["ingestRescueSnapshot"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/ingest/rescues/{rescueId}/snapshots/{snapshotId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the result of a previous snapshot */
        get: operations["getSnapshotResult"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Health: {
            /** @constant */
            status: "ok";
            /** @description The deployed API version. */
            version: string;
        };
        /** @description RFC 9457 problem details. */
        Problem: {
            /**
             * Format: uri
             * @description A URI identifying the problem type, e.g. https://api.dogadopt.co.uk/problems/validation.
             */
            type: string;
            title: string;
            status: number;
            detail?: string;
            instance?: string;
            /**
             * @description Stable machine-readable code.
             * @enum {string}
             */
            errorCode: "validation_failed" | "not_found" | "unauthorized" | "idempotency_conflict" | "internal_error";
            /** @description Field-level validation errors, when errorCode is validation_failed. */
            errors?: {
                path: string;
                message: string;
            }[];
        };
        /**
         * @description available: can be enquired about. reserved: an adoption is in progress. fostered: in a foster home but still available. on_hold: temporarily not available. adopted: rehomed. withdrawn: no longer listed by the rescue.
         * @enum {string}
         */
        DogStatus: "available" | "reserved" | "fostered" | "on_hold" | "adopted" | "withdrawn";
        /**
         * @description Puppy under 1 year, Young 1 to 3 years, Adult 3 to 8 years, Senior 8 years and over. When a birth date is known the API derives this and it takes precedence over the category the source site gave.
         * @enum {string}
         */
        AgeCategory: "Puppy" | "Young" | "Adult" | "Senior";
        /** @enum {string} */
        DogSize: "Small" | "Medium" | "Large";
        /** @enum {string} */
        Gender: "Male" | "Female";
        /** @description true if good with, false if not, null if the rescue has not said. */
        Compatibility: boolean | null;
        RescueSummary: {
            /** Format: uuid */
            id: string;
            name: string;
            region: string;
            /** Format: uri */
            website: string | null;
        };
        Dog: {
            /** Format: uuid */
            id: string;
            name: string;
            status: components["schemas"]["DogStatus"];
            age: components["schemas"]["AgeCategory"];
            size: components["schemas"]["DogSize"];
            gender: components["schemas"]["Gender"];
            /** @description Canonical breed names in display order. Empty when none could be resolved. */
            breeds: string[];
            /** @description Breed names from the source that did not resolve to a canonical breed. */
            unresolvedBreeds: string[];
            goodWithKids: components["schemas"]["Compatibility"];
            goodWithDogs: components["schemas"]["Compatibility"];
            goodWithCats: components["schemas"]["Compatibility"];
            /**
             * Format: uri
             * @description A link to the rescue's own image. Images are never copied.
             */
            imageUrl: string | null;
            /**
             * Format: uri
             * @description The dog's page on the rescue's website.
             */
            profileUrl: string | null;
            /** @description Only ever written by hand; the finder never copies descriptions. */
            description: string | null;
            birthYear: number | null;
            birthMonth: number | null;
            birthDay: number | null;
            /** Format: date */
            rescueSinceDate: string | null;
            statusNotes: string | null;
            rescue: components["schemas"]["RescueSummary"];
            /** @description Only present when the request gave lat and lng and the rescue has coordinates. */
            distanceKm?: number;
            /**
             * Format: date-time
             * @description When the finder first captured this dog.
             */
            firstSeenAt: string;
            /**
             * Format: date-time
             * @description When the finder last saw this dog listed.
             */
            lastSeenAt: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        PageMeta: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
        DogPage: {
            items: components["schemas"]["Dog"][];
            meta: components["schemas"]["PageMeta"];
        };
        /**
         * @description ADCH membership type.
         * @enum {string}
         */
        RescueType: "Full" | "Provisional";
        Rescue: {
            /** Format: uuid */
            id: string;
            name: string;
            type: components["schemas"]["RescueType"];
            region: string;
            /** Format: uri */
            website: string | null;
            phone: string | null;
            email: string | null;
            address: string | null;
            postcode: string | null;
            charityNumber: string | null;
            contactNotes: string | null;
            latitude: number | null;
            longitude: number | null;
            /** @description Dogs with status available, reserved, fostered or on_hold. */
            dogCount: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        RescuePage: {
            items: components["schemas"]["Rescue"][];
            meta: components["schemas"]["PageMeta"];
        };
        Breed: {
            name: string;
            synonyms: string[];
        };
        DailyAvailabilityReport: {
            /** Format: date */
            from: string;
            /** Format: date */
            to: string;
            /** Format: uuid */
            rescueId: string | null;
            items: {
                /** Format: date */
                date: string;
                availableCount: number;
            }[];
        };
        /**
         * @description The statuses a rescue website can express. Withdrawal is inferred by absence.
         * @enum {string}
         */
        FoundDogStatus: "available" | "reserved" | "fostered" | "on_hold";
        /** @description One dog as seen on a rescue website. Only factual, non-copyrightable data: no descriptions, no copied images. `externalId` must be stable across captures of the same dog; the dog's page URL slug is the usual choice. */
        FoundDog: {
            externalId: string;
            name: string;
            /** @default available */
            status: components["schemas"]["FoundDogStatus"];
            age: components["schemas"]["AgeCategory"];
            size: components["schemas"]["DogSize"];
            gender: components["schemas"]["Gender"];
            /** @description Breed names as written on the site; the API resolves synonyms. */
            breeds: string[];
            /** @default null */
            goodWithKids: components["schemas"]["Compatibility"];
            /** @default null */
            goodWithDogs: components["schemas"]["Compatibility"];
            /** @default null */
            goodWithCats: components["schemas"]["Compatibility"];
            /**
             * Format: uri
             * @default null
             */
            profileUrl: string | null;
            /**
             * Format: uri
             * @default null
             */
            imageUrl: string | null;
            /** @default null */
            birthYear: number | null;
            /** @default null */
            birthMonth: number | null;
            /** @default null */
            birthDay: number | null;
            /**
             * Format: date
             * @default null
             */
            rescueSinceDate: string | null;
        };
        SnapshotSource: {
            /** @description The finder adapter name, e.g. cardiff-dogs-home. */
            adapter: string;
            /**
             * Format: uri
             * @description The listing page the snapshot came from.
             */
            url: string;
            /**
             * @description live means the site was fetched; fixture means saved HTML was parsed.
             * @enum {string}
             */
            mode: "live" | "fixture";
            /** @description Version of the adapter's parsing rules. */
            adapterVersion?: string;
        };
        /** @description Every dog listed on a rescue's website at one moment. */
        RescueSnapshot: {
            /** Format: date-time */
            capturedAt: string;
            source: components["schemas"]["SnapshotSource"];
            /** @description true when the snapshot holds every dog the site lists, so absence means withdrawn. false for a partial capture; nothing is withdrawn. */
            complete: boolean;
            dogs: components["schemas"]["FoundDog"][];
        };
        SnapshotResult: {
            /** Format: uuid */
            snapshotId: string;
            /** Format: uuid */
            rescueId: string;
            /** Format: date-time */
            capturedAt: string;
            /** Format: date-time */
            processedAt: string;
            counts: {
                received: number;
                created: number;
                updated: number;
                unchanged: number;
                withdrawn: number;
                rejected: number;
            };
            /** @description Dogs that could not be stored, with the reason. Never fails the whole snapshot. */
            rejected: {
                externalId: string;
                reason: string;
            }[];
        };
    };
    responses: {
        /** @description The request did not validate. */
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
        /** @description Missing or invalid service token. */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
        /** @description No such resource. */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/problem+json": components["schemas"]["Problem"];
            };
        };
    };
    parameters: {
        Page: number;
        PageSize: number;
        DogId: string;
        RescueId: string;
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The service is up. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Health"];
                };
            };
        };
    };
    listDogs: {
        parameters: {
            query?: {
                page?: components["parameters"]["Page"];
                pageSize?: components["parameters"]["PageSize"];
                /** @description One or more statuses. Repeat the parameter or comma separate. */
                status?: components["schemas"]["DogStatus"][];
                size?: components["schemas"]["DogSize"];
                age?: components["schemas"]["AgeCategory"];
                gender?: components["schemas"]["Gender"];
                /** @description Canonical breed name. Matches dogs with that breed in any position. */
                breed?: string;
                rescueId?: string;
                /** @description Exact match on the rescue's region. */
                region?: string;
                goodWithKids?: boolean;
                goodWithDogs?: boolean;
                goodWithCats?: boolean;
                /** @description Case-insensitive substring match on the dog's name or breed names. */
                q?: string;
                lat?: number;
                lng?: number;
                /** @description Only with lat and lng. Excludes dogs further away than this. */
                radiusKm?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of dogs. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DogPage"];
                };
            };
            400: components["responses"]["BadRequest"];
        };
    };
    getDog: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                dogId: components["parameters"]["DogId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The dog. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Dog"];
                };
            };
            404: components["responses"]["NotFound"];
        };
    };
    listRescues: {
        parameters: {
            query?: {
                page?: components["parameters"]["Page"];
                pageSize?: components["parameters"]["PageSize"];
                region?: string;
                /** @description Case-insensitive substring match on the rescue name. */
                q?: string;
                /** @description When true, only rescues with at least one listed dog. */
                hasDogs?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of rescues. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RescuePage"];
                };
            };
            400: components["responses"]["BadRequest"];
        };
    };
    getRescue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rescueId: components["parameters"]["RescueId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The rescue. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Rescue"];
                };
            };
            404: components["responses"]["NotFound"];
        };
    };
    listRescueDogs: {
        parameters: {
            query?: {
                page?: components["parameters"]["Page"];
                pageSize?: components["parameters"]["PageSize"];
                status?: components["schemas"]["DogStatus"][];
            };
            header?: never;
            path: {
                rescueId: components["parameters"]["RescueId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description A page of dogs. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DogPage"];
                };
            };
            404: components["responses"]["NotFound"];
        };
    };
    listBreeds: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Breeds. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items: components["schemas"]["Breed"][];
                    };
                };
            };
        };
    };
    getDailyAvailability: {
        parameters: {
            query: {
                from: string;
                to: string;
                rescueId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Daily counts. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DailyAvailabilityReport"];
                };
            };
            400: components["responses"]["BadRequest"];
        };
    };
    ingestRescueSnapshot: {
        parameters: {
            query?: never;
            header: {
                /** @description Unique per snapshot; the finder uses the snapshot event id. */
                "Idempotency-Key": string;
            };
            path: {
                rescueId: components["parameters"]["RescueId"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RescueSnapshot"];
            };
        };
        responses: {
            /** @description The snapshot was reconciled (or had already been, for a replayed key). */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotResult"];
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
            /** @description The Idempotency-Key was already used with a different body. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["Problem"];
                };
            };
        };
    };
    getSnapshotResult: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                rescueId: components["parameters"]["RescueId"];
                snapshotId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The stored result. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SnapshotResult"];
                };
            };
            401: components["responses"]["Unauthorized"];
            404: components["responses"]["NotFound"];
        };
    };
}
