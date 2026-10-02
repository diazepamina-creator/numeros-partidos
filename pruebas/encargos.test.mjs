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
  if(e.sinCinta){ assert.ok(e.ops || e.papel, 'sin cinta, se contesta eligiendo o escribiendo');
    if(e.papel) assert.ok(PR.revisa(e.papel, PR.fr(e.res.n, e.res.d) + ' + 0', PR.fr(e.res.n, e.res.d)).bien, 'el resultado vale: ' + e.t);
    return; }
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
  const enl = [...md.matchAll(/j=practicar&m=(\w+)&c=([-\d/_()srmd]+)/g)];
  assert.ok(enl.length >= 9, 'el README trae los enlaces');
  for(const [, m, c] of enl){ assert.ok(PR.TIPOS[m], m); assert.equal(PR.deEnlace(m, c).c, c, m + ' ' + c); }
  /* los de las fichas de 1.º valen también en la ruta de 1.º */
  const uno = [...md.matchAll(/j=practicar&m=(\w+)&c=([-\d/_()srmd]+)(?:&papel)?&ruta=1eso/g)];
  assert.ok(uno.length >= 15, 'la tabla de 1.º');
  PR.ponRuta('1eso');
  try{ for(const [, m, c] of uno){ const e = PR.deEnlace(m, c); assert.equal(e.c, c, '1.º: ' + m + ' ' + c); resoluble(e); } }
  finally{ PR.ponRuta(''); }
});

test('las fracciones se escriben simplificadas y con su signo', () => {
  assert.equal(PR.fr(6, 8), '3/4');
  assert.equal(PR.fr(-2, 4), '−1/2');
  assert.equal(PR.fr(8, 4), '2');
});

test('las cuentas escritas se leen con fracciones exactas', () => {
  const v = s => { const q = PR.cuenta(s); return q && q.n + '/' + q.d; };
  assert.equal(v('3/4 + 1/8'), '7/8');
  assert.equal(v('2 : 2/5'), '5/1');
  assert.equal(v('2 : 3/4'), '8/3', 'la fracción va junta: 2 : (3/4)');
  assert.equal(v('(1/2 + 1/4) · 2/3'), '1/2');
  assert.equal(v('1/2 + 1/4 * 2/3'), '2/3', 'primero el ·');
  assert.equal(v('2/3 − 1/6 x 2'), '1/3');
  assert.equal(v('0,5 - 1/3'), '1/6');
  assert.equal(v('-1/2 + 1'), '1/2');
  for(const malo of ['', '2(3)', '1/0', '3 +', '(1/2', 'hola']) assert.equal(PR.cuenta(malo), null, malo);
  assert.deepEqual(PR.pasos('(1/2 + 1/4) · 2/3'), ['(1/2 + 1/4) · 2/3', '3/4 · 2/3', '1/2']);
});

test('lo escrito sobre el papel se revisa', () => {
  const P = {res: {n: 3, d: 4}, cuenta: true};
  assert.equal(PR.revisa(P, '2/3 + 1/4 − 1/6', '3/4').bien, true);
  assert.equal(PR.revisa(P, '2/3 + 1/4 − 1/6', '9/12').bien, true, 'vale sin simplificar');
  assert.equal(PR.revisa(P, '1/4 + 1/2', '3/4').bien, true, 'cualquier cuenta que dé lo mismo');
  assert.equal(PR.revisa(P, '', '3/4').k, 'falta');
  assert.equal(PR.revisa(P, '3/4', '3/4').k, 'sinop');
  assert.equal(PR.revisa(P, '2/3 + 1/4 + 1/6', '13/12').k, 'otra');
  assert.equal(PR.revisa(P, '2/3 + 1/4 − 1/6', '2/3').k, 'resmal');
  assert.equal(PR.revisa(P, '2/3 + 1/4 − 1/6', 'tres').k, 'nores');
  assert.equal(PR.revisa({res: {n: 1, d: 2}, cuenta: false, trampas: [{q: {n: 2, d: 3}, r: 'orden'}]}, '', '2/3').k, 'trampa');
});

test('las combinadas: la cuenta da su resultado y la trampa es otra', () => {
  for(let i = 0; i < 300; i++){
    const e = PR.genera(null, 'combinadas');
    assert.ok(e.papel && !e.papel.cuenta && e.sinCinta);
    const cu = e.t.match(/<b>(.*?)<\/b>/)[1];
    assert.equal(PR.revisa(e.papel, '', PR.pasos(cu).pop()).bien, true, cu);
    e.papel.trampas.forEach(t => assert.notEqual(t.q.n * e.res.d, e.res.n * t.q.d, 'la trampa no es la buena: ' + cu));
  }
});

test('sin cinta: cada tipo de la pestaña se contesta eligiendo o escribiendo', () => {
  for(const pes of ['cinta', 'partir', 'juntar', 'partes']) for(let i = 0; i < 100; i++){
    const e = PR.genera(pes, null, true);
    assert.notEqual(e.tipo, 'situar');
    assert.ok(e.sinCinta && (e.ops || e.papel), e.tipo);
    if(e.papel && e.papel.cuenta){
      /* la cuenta del propio encargo, escrita, da el resultado */
      assert.ok(e.res && e.res.d > 0, e.tipo);
    }
  }
});

test('sin cinta, ningún encargo pide marcas', () => {
  for(const pes of ['cinta', 'partir', 'juntar', 'partes']) for(let i = 0; i < 100; i++){
    const e = PR.genera(pes, null, true);
    assert.doesNotMatch(e.t, /[Pp]onme|[Pp]on su marca|[Pp]on la pieza/, e.tipo + ': ' + e.t);
  }
});

test('la ruta de 1.º: sin periódicos ni negativos', () => {
  PR.ponRuta('1eso');
  try{
    assert.deepEqual(PR.deLaPestana('partir'), ['repartir']);
    for(let i = 0; i < 300; i++){
      const e = PR.genera('juntar', 'restar');
      assert.ok(e.desde === 0 && e.meta > 0 && e.prueba.v > 0, e.t);
      resoluble(e);
      for(const pes of ['cinta', 'partir', 'juntar', 'partes']){ const x = PR.genera(pes); assert.notEqual(x.tipo, 'decimal'); resoluble(x); }
    }
  }finally{ PR.ponRuta(''); }
  assert.ok(PR.deLaPestana('partir').includes('decimal'), 'sin la ruta, vuelven');
});
