/* Los encargos de Practicar: que cada uno se pueda resolver en su cinta,
   que las respuestas tengan una sola buena y que los códigos de los
   enlaces (los QR de las fichas) vayan y vuelvan. node --test pruebas/ */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const PR = require('../src/encargos.js');
let semilla = 7;
PR.conAzar(() => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; });

function resoluble(e){
  assert.ok(e.t && e.bien, 'tiene texto y réplica');
  if(e.ops){
    assert.equal(e.ops.filter(o => o.ok).length, 1, 'una sola respuesta buena: ' + e.t);
    assert.ok(e.ops.length >= 2, 'hay entre qué elegir: ' + e.t);
    assert.equal(new Set(e.ops.map(o => o.t)).size, e.ops.length, 'sin respuestas repetidas: ' + e.t);
  }
  if(e.sinCinta){ assert.ok(e.ops, 'sin cinta, se contesta eligiendo'); return; }
  assert.ok(e.meta !== null && e.meta !== undefined, 'tiene meta');
  assert.ok(e.meta > e.desde && e.meta < e.desde + e.pasos, 'la meta cabe en la cinta: ' + e.t);
  /* algún corte de los botones pasa justo por la meta */
  assert.ok(e.cortes.some(k => Math.abs(e.meta * k - Math.round(e.meta * k)) < 1e-9), 'algún corte llega: ' + e.t);
  if(e.prueba) assert.ok(e.prueba.v >= e.desde && e.prueba.v <= e.desde + e.pasos, 'la prueba cabe: ' + e.t);
}

for(const tipo of Object.keys(PR.TIPOS)){
  test('los encargos de ' + tipo + ' se pueden resolver, y su código va y vuelve', () => {
    for(let i = 0; i < 300; i++){
      const e = PR.genera(null, tipo);
      assert.equal(e.tipo, tipo);
      resoluble(e);
      const otra = PR.deEnlace(tipo, e.c);
      assert.equal(otra.c, e.c, 'el código lee los mismos datos');
      assert.equal(otra.t, e.t, 'y da el mismo encargo');
    }
  });
}

for(const pes of ['cinta', 'partir', 'juntar', 'partes']){
  test('cada pestaña da encargos de sus tipos', () => {
    const vistos = new Set();
    for(let i = 0; i < 200; i++){ const e = PR.genera(pes); vistos.add(e.tipo); assert.equal(PR.TIPOS[e.tipo].pes, pes); }
    assert.deepEqual([...vistos].sort(), PR.PESTANAS[pes].slice().sort());
  });
}

test('los ejemplos de los enlaces dan lo que dicen', () => {
  assert.equal(PR.deEnlace('situar', '5/4').meta, 5 / 4);
  assert.equal(PR.deEnlace('comparar', '3/4_9/5').prueba.v, 3 / 4);
  assert.equal(PR.deEnlace('repartir', '10_3').meta, 10 / 3);
  assert.equal(PR.deEnlace('restar', '1/2_7/4').meta, -5 / 4);
  assert.equal(PR.deEnlace('partes', '2/3_1/2').meta, 1 / 3);
  assert.ok(PR.deEnlace('cantidad', '12000_3/4').ops.some(o => o.ok && /^9\.?000 \$$/.test(o.t)));
  assert.ok(PR.deEnlace('dividir', '3/4_1/8').ops.some(o => o.ok && o.t === '6'));
  assert.ok(PR.deEnlace('dividir', '3/4_1/2').ops.some(o => o.ok && o.t === '3/2'));
  assert.ok(PR.deEnlace('decimal', '5/6').ops.some(o => o.ok && /periódico/.test(o.t)));
});

test('un código que no vale da uno al azar del mismo tipo', () => {
  for(const [m, c] of [['situar', '7/7'], ['situar', 'hola'], ['sumar', '1/7_1/11'], ['restar', '1/2_9/2'], ['dividir', '3/4_0'], ['repartir', '9_3']]){
    const e = PR.deEnlace(m, c);
    assert.equal(e.tipo, m); assert.notEqual(e.c, c); resoluble(e);
  }
  assert.equal(PR.deEnlace('nada', '1/2'), null);
});

test('los códigos del README se pueden abrir', () => {
  const md = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const enl = [...md.matchAll(/j=practicar&m=(\w+)&c=([-\d/_]+)/g)];
  assert.ok(enl.length >= 9, 'el README trae los enlaces');
  for(const [, m, c] of enl){ assert.ok(PR.TIPOS[m], m); assert.equal(PR.deEnlace(m, c).c, c, m + ' ' + c); }
});

test('las fracciones se escriben simplificadas y con su signo', () => {
  assert.equal(PR.fr(6, 8), '3/4');
  assert.equal(PR.fr(-2, 4), '−1/2');
  assert.equal(PR.fr(8, 4), '2');
});
