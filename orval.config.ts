import { defineConfig } from 'orval';

// Generates zod schemas straight from the OpenAPI document so the API can
// validate requests and responses against the contract rather than a
// hand-written copy of it. Output is checked in; CI fails on drift.
export default defineConfig({
  dogsApiZod: {
    input: {
      target: './services/dogs-api/openapi/dogs-api.openapi.yaml',
    },
    output: {
      target: './src/generated/zod.ts',
      client: 'zod',
      mode: 'single',
      fileExtension: '.ts',
      override: {
        zod: {
          generate: { param: true, query: true, header: true, body: true, response: true },
          coerce: false,
          strict: { body: true, response: true, query: true, param: true },
          generateEachHttpStatus: true,
        },
      },
    },
  },
});
