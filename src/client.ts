// A typed HTTP client for the Dogs API, generated from the OpenAPI paths.
// Used by the web front end and by the finder's queue consumer.
import createClient, { type ClientOptions, type Middleware } from 'openapi-fetch';
import type { paths } from './generated/openapi.js';

export type DogsApiClient = ReturnType<typeof createClient<paths>>;

export interface DogsApiClientOptions extends ClientOptions {
  baseUrl: string;
  /** Sent as a bearer token on every request. Only the finder should set this. */
  serviceToken?: string;
}

export function createDogsApiClient({ serviceToken, ...options }: DogsApiClientOptions): DogsApiClient {
  const client = createClient<paths>(options);
  if (serviceToken) {
    const auth: Middleware = {
      onRequest({ request }) {
        request.headers.set('Authorization', `Bearer ${serviceToken}`);
        return request;
      },
    };
    client.use(auth);
  }
  return client;
}
