import { z } from 'zod';
export declare const rescueSnapshotSchema: z.ZodObject<{
    capturedAt: z.ZodISODateTime;
    source: z.ZodObject<{
        adapter: z.ZodString;
        url: z.ZodURL;
        mode: z.ZodEnum<{
            live: "live";
            fixture: "fixture";
        }>;
        adapterVersion: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    complete: z.ZodBoolean;
    dogs: z.ZodArray<z.ZodObject<{
        externalId: z.ZodString;
        name: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<{
            available: "available";
            reserved: "reserved";
            fostered: "fostered";
            on_hold: "on_hold";
        }>>;
        age: z.ZodEnum<{
            Puppy: "Puppy";
            Young: "Young";
            Adult: "Adult";
            Senior: "Senior";
        }>;
        size: z.ZodEnum<{
            Small: "Small";
            Medium: "Medium";
            Large: "Large";
        }>;
        gender: z.ZodEnum<{
            Male: "Male";
            Female: "Female";
        }>;
        breeds: z.ZodArray<z.ZodString>;
        goodWithKids: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
        goodWithDogs: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
        goodWithCats: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
        profileUrl: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodURL>>>;
        imageUrl: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodURL>>>;
        birthYear: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
        birthMonth: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
        birthDay: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
        rescueSinceDate: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodISODate>>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const snapshotCapturedEvent: z.ZodObject<{
    specversion: z.ZodLiteral<"1.0">;
    id: z.ZodUUID;
    source: z.ZodLiteral<"/finder">;
    type: z.ZodLiteral<"uk.co.dogadopt.finder.snapshot.captured.v1">;
    subject: z.ZodString;
    time: z.ZodISODateTime;
    datacontenttype: z.ZodLiteral<"application/json">;
    data: z.ZodObject<{
        rescueId: z.ZodUUID;
        snapshot: z.ZodObject<{
            capturedAt: z.ZodISODateTime;
            source: z.ZodObject<{
                adapter: z.ZodString;
                url: z.ZodURL;
                mode: z.ZodEnum<{
                    live: "live";
                    fixture: "fixture";
                }>;
                adapterVersion: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            complete: z.ZodBoolean;
            dogs: z.ZodArray<z.ZodObject<{
                externalId: z.ZodString;
                name: z.ZodString;
                status: z.ZodDefault<z.ZodEnum<{
                    available: "available";
                    reserved: "reserved";
                    fostered: "fostered";
                    on_hold: "on_hold";
                }>>;
                age: z.ZodEnum<{
                    Puppy: "Puppy";
                    Young: "Young";
                    Adult: "Adult";
                    Senior: "Senior";
                }>;
                size: z.ZodEnum<{
                    Small: "Small";
                    Medium: "Medium";
                    Large: "Large";
                }>;
                gender: z.ZodEnum<{
                    Male: "Male";
                    Female: "Female";
                }>;
                breeds: z.ZodArray<z.ZodString>;
                goodWithKids: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
                goodWithDogs: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
                goodWithCats: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodBoolean>>>;
                profileUrl: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodURL>>>;
                imageUrl: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodURL>>>;
                birthYear: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
                birthMonth: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
                birthDay: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodInt>>>;
                rescueSinceDate: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodISODate>>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
    }, z.core.$strict>;
}, z.core.$strip>;
export type SnapshotCapturedEvent = z.infer<typeof snapshotCapturedEvent>;
export declare const adapterFailedEvent: z.ZodObject<{
    specversion: z.ZodLiteral<"1.0">;
    id: z.ZodUUID;
    source: z.ZodLiteral<"/finder">;
    type: z.ZodLiteral<"uk.co.dogadopt.finder.adapter.failed.v1">;
    subject: z.ZodString;
    time: z.ZodISODateTime;
    datacontenttype: z.ZodLiteral<"application/json">;
    data: z.ZodObject<{
        rescueId: z.ZodUUID;
        adapter: z.ZodString;
        mode: z.ZodEnum<{
            live: "live";
            fixture: "fixture";
        }>;
        url: z.ZodOptional<z.ZodURL>;
        message: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strip>;
export type AdapterFailedEvent = z.infer<typeof adapterFailedEvent>;
export declare const dogListedEvent: z.ZodObject<{
    specversion: z.ZodLiteral<"1.0">;
    id: z.ZodUUID;
    source: z.ZodLiteral<"/dogs-api">;
    type: z.ZodLiteral<"uk.co.dogadopt.dogs.listed.v1">;
    subject: z.ZodString;
    time: z.ZodISODateTime;
    datacontenttype: z.ZodLiteral<"application/json">;
    data: z.ZodObject<{
        dogId: z.ZodUUID;
        rescueId: z.ZodUUID;
        externalId: z.ZodString;
        snapshotId: z.ZodUUID;
        status: z.ZodEnum<{
            available: "available";
            reserved: "reserved";
            fostered: "fostered";
            on_hold: "on_hold";
            adopted: "adopted";
            withdrawn: "withdrawn";
        }>;
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type DogListedEvent = z.infer<typeof dogListedEvent>;
export declare const dogUpdatedEvent: z.ZodObject<{
    specversion: z.ZodLiteral<"1.0">;
    id: z.ZodUUID;
    source: z.ZodLiteral<"/dogs-api">;
    type: z.ZodLiteral<"uk.co.dogadopt.dogs.updated.v1">;
    subject: z.ZodString;
    time: z.ZodISODateTime;
    datacontenttype: z.ZodLiteral<"application/json">;
    data: z.ZodObject<{
        dogId: z.ZodUUID;
        rescueId: z.ZodUUID;
        externalId: z.ZodString;
        snapshotId: z.ZodUUID;
        status: z.ZodEnum<{
            available: "available";
            reserved: "reserved";
            fostered: "fostered";
            on_hold: "on_hold";
            adopted: "adopted";
            withdrawn: "withdrawn";
        }>;
        changedFields: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type DogUpdatedEvent = z.infer<typeof dogUpdatedEvent>;
export declare const dogWithdrawnEvent: z.ZodObject<{
    specversion: z.ZodLiteral<"1.0">;
    id: z.ZodUUID;
    source: z.ZodLiteral<"/dogs-api">;
    type: z.ZodLiteral<"uk.co.dogadopt.dogs.withdrawn.v1">;
    subject: z.ZodString;
    time: z.ZodISODateTime;
    datacontenttype: z.ZodLiteral<"application/json">;
    data: z.ZodObject<{
        dogId: z.ZodUUID;
        rescueId: z.ZodUUID;
        externalId: z.ZodString;
        snapshotId: z.ZodUUID;
        status: z.ZodEnum<{
            available: "available";
            reserved: "reserved";
            fostered: "fostered";
            on_hold: "on_hold";
            adopted: "adopted";
            withdrawn: "withdrawn";
        }>;
        lastSeenAt: z.ZodISODateTime;
    }, z.core.$strip>;
}, z.core.$strip>;
export type DogWithdrawnEvent = z.infer<typeof dogWithdrawnEvent>;
export type FinderEvent = SnapshotCapturedEvent | AdapterFailedEvent;
export type DogEvent = DogListedEvent | DogUpdatedEvent | DogWithdrawnEvent;
/** Builds a CloudEvents envelope. The id doubles as the ingest Idempotency-Key for snapshots. */
export declare function makeEvent<T extends string, S extends string, D>(type: T, source: S, subject: string, data: D, id?: string, time?: Date): {
    specversion: "1.0";
    id: string;
    source: S;
    type: T;
    subject: string;
    time: string;
    datacontenttype: "application/json";
    data: D;
};
