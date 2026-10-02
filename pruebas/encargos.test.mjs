/* Los encargos de Practicar: que cada uno se pueda resolver en su cinta y
   que las respuestas tengan una sola buena. node --test pruebas/ */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const PR = require('../src/encargos.js');
let semilla = 7;
PR.conAzar(() => { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; });

for(const pes of ['cinta', 'partir', 'juntar', 'partes']){
  test('los encargos de ' + pes + ' se pueden resolver', () => {
    for(let i = 0; i < 300; i++){
      const e = PR.genera(pes);
      assert.ok(e.t && e.bien, 'tiene texto y réplica');
      if(e.ops){
        assert.equal(e.ops.filter(o => o.ok).length, 1, 'una sola respuesta buena: ' + e.t);
        assert.equal(new Set(e.ops.map(o => o.t)).size, e.ops.length, 'sin respuestas repetidas');
      }
      if(e.sinCinta){ assert.ok(e.ops, 'sin cinta, se contesta eligiendo'); continue; }
      assert.ok(e.meta !== null && e.meta !== undefined, 'tiene meta');
      assert.ok(e.meta > e.desde && e.meta < e.desde + e.pasos, 'la meta cabe en la cinta: ' + e.t);
      /* algún corte de los botones pasa justo por la meta */
      assert.ok(e.cortes.some(k => Math.abs(e.meta * k - Math.round(e.meta * k)) < 1e-9), 'algún corte llega: ' + e.t);
      if(e.prueba) assert.ok(e.prueba.v >= e.desde && e.prueba.v <= e.desde + e.pasos, 'la prueba cabe');
    }
  });
}

test('las fracciones se escriben simplificadas y con su signo', () => {
  assert.equal(PR.fr(6, 8), '3/4');
  assert.equal(PR.fr(-2, 4), '−1/2');
  assert.equal(PR.fr(8, 4), '2');
});
