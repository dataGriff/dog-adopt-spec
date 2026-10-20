#!/usr/bin/env node
// Lints every gated artifact: the OpenAPI with Redocly, the AsyncAPI with
// the official parser, the feature files with the Gherkin parser, the data
// contracts and service manifests structurally. Exit code 1 on any problem.
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
import { Parser } from '@asyncapi/parser';
import { GherkinClassicTokenMatcher, Parser as GherkinParser, AstBuilder } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

const root = fileURLToPath(new URL('..', import.meta.url));
let failures = 0;
const fail = (msg) => { failures++; console.error(`  ✖ ${msg}`); };
const ok = (msg) => console.log(`  ✔ ${msg}`);

const system = parse(readFileSync(`${root}system.yaml`, 'utf8'));
console.log(`System ${system.name} (${system.org})`);
for (const key of ['apiVersion', 'kind', 'name', 'title', 'domain', 'org', 'summary', 'services']) if (!(key in system)) fail(`system.yaml missing ${key}`);

const asyncapiParser = new Parser();
const uuid = IdGenerator.uuid();

for (const rel of system.services ?? []) {
  const servicePath = `${root}${rel}`;
  if (!existsSync(servicePath)) { fail(`${rel} missing`); continue; }
  const service = parse(readFileSync(servicePath, 'utf8'));
  const dir = servicePath.replace(/service\.yaml$/, '');
  console.log(`\nService ${service.name} v${service.version}`);
  for (const key of ['apiVersion', 'kind', 'name', 'title', 'domain', 'owner', 'version', 'summary', 'artifacts', 'produces', 'consumes']) if (!(key in service)) fail(`${rel} missing ${key}`);

  for (const artifact of service.artifacts ?? []) {
    const file = `${dir}${artifact.path}`;
    if (!existsSync(file)) { fail(`${artifact.path} declared but missing`); continue; }
    try {
      switch (artifact.kind) {
        case 'openapi': {
          execSync(`npx redocly lint "${file}" --format=stylish`, { cwd: root, stdio: 'pipe' });
          const doc = parse(readFileSync(file, 'utf8'));
          if (doc.info.version !== artifact.version) fail(`${artifact.path} info.version ${doc.info.version} != manifest ${artifact.version}`);
          ok(`openapi ${artifact.path}`);
          break;
        }
        case 'asyncapi': {
          const { document, diagnostics } = await asyncapiParser.parse(readFileSync(file, 'utf8'), { source: file });
          const errors = diagnostics.filter((d) => d.severity === 0);
          if (errors.length || !document) { errors.forEach((e) => fail(`${artifact.path}: ${e.message} at ${e.path?.join('/')}`)); break; }
          if (document.info().version() !== artifact.version) fail(`${artifact.path} info.version != manifest ${artifact.version}`);
          const addresses = document.channels().all().map((c) => c.address());
          for (const produced of service.produces ?? []) if (!addresses.includes(produced)) fail(`${service.name} produces ${produced} but no channel has that address`);
          ok(`asyncapi ${artifact.path} (${addresses.join(', ')})`);
          break;
        }
        case 'feature': {
          const parser = new GherkinParser(new AstBuilder(uuid), new GherkinClassicTokenMatcher());
          const doc = parser.parse(readFileSync(file, 'utf8'));
          const scenarios = doc.feature?.children.filter((c) => c.scenario).length ?? 0;
          if (!scenarios) fail(`${artifact.path} has no scenarios`);
          ok(`feature ${artifact.path} (${scenarios} scenarios)`);
          break;
        }
        case 'data-contract': {
          const doc = parse(readFileSync(file, 'utf8'));
          for (const key of ['apiVersion', 'kind', 'id', 'name', 'version', 'status', 'schema']) if (!(key in doc)) fail(`${artifact.path} missing ${key}`);
          if (doc.kind !== 'DataContract') fail(`${artifact.path} kind must be DataContract`);
          if (doc.version !== artifact.version) fail(`${artifact.path} version != manifest ${artifact.version}`);
          for (const table of doc.schema ?? []) {
            if (!table.name || !Array.isArray(table.properties)) fail(`${artifact.path} schema entry without name/properties`);
            for (const rel of table.relationships ?? []) {
              const [toTable] = rel.to.split('.');
              if (!doc.schema.some((t) => t.name === toTable)) fail(`${artifact.path} relationship ${rel.id} points at unknown table ${toTable}`);
            }
          }
          ok(`data-contract ${artifact.path} (${doc.schema.length} objects)`);
          break;
        }
        default:
          fail(`${artifact.path}: unknown kind ${artifact.kind}`);
      }
    } catch (err) {
      fail(`${artifact.path}: ${err.stdout?.toString() || err.message}`);
    }
  }
}

// Cross-service: every dependsOn operation must exist in the target's OpenAPI.
const operationIds = new Set();
const openapi = parse(readFileSync(`${root}services/dogs-api/openapi/dogs-api.openapi.yaml`, 'utf8'));
for (const item of Object.values(openapi.paths)) for (const op of Object.values(item)) if (op && typeof op === 'object' && op.operationId) operationIds.add(op.operationId);
for (const rel of system.services) {
  const service = parse(readFileSync(`${root}${rel}`, 'utf8'));
  for (const dep of service.dependsOn ?? []) if (!operationIds.has(dep.operation)) fail(`${service.name} depends on ${dep.service}.${dep.operation} which does not exist`);
}

console.log(failures ? `\n${failures} problem(s)` : '\nAll contracts valid');
process.exit(failures ? 1 : 0);
