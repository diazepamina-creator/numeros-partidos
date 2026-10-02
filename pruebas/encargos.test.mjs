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

/* ── 0.15: la cuenta se comprueba por sus números y su operación, no solo
   por lo que da ── */
const sinCinta = (m, c) => PR.aPapel(PR.deEnlace(m, c));
const k = (e, cu, re) => PR.revisa(e.papel, cu, re).k;

test('restar sin cinta: otros números que dan lo mismo no valen', () => {
  const e = sinCinta('restar', '5/6_1/3');
  assert.equal(k(e, '5/6 − 1/3', '1/2'), 'bien');
  assert.equal(k(e, '1 − 1/2', '1/2'), 'otrosnum', 'da 1/2, pero no son los números del encargo');
  assert.equal(k(e, '1/4 + 1/4', '1/2'), 'otrosnum');
  assert.match(PR.revisa(e.papel, '1 − 1/2', '1/2').r, /qué tenía y qué pagó/);
});

test('restar sin cinta: el orden de la resta al revés no vale', () => {
  const e = sinCinta('restar', '5/6_1/3');
  assert.notEqual(k(e, '1/3 − 5/6', '1/2'), 'bien');
  assert.notEqual(k(e, '1/3 − 5/6', '-1/2'), 'bien');
});

test('restar sin cinta: los equivalentes sí valen, sin simplificar', () => {
  const e = sinCinta('restar', '5/6_1/3');
  for(const cu of ['10/12 − 2/6', '5/6 − 2/6', '10/12 - 4/12', '(5/6) − (1/3)']) assert.equal(k(e, cu, '1/2'), 'bien', cu);
  assert.equal(k(e, '5/6 − 2/6', '3/6'), 'bien', 'el resultado, sin simplificar');
});

test('lo de siempre se sigue aceptando: ·, *, x, :, 0,5 y 12.000', () => {
  const p = sinCinta('partes', '2/3_1/2');
  for(const cu of ['1/2 · 2/3', '1/2 * 2/3', '1/2 x 2/3', '2/3 · 1/2', '0,5 · 2/3', '2/3 : 2']) assert.equal(k(p, cu, '2/6'), 'bien', cu);
  const s = sinCinta('sumar', '1/4_7/8');
  assert.equal(k(s, '7/8 + 1/4', '9/8'), 'bien', 'sumar no tiene orden');
  assert.equal(k(s, '2/8 + 7/8', '9/8'), 'bien');
  assert.equal(k(s, '1 + 1/8', '9/8'), 'otrosnum');
  const r = sinCinta('repartir', '10_3');
  assert.equal(k(r, '10 : 3', '10/3'), 'bien');
  assert.equal(k(r, '3 + 1/3', '10/3'), 'otrosnum');
  const c = sinCinta('cantidad', '12000_3/4');
  for(const cu of ['3/4 · 12000', '12.000 · 3/4', '12000 : 4 · 3', '12 000 · 3 : 4']) assert.equal(k(c, cu, '9.000'), 'bien', cu);
  assert.equal(k(c, '4500 · 2', '9000'), 'otrosnum');
});

test('dividir sin cinta se escribe, no se elige: la cuenta y el resultado', () => {
  const e = sinCinta('dividir', '3/2_1/4');
  assert.ok(e.papel && e.papel.cuenta && !e.ops, 'sin opciones');
  for(const cu of ['3/2 : 1/4', '3/2 · 4', '4 · 3/2', '6/4 : 2/8']) assert.equal(k(e, cu, '6'), 'bien', cu);
  assert.equal(k(e, '3 · 2', '6'), 'otrosnum');
  assert.notEqual(k(e, '1/4 : 3/2', '6'), 'bien');
  assert.notEqual(k(e, '3/2 · 1/4', '6'), 'bien');
  /* con cinta, sigue siendo de elegir */
  assert.ok(PR.deEnlace('dividir', '3/2_1/4').ops);
});

test('sin cinta, en todos los tipos que se escriben: su cuenta vale y otra que da lo mismo, no', () => {
  for(const tipo of ['repartir', 'sumar', 'restar', 'cantidad', 'partes', 'dividir']) for(let i = 0; i < 100; i++){
    const e = PR.aPapel(PR.genera(null, tipo));
    assert.ok(e.papel && e.papel.cuenta && !e.ops, tipo);
    const res = PR.fr(e.res.n, e.res.d);
    assert.equal(k(e, e.papel.formas[0], res), 'bien', tipo + ': ' + e.papel.formas[0]);
    assert.equal(k(e, res + ' + 0', res), 'otrosnum', tipo + ': ' + res + ' + 0');
  }
});

test('los encargos sobre el papel de los casos 5, 6, 7 y 9 piden sus números', () => {
  const src = readFileSync(new URL('../src/ciudad.js', import.meta.url), 'utf8');
  const papeles = [...src.matchAll(/papel:(\{res:.*?\}),\n/g)].map(m => Function('return ' + m[1])());
  assert.equal(papeles.length, 4);
  for(const p of papeles){
    const res = PR.fr(p.res.n, p.res.d);
    assert.equal(PR.revisa(p, p.ej, p.ver).k, 'bien', p.ej);
    assert.equal(PR.revisa(p, res + ' + 0', res).k, 'otrosnum', p.ej);
    assert.ok(p.pregunta, 'Liz pregunta por los números: ' + p.ej);
  }
  const c5 = papeles.find(p => p.ej.startsWith('2/3'));
  assert.equal(PR.revisa(c5, '8/12 + 3/12 − 2/12', '9/12').k, 'bien', 'con los equivalentes');
  assert.equal(PR.revisa(c5, '1/2 + 1/4', '3/4').k, 'otrosnum');
  const c9 = papeles.find(p => p.ej.startsWith('3 :'));
  assert.equal(PR.revisa(c9, '3 · 4/3', '4').k, 'bien', 'por el inverso');
  const c6 = papeles.find(p => p.ej.includes('12000'));
  assert.equal(PR.revisa(c6, '12.000 · 3/4 : 3', '3.000').k, 'bien');
});

/* ── 0.16: «de» como multiplicación, y la cuenta al revés ── */
test('«2/3 de 3/4» se lee como 2/3 · 3/4', () => {
  assert.deepEqual(PR.cuenta('2/3 de 3/4'), PR.cuenta('2/3 · 3/4'));
  assert.deepEqual(PR.cuenta('3/4 DE 12000'), {n: 9000, d: 1});
  const p = sinCinta('partes', '3/4_2/3');
  assert.equal(k(p, '2/3 de 3/4', '1/2'), 'bien');
  const c = sinCinta('cantidad', '12000_3/4');
  assert.equal(k(c, '3/4 de 12000', '9000'), 'bien');
  /* sin tocar lo demás: la x de multiplicar y las combinadas con letras */
  assert.deepEqual(PR.cuenta('1/2 x 2/3'), {n: 1, d: 3});
  assert.equal(PR.deEnlace('combinadas', '1/2s1/4m2/3').c, '1/2s1/4m2/3');
});

test('la cuenta al revés: Liz dice qué ha pasado', () => {
  const d = sinCinta('dividir', '3/2_1/4'), rd = PR.revisa(d.papel, '1/4 : 3/2', '6');
  assert.equal(rd.k, 'reves');
  assert.match(rd.r, /la tela entre lo que lleva cada pieza/);
  assert.equal(k(sinCinta('restar', '5/6_1/3'), '1/3 − 5/6', '1/2'), 'reves');
  assert.equal(k(sinCinta('repartir', '10_3'), '3 : 10', '10/3'), 'reves');
  assert.equal(k(d, '4 : 3/2', '6'), 'otra', 'otros números, al revés o no, siguen siendo otra cuenta');
  /* sumar y multiplicar no tienen revés: el orden da igual */
  assert.equal(k(sinCinta('sumar', '1/4_7/8'), '7/8 + 1/4', '9/8'), 'bien');
  const src = readFileSync(new URL('../src/ciudad.js', import.meta.url), 'utf8');
  const c9 = [...src.matchAll(/papel:(\{res:.*?\}),\n/g)].map(m => Function('return ' + m[1])()).find(p => p.ej.startsWith('3 :'));
  assert.equal(PR.revisa(c9, '3/4 : 3', '4').k, 'reves');
  assert.match(c9.reves, /pañuelo/);
});
