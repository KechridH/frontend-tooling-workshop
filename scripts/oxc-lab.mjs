import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minifySync } from 'oxc-minify';
import { parseSync } from 'oxc-parser';
import { ResolverFactory } from 'oxc-resolver';
import { transformSync } from 'oxc-transform';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'workshop-artifacts/oxc');
const displayPath = (value) => path.relative(root, value).replaceAll('\\', '/');

function ensureValid(result, label) {
  if (result.errors.length) {
    throw new Error(`${label}: ${result.errors.map((error) => error.message).join('; ')}`);
  }
  return result;
}

async function source(relative) {
  const filename = path.join(root, relative);
  return { filename, code: await readFile(filename, 'utf8') };
}

async function report(name, value) {
  await writeFile(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`);
  console.log(JSON.stringify(value, null, 2));
}

async function parse() {
  const { filename, code } = await source('src/app/App.tsx');
  const result = ensureValid(parseSync(filename, code), 'Parse App.tsx');
  await report('imports.json', {
    file: displayPath(filename),
    imports: result.module.staticImports.map((entry) => entry.moduleRequest.value),
    exports: result.module.staticExports.length,
    note: 'Syntax/module information; no type checking or transitive dependency graph.',
  });
}

async function resolve() {
  const { filename, code } = await source('src/app/App.tsx');
  const parsed = ensureValid(parseSync(filename, code), 'Parse imports');
  const resolver = new ResolverFactory({
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.svg'],
    conditionNames: ['import', 'browser', 'default'],
  });
  const imports = parsed.module.staticImports.map((entry) => {
    const specifier = entry.moduleRequest.value;
    const result = resolver.sync(path.dirname(filename), specifier);
    if (result.error || !result.path) {
      throw new Error(`Cannot resolve ${specifier}: ${result.error ?? 'no file returned'}`);
    }
    return { specifier, file: displayPath(result.path) };
  });
  await report('resolved.json', {
    importer: displayPath(filename),
    conditions: ['import', 'browser', 'default'],
    imports,
    note: 'Standalone resolution with these options; Vite plugins can add resolution behavior.',
  });
}

async function transform() {
  for (const relative of ['src/components/Transactions.tsx', 'src/app/banking.ts']) {
    const { filename, code } = await source(relative);
    const result = ensureValid(
      transformSync(filename, code, {
        target: 'es2022',
        jsx: { runtime: 'automatic', development: false },
        sourcemap: true,
      }),
      `Transform ${relative}`,
    );
    const name = `${path.basename(filename).replace(/\.tsx?$/, '')}.js`;
    await writeFile(path.join(output, name), result.code);
    await writeFile(path.join(output, `${name}.map`), JSON.stringify(result.map));
    console.log(`${relative} → workshop-artifacts/oxc/${name} (+ source map)`);
  }
  console.log(
    'Type syntax stripped; JSX lowered. Imports remain; this is not a bundle/type check.',
  );
}

async function minify() {
  const code = await readFile(path.join(output, 'banking.js'), 'utf8');
  const result = ensureValid(
    minifySync('banking.js', code, { compress: { target: 'es2022' } }),
    'Minify banking.js',
  );
  ensureValid(parseSync('banking.min.js', result.code), 'Parse minified output');
  await writeFile(path.join(output, 'banking.min.js'), result.code);

  // This local helper module has no imports; execute both versions to compare example behavior.
  const load = (text) =>
    import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
  const original = await load(code);
  const compact = await load(result.code);
  for (const input of ['100.25', '12,50', '0.01', '0', '-1', '1.001']) {
    assert.equal(compact.parseAmount(input), original.parseAmount(input));
  }
  assert.deepEqual(compact.createBankSnapshot(), original.createBankSnapshot());
  assert.equal(compact.formatMoney(10025), original.formatMoney(10025));
  await report('minified.json', {
    input: 'workshop-artifacts/oxc/banking.js',
    output: 'workshop-artifacts/oxc/banking.min.js',
    beforeBytes: Buffer.byteLength(code),
    afterBytes: Buffer.byteLength(result.code),
    checks: '6 amount examples, fixture snapshot, currency formatting agree.',
    note: 'Raw bytes for one helper module; no app bundle, gzip, or runtime-performance claim.',
  });
}

async function summary() {
  for (const name of ['imports.json', 'resolved.json', 'minified.json']) {
    await readFile(path.join(output, name), 'utf8');
  }
  console.log('All four Oxc labs completed. Inspect workshop-artifacts/oxc/.');
}

const commands = { parse, resolve, transform, minify, summary };
try {
  const command = commands[process.argv[2]];
  if (!command) throw new Error('Choose parse, resolve, transform, minify, or summary.');
  await mkdir(output, { recursive: true });
  await command();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
