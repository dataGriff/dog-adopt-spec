import createClient, { type ClientOptions } from 'openapi-fetch';
import type { paths } from './generated/openapi.js';
export type DogsApiClient = ReturnType<typeof createClient<paths>>;
export interface DogsApiClientOptions extends ClientOptions {
    baseUrl: string;
    /** Sent as a bearer token on every request. Only the finder should set this. */
    serviceToken?: string;
}
export declare function createDogsApiClient({ serviceToken, ...options }: DogsApiClientOptions): DogsApiClient;
