// A typed HTTP client for the Dogs API, generated from the OpenAPI paths.
// Used by the web front end and by the finder's queue consumer.
import createClient from 'openapi-fetch';
export function createDogsApiClient({ serviceToken, ...options }) {
    const client = createClient(options);
    if (serviceToken) {
        const auth = {
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${serviceToken}`);
                return request;
            },
        };
        client.use(auth);
    }
    return client;
}
