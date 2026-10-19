#!/usr/bin/env node
// Regenerates everything under src/generated and dist from the contracts.
// Output is committed so consumers can install this package straight from
// git without a build step; CI runs check-drift to prove it is current.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { parse } from 'yaml';
import openapiTS, { astToString } from 'openapi-typescript';

const root = new URL('..', import.meta.url).pathname;
const run = (cmd) => execSync(cmd, { cwd: root, stdio: 'inherit' });

mkdirSync(`${root}src/generated`, { recursive: true });
mkdirSync(`${root}dist/seed`, { recursive: true });

// 1. Bundle the OpenAPI document (resolves $refs, keeps it a single file).
run('npx redocly bundle services/dogs-api/openapi/dogs-api.openapi.yaml -o dist/openapi.json --ext json');
const openapi = JSON.parse(readFileSync(`${root}dist/openapi.json`, 'utf8'));

// 2. TypeScript types for every path, operation and schema.
const ast = await openapiTS(openapi, { exportType: false, enum: false });
writeFileSync(`${root}src/generated/openapi.d.ts`, `/* eslint-disable */\n// Generated from services/dogs-api/openapi/dogs-api.openapi.yaml. Do not edit.\n${astToString(ast)}`);

// 3. Zod schemas per operation (params, query, headers, body, responses).
run('npx orval --config orval.config.ts');
let zod = readFileSync(`${root}src/generated/zod.ts`, 'utf8');
zod = `/* eslint-disable */\n// Generated from services/dogs-api/openapi/dogs-api.openapi.yaml by orval. Do not edit.\n${zod}`;
writeFileSync(`${root}src/generated/zod.ts`, zod);

// 4. AsyncAPI documents as JSON with the cross-file $refs inlined, so a
//    consumer can validate an envelope without the YAML on disk.
for (const [service, file] of [['finder', 'finder.asyncapi.yaml'], ['dogs-api', 'dogs-api.asyncapi.yaml']]) {
  const doc = parse(readFileSync(`${root}services/${service}/asyncapi/${file}`, 'utf8'));
  inlineExternalRefs(doc, openapi);
  writeFileSync(`${root}dist/${service}.asyncapi.json`, JSON.stringify(doc, null, 2) + '\n');
}

// 5. Seed data.
copyFileSync(`${root}seed/rescues.json`, `${root}dist/seed/rescues.json`);
copyFileSync(`${root}seed/breeds.json`, `${root}dist/seed/breeds.json`);

// 6. Compile src to dist (index.js, index.d.ts, generated/*).
rmSync(`${root}dist/index.js`, { force: true });
run('npx tsc -p tsconfig.build.json');
copyFileSync(`${root}src/generated/openapi.d.ts`, `${root}dist/generated/openapi.d.ts`);

console.log('generated: dist/openapi.json, dist/*.asyncapi.json, dist/seed/*.json, src/generated/*, dist/*.js');

function inlineExternalRefs(doc, openapiDoc) {
  const needed = new Set();
  walk(doc);
  doc.components ??= {};
  doc.components.schemas ??= {};
  // Pull in every OpenAPI schema the inlined fragments (transitively) reference.
  const queue = [...needed];
  while (queue.length) {
    const name = queue.shift();
    if (doc.components.schemas[name]) continue;
    const schema = JSON.parse(JSON.stringify(openapiDoc.components.schemas[name]));
    doc.components.schemas[name] = schema;
    for (const ref of localRefs(schema)) if (!doc.components.schemas[ref]) queue.push(ref);
  }

  function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (typeof node.$ref === 'string' && node.$ref.includes('.openapi.yaml#')) {
      const pointer = node.$ref.split('#')[1];
      const resolved = pointer.split('/').slice(1).map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~')).reduce((o, p) => o[p], openapiDoc);
      delete node.$ref;
      Object.assign(node, JSON.parse(JSON.stringify(resolved)));
      for (const ref of localRefs(node)) needed.add(ref);
      return;
    }
    for (const value of Object.values(node)) walk(value);
  }
}

function localRefs(fragment) {
  const refs = [];
  JSON.stringify(fragment, (k, v) => {
    if (k === '$ref' && typeof v === 'string' && v.startsWith('#/components/schemas/')) refs.push(v.slice('#/components/schemas/'.length));
    return v;
  });
  return refs;
}
