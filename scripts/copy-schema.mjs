import { mkdir, copyFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const source = resolve(projectRoot, 'src', 'database', 'schema.sql');
const destination = resolve(projectRoot, 'dist', 'database', 'schema.sql');

await stat(source);
await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
