import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const project = process.cwd();
const parent = path.dirname(project);
const directory = 'react-create-workshop';
const target = path.join(parent, directory);
if (!existsSync(path.join(project, 'node_modules/vite-plus/bin/vp'))) {
  throw new Error('Run from the workshop project root after npm ci.');
}
if (existsSync(target)) {
  throw new Error(
    `Already exists: ${target}. Choose another directory in this script or keep the existing lab.`,
  );
}
const args = [
  path.join(project, 'node_modules/vite-plus/bin/vp'),
  'create',
  'vite',
  '--package-manager',
  'npm',
  '--no-agent',
  '--no-editor',
  '--no-git',
  '--no-hooks',
  '--no-interactive',
  '--',
  directory,
  '--template',
  'react-ts',
];
console.log('Pinned Vite+ CLI:', args.slice(1).join(' '));
console.log('Parent directory:', parent);
const result = spawnSync(process.execPath, args, {
  cwd: parent,
  stdio: 'inherit',
  env: {
    ...process.env,
    PATH: `${path.join(project, 'node_modules/.bin')}${path.delimiter}${process.env.PATH ?? ''}`,
  },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
