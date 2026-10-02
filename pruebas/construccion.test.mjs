/* index.html tiene que ser lo que sale de src/: si alguien edita src/ y no
   construye, esta prueba lo dice */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { construye } from '../construye.mjs';

test('index.html está construido a partir de src/', () => {
  const hecho = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(hecho, construye(), 'ejecuta: node construye.mjs');
});

test('index.html no depende de ningún fichero del repositorio', () => {
  const h = construye();
  assert.doesNotMatch(h, /<script src="/);
  assert.doesNotMatch(h, /<link rel="stylesheet" href="src/);
});
