/* ══════════════════════════════════════════════════════════════════════
   LOS ENCARGOS DE PRACTICAR · los generadores, sin pantalla
   Nueve tipos de encargo, dos o tres por pestaña. Cada tipo sabe sacar unos
   datos al azar, escribirlos en un código corto, leerlos de un enlace y
   montar con ellos el encargo: cómo es la cinta (pasos, desde dónde,
   cortes), si lleva la prueba verde de Liz, adónde tiene que ir la marca
   roja (meta) y, si hace falta, qué respuesta se elige.
   Vale en el navegador y en Node (pruebas/encargos.test.mjs).

   LOS ENLACES (los QR de las fichas): ?j=practicar&m=<tipo>&c=<datos>
   Las fracciones se escriben n/d (−1/2 es -1/2; un entero, sin barra) y
   los datos se separan con _:
     situar    c=5/4          la marca en 5/4
     comparar  c=3/4_9/5      la prueba en 3/4, la marca en 9/5, y el signo
     repartir  c=10_3         10 metros en 3 tramos
     decimal   c=5/6          ¿exacto o periódico?
     sumar     c=1/4_7/8      1/4 + 7/8
     restar    c=1/2_7/4      1/2 − 7/4
     cantidad  c=12000_3/4    3/4 de 12 000 $
     partes    c=2/3_1/2      1/2 de 2/3
     dividir   c=3/4_1/8      3/4 : 1/8
     combinadas c=(1/2s1/4)m2/3   (1/2 + 1/4) · 2/3: s suma, r resta,
                              m multiplica, d divide
   Con &papel, sin cinta: la cuenta y el resultado, escritos.
   Sin c (o con unos datos que no caben en la cinta), uno al azar de ese
   tipo. Sin m, Practicar en la pestaña de siempre.
   ══════════════════════════════════════════════════════════════════════ */
const PR = (() => {
  let azar = Math.random;
  const ent = (a, b) => a + Math.floor(azar() * (b - a + 1));
  const elige = l => l[Math.floor(azar() * l.length)];
  const mcdN = (a, b) => { a = Math.abs(a); b = Math.abs(b); while(b){ [a, b] = [b, a % b]; } return a || 1; };
  const mcmN = (a, b) => a / mcdN(a, b) * b;
  /* una fracción, escrita: 5/4, −1/2, 3 */
  const fr = (n, d) => { const g = mcdN(n, d); n /= g; d /= g;
    return (n < 0 ? '−' : '') + (d === 1 ? Math.abs(n) : Math.abs(n) + '/' + d); };
  const baraja = l => { const c = l.slice(); for(let i = c.length - 1; i > 0; i--){ const j = Math.floor(azar() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };
  const CORTES = [2, 3, 4, 5, 6, 8, 9, 10, 12];
  /* los encargos se escriben con números dentro: el diccionario no los
     encuentra, así que cada frase va en las dos lenguas */
  const L = (es, va) => (typeof idioma !== 'undefined' && idioma === 'va') ? va : es;
  const $$ = x => x.toLocaleString('es-ES');

  /* Las fracciones de los datos van simplificadas, {n, d} con d > 0 */
  const Q = (n, d) => { if(d < 0){ n = -n; d = -d; } const g = mcdN(n, d); return {n: n / g, d: d / g}; };
  const v = q => q.n / q.d;
  const t = q => fr(q.n, q.d);
  const cq = q => q.d === 1 ? String(q.n) : q.n + '/' + q.d;
  const lq = s => { const m = /^(-?\d{1,6})(?:\/(\d{1,4}))?$/.exec(s || ''); if(!m) return null;
    const d = m[2] === undefined ? 1 : +m[2]; return d ? Q(+m[1], d) : null; };
  const leInt = s => /^\d{1,7}$/.test(s || '') ? +s : null;
  /* un punto se alcanza si algún corte de los botones pasa por él */
  const llega = q => q.d === 1 || CORTES.some(k => k % q.d === 0);
  /* dos datos separados por _, cada uno con su lector */
  const lee2 = (c, a, b) => { const p = String(c || '').split('_'); if(p.length !== 2) return null;
    const x = a(p[0]), y = b(p[1]); return x === null || y === null ? null : [x, y]; };
  const pasosPara = x => Math.max(2, Math.floor(x) + 1);
  const entera = q => q.d === 1;

  /* ── LAS CUENTAS ESCRITAS (sobre el papel). Se leen con fracciones
     exactas: 3/4 + 1/8, 2 · 3/5, 3/4 : 1/8, (1/2 + 1/4) · 2/3, 0,5 − 1/3.
     3/4 junto es una fracción (va antes que nada); · × * x multiplican;
     : ÷ y la barra entre otras cosas dividen. ── */
  const sumaQ = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  const OPS = {'+': (a, b) => sumaQ(a, b), '-': (a, b) => sumaQ(a, {n: -b.n, d: b.d}),
    '·': (a, b) => Q(a.n * b.n, a.d * b.d), ':': (a, b) => b.n === 0 ? null : Q(a.n * b.d, a.d * b.n)};
  function fichas(s){
    s = String(s || '').replace(/[−–]/g, '-').replace(/[×*x]/gi, '·').replace(/÷/g, ':').replace(/\s+/g, '');
    const out = []; let i = 0;
    const num = () => { const m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i)); if(!m) return null; i += m[0].length;
      const [e, f = ''] = m[0].split(/[.,]/); return Q(+(e + f), Math.pow(10, f.length)); };
    while(i < s.length){
      const c = s[i];
      if(/\d/.test(c)){ let q = num();
        if(s[i] === '/' && /\d/.test(s[i + 1] || '')){ i++; const d = num(); if(!d || d.n === 0) return null; q = OPS[':'](q, d); }
        out.push({q}); }
      else if('+-·:/()'.includes(c)){ out.push({o: c === '/' ? ':' : c}); i++; }
      else return null;
    }
    return out;
  }
  /* el árbol: {q} o {o, a, b}; null si no se entiende */
  function arbol(s){
    const f = fichas(s); if(!f || !f.length) return null;
    let i = 0;
    const ve = o => f[i] && f[i].o === o;
    function suma(){ let a = prod(); while(a && (ve('+') || ve('-'))){ const o = f[i++].o, b = prod(); if(!b) return null; a = {o, a, b}; } return a; }
    function prod(){ let a = uno(); while(a && (ve('·') || ve(':'))){ const o = f[i++].o, b = uno(); if(!b) return null; a = {o, a, b}; } return a; }
    function uno(){
      if(ve('-')){ i++; const a = uno(); return a && {o: '-', a: {q: Q(0, 1)}, b: a, menos: true}; }
      if(ve('(')){ i++; const a = suma(); if(!a || !ve(')')) return null; i++; return a; }
      if(f[i] && f[i].q){ return {q: f[i++].q}; }
      return null;
    }
    const a = suma();
    return a && i === f.length ? a : null;
  }
  const valor = a => { if(a.q) return a.q; const x = valor(a.a), y = valor(a.b); return x && y && OPS[a.o](x, y); };
  const cuenta = s => { const a = arbol(s); return a ? valor(a) : null; };
  const conOp = s => { const a = arbol(s); return !!(a && !a.q); };
  const igual = (a, b) => !!a && !!b && a.n * b.d === b.n * a.d;
  /* la cuenta escrita, con los paréntesis justos */
  const PRI = {'+': 1, '-': 1, '·': 2, ':': 2};
  function escribe(a, pri = 0, der = false){
    if(a.q) return a.q.n < 0 && pri ? '(' + t(a.q) + ')' : t(a.q);
    if(a.menos) return '−' + escribe(a.b, 3);
    const p = PRI[a.o], s = escribe(a.a, p) + ' ' + (a.o === '-' ? '−' : a.o) + ' ' + escribe(a.b, p, true);
    return p < pri || (p === pri && der) ? '(' + s + ')' : s;
  }
  /* un paso: se hacen a la vez todas las operaciones que ya tienen sus dos números */
  const paso = a => a.q ? a : (a.a.q && a.b.q ? {q: valor(a)} : {o: a.o, a: paso(a.a), b: paso(a.b), menos: a.menos});
  function pasos(s){
    let a = arbol(s); const l = [escribe(a)];
    while(!a.q){ a = paso(a); l.push(escribe(a)); }
    return l;
  }
  /* Revisa lo escrito sobre el papel: la cuenta (si se pide) y el resultado.
     papel = {res, cuenta: true|false, trampas: [{q, r}]}. Devuelve {bien, k}
     con k: falta, nocuenta, sinop, otra (con x, lo que da), nores, trampa (con r), resmal */
  function revisa(papel, cu, re){
    if(papel.cuenta){
      if(!String(cu || '').trim()) return {bien: false, k: 'falta'};
      const v = cuenta(cu);
      if(!v) return {bien: false, k: 'nocuenta'};
      if(!conOp(cu)) return {bien: false, k: 'sinop'};
      if(!igual(v, papel.res)) return {bien: false, k: 'otra', x: t(v)};
    }
    if(!String(re || '').trim()) return {bien: false, k: 'falta'};
    const r = cuenta(re);
    if(!r) return {bien: false, k: 'nores'};
    if(igual(r, papel.res)) return {bien: true, k: 'bien'};
    const tr = (papel.trampas || []).find(x => igual(r, x.q));
    if(tr) return {bien: false, k: 'trampa', r: tr.r};
    return {bien: false, k: 'resmal'};
  }

  /* Cada tipo: {pes, nombre, azar() → datos|null, vale(datos), cod(datos), lee(c) → datos|null,
     crea(datos) → encargo}. Un encargo es
     {t, pasos, desde, prueba:{v, nombre}|null, meta:v|null, ops:[{t, ok, r}]|null,
      sinCinta, tejas, pista, bien, mal} */
  const TIPOS = {
    /* situar: la marca en q */
    situar: {pes: 'cinta', nombre: 'Situar',
      azar: () => { const d = elige([2, 3, 4, 5, 6, 8]); return {q: Q(ent(1, 2 * d - 1), d)}; },
      vale: ({q}) => q.n > 0 && !entera(q) && v(q) < 4 && llega(q),
      cod: ({q}) => cq(q),
      lee: c => { const q = lq(c); return q && {q}; },
      crea: ({q}) => ({t: L('Liz ha encontrado una colilla a <b>' + t(q) + '</b> de paso de la esquina. Corta el paso como haga falta y ponme ahí la marca.', 'Liz ha trobat una burilla a <b>' + t(q) + '</b> de pas de la cantonada. Talla el pas com calga i posa-hi la marca.'),
        pasos: pasosPara(v(q)), desde: 0, prueba: null, meta: v(q),
        pista: L('Toca la cinta para llevar la marca roja.', 'Toca la cinta per a portar la marca roja.'),
        bien: L('Ahí está: ' + t(q) + '. El paso, cortado en ' + q.d + ', y ' + q.n + ' trozos desde la esquina.', 'Ací està: ' + t(q) + '. El pas, tallat en ' + q.d + ', i ' + q.n + ' trossos des de la cantonada.'),
        mal: L('Todavía no. Corta el paso en <b>' + q.d + '</b> trozos iguales y cuenta <b>' + q.n + '</b> desde la esquina.', 'Encara no. Talla el pas en <b>' + q.d + '</b> trossos iguals i compta-ne <b>' + q.n + '</b> des de la cantonada.')})},
    /* comparar: la prueba en p, la marca en q, y el signo */
    comparar: {pes: 'cinta', nombre: 'Comparar',
      azar: () => { const d1 = elige([2, 3, 4, 5, 6, 8]), d2 = elige([2, 3, 4, 5, 6, 8].filter(x => x !== d1));
        return {p: Q(ent(1, 2 * d1 - 1), d1), q: Q(ent(1, 2 * d2 - 1), d2)}; },
      vale: ({p, q}) => p.n > 0 && q.n > 0 && !entera(p) && !entera(q) && v(p) !== v(q) && v(p) < 4 && v(q) < 4 && llega(q),
      cod: ({p, q}) => cq(p) + '_' + cq(q),
      lee: c => { const x = lee2(c, lq, lq); return x && {p: x[0], q: x[1]}; },
      crea: ({p, q}) => { const mayor = v(q) > v(p);
        return {t: L('La verde es la prueba: <b>' + t(p) + '</b>. El sospechoso dice que estuvo en <b>' + t(q) + '</b>. Pon su marca y dime: ¿pasó de largo o se quedó antes?', 'La verda és la prova: <b>' + t(p) + '</b>. El sospitós diu que va estar en <b>' + t(q) + '</b>. Posa la seua marca i digues-me: va passar de llarg o es va quedar abans?'),
          tp: L('La prueba dice <b>' + t(p) + '</b>. El sospechoso dice que estuvo en <b>' + t(q) + '</b>. ¿Pasó de largo o se quedó antes?', 'La prova diu <b>' + t(p) + '</b>. El sospitós diu que va estar en <b>' + t(q) + '</b>. Va passar de llarg o es va quedar abans?'),
          pasos: pasosPara(Math.max(v(p), v(q))), desde: 0, prueba: {v: v(p), nombre: t(p)}, meta: v(q),
          ops: baraja([
            {t: L('Pasó de largo: su marca queda a la derecha.', 'Va passar de llarg: la seua marca queda a la dreta.'), ok: mayor, r: mayor ? L('Eso es: más a la derecha, mayor.', 'Això és: més a la dreta, major.') : L('Mira la cinta: su marca queda a la IZQUIERDA de la prueba.', 'Mira la cinta: la seua marca queda a l\'ESQUERRA de la prova.')},
            {t: L('Se quedó antes: su marca queda a la izquierda.', 'Es va quedar abans: la seua marca queda a l\'esquerra.'), ok: !mayor, r: !mayor ? L('Eso es: más a la izquierda, menor.', 'Això és: més a l\'esquerra, menor.') : L('Mira la cinta: su marca queda a la DERECHA de la prueba.', 'Mira la cinta: la seua marca queda a la DRETA de la prova.')},
            {t: L('Pasó de largo, porque su número de arriba es más grande.', 'Va passar de llarg, perquè el seu número de dalt és més gran.'), ok: false, r: L('Con el número de arriba solo no se compara: hay que mirar en cuántos trozos está cortado el paso.', 'Amb el número de dalt només no es compara: cal mirar en quants trossos està tallat el pas.')}]),
          pista: L('La verde no se toca. Lleva la roja con la cinta, y luego elige.', 'La verda no es toca. Porta la roja amb la cinta, i després tria.'),
          bien: t(q) + L(mayor ? ' es mayor que ' : ' es menor que ', mayor ? ' és major que ' : ' és menor que ') + t(p) + ': ' + L(mayor ? 'más a la derecha.' : 'más a la izquierda.', mayor ? 'més a la dreta.' : 'més a l\'esquerra.'),
          mal: L('La marca roja tiene que ir en <b>' + t(q) + '</b>: corta el paso en ' + q.d + '.', 'La marca roja ha d\'anar en <b>' + t(q) + '</b>: talla el pas en ' + q.d + '.')}; }},
    /* repartir: n metros en k tramos */
    repartir: {pes: 'partir', nombre: 'Repartir',
      azar: () => { const k = elige([2, 3, 4, 5, 6, 8]); return {n: ent(1, 3 * k - 1), k}; },
      vale: ({n, k}) => n > 0 && CORTES.includes(k) && n % k !== 0 && n / k < 5,
      cod: ({n, k}) => n + '_' + k,
      lee: c => { const x = lee2(c, leInt, leInt); return x && {n: x[0], k: x[1]}; },
      crea: ({n, k}) => ({t: L('Hay <b>' + n + ' metros</b> de barandilla para <b>' + k + ' tramos</b> iguales. Ponme la marca donde acaba el primer tramo.', 'Hi ha <b>' + n + ' metres</b> de barana per a <b>' + k + ' trams</b> iguals. Posa\'m la marca on acaba el primer tram.'),
        tp: L('Hay <b>' + n + ' metros</b> de barandilla para <b>' + k + ' tramos</b> iguales. ¿Cuánto mide cada tramo?', 'Hi ha <b>' + n + ' metres</b> de barana per a <b>' + k + ' trams</b> iguals. Quant mesura cada tram?'),
        pasos: Math.max(2, Math.ceil(n / k) + 1), desde: 0, prueba: null, meta: n / k, res: Q(n, k),
        pista: L('La cinta mide metros. Toca la cinta para llevar la marca roja.', 'La cinta mesura metres. Toca la cinta per a portar la marca roja.'),
        bien: L('Cada tramo mide ' + n + ' : ' + k + ' = <b>' + fr(n, k) + '</b> de metro. La fracción es una división.', 'Cada tram mesura ' + n + ' : ' + k + ' = <b>' + fr(n, k) + '</b> de metre. La fracció és una divisió.'),
        mal: L('Un tramo es lo que toca a cada uno al repartir ' + n + ' entre ' + k + ': corta cada metro en <b>' + k + '</b> y cuenta <b>' + n + '</b> trozos.', 'Un tram és el que toca a cadascun en repartir ' + n + ' entre ' + k + ': talla cada metre en <b>' + k + '</b> i compta <b>' + n + '</b> trossos.')})},
    /* exacto o periódico */
    decimal: {pes: 'partir', nombre: '¿Exacto o periódico?',
      azar: () => { const d = elige([3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 20, 25]), n = ent(1, d - 1); return mcdN(n, d) === 1 ? {q: Q(n, d)} : null; },
      vale: ({q}) => q.n > 0 && q.d > 1 && q.d < 100,
      cod: ({q}) => cq(q),
      lee: c => { const q = lq(c); return q && {q}; },
      crea: ({q}) => { const d = q.d; let m = d; while(m % 2 === 0) m /= 2; while(m % 5 === 0) m /= 5;
        const exacto = m === 1;
        return {t: L('Una coartada dice <b>' + t(q) + '</b> de hora. Al pasarla a decimal, ¿la cuenta se acaba o se repite para siempre?', 'Una coartada diu <b>' + t(q) + '</b> d\'hora. En passar-la a decimal, el compte s\'acaba o es repetix per sempre?'),
          sinCinta: true,
          ops: [{t: L('Se acaba: es un decimal exacto.', 'S\'acaba: és un decimal exacte.'), ok: exacto, r: exacto ? L('Eso es.', 'Això és.') : L('No se acaba: el ' + d + ' tiene factores que no son 2 ni 5, y los restos acaban repitiéndose.', 'No s\'acaba: el ' + d + ' té factors que no són 2 ni 5, i els restos acaben repetint-se.')},
                {t: L('Se repite: es un decimal periódico.', 'Es repetix: és un decimal periòdic.'), ok: !exacto, r: !exacto ? L('Eso es.', 'Això és.') : L('Se acaba: el ' + d + ' solo tiene doses y cincos, y algún resto llega a cero.', 'S\'acaba: el ' + d + ' només té dosos i cincs, i algun resto arriba a zero.')}],
          pista: L('Piensa en la pizarra de la comisaría: ¿algún resto llegará a cero?', 'Pensa en la pissarra de la comissaria: algun resto arribarà a zero?'),
          bien: exacto ? L('Exacto: el ' + d + ' solo tiene doses y cincos, y la cuenta llega a resto cero.', 'Exacte: el ' + d + ' només té dosos i cincs, i el compte arriba a resto zero.') : L('Periódico: el ' + d + ' tiene otros factores, y los restos vuelven a salir.', 'Periòdic: el ' + d + ' té altres factors, i els restos tornen a eixir.')}; }},
    /* sumar: el nivel sube */
    sumar: {pes: 'juntar', nombre: 'Sumar',
      azar: () => { const d = elige([4, 6, 8, 10, 12]), b = elige([2, 3, 4, 5, 6].filter(x => d % x === 0 && x < d));
        return {a: Q(ent(1, b - 1), b), c: Q(ent(1, d - 1), d)}; },
      vale: ({a, c}) => a.n > 0 && c.n > 0 && v(a) + v(c) < 4 && CORTES.includes(mcmN(a.d, c.d)),
      cod: ({a, c}) => cq(a) + '_' + cq(c),
      lee: c => { const x = lee2(c, lq, lq); return x && {a: x[0], c: x[1]}; },
      crea: ({a, c}) => { const m = mcmN(a.d, c.d), na = a.n * m / a.d, nc = c.n * m / c.d, meta = v(a) + v(c);
        return {t: L('El nivel estaba en <b>' + t(a) + '</b> del dique y anoche subió <b>' + t(c) + '</b>. Ponme el nivel de esta mañana.', 'El nivell estava en <b>' + t(a) + '</b> del dic i anit va pujar <b>' + t(c) + '</b>. Posa\'m el nivell d\'este matí.'),
          tp: L('El nivel estaba en <b>' + t(a) + '</b> del dique y anoche subió <b>' + t(c) + '</b>. ¿En cuánto está esta mañana?', 'El nivell estava en <b>' + t(a) + '</b> del dic i anit va pujar <b>' + t(c) + '</b>. En quant està este matí?'),
          pasos: pasosPara(meta), desde: 0, prueba: {v: v(a), nombre: t(a)}, meta, res: sumaQ(a, c),
          pista: L('La verde es el nivel de ayer. Toca la cinta para llevar el de hoy.', 'La verda és el nivell d\'ahir. Toca la cinta per a portar el d\'hui.'),
          bien: t(a) + ' + ' + t(c) + ' = ' + na + '/' + m + ' + ' + nc + '/' + m + ' = <b>' + fr(na + nc, m) + '</b>. ' + L('Primero, los trozos del mismo tamaño.', 'Primer, els trossos de la mateixa grandària.'),
          mal: L('Corta el dique en <b>' + m + '</b>: ' + t(a) + ' son ' + na + ' trozos, y suben ' + nc + ' más.', 'Talla el dic en <b>' + m + '</b>: ' + t(a) + ' són ' + na + ' trossos, i en pugen ' + nc + ' més.')}; }},
    /* restar, también por debajo del cero */
    restar: {pes: 'juntar', nombre: 'Restar',
      azar: () => { const d = elige([2, 3, 4, 6, 8]); return {a: Q(ent(-d, d), d), c: Q(ent(1, 2 * d - 1), d)}; },
      vale: ({a, c}) => a.n !== 0 && c.n > 0 && Math.abs(v(a)) <= 2 && v(a) - v(c) > -2 && CORTES.includes(Math.max(2, mcmN(a.d, c.d))),
      cod: ({a, c}) => cq(a) + '_' + cq(c),
      lee: c => { const x = lee2(c, lq, lq); return x && {a: x[0], c: x[1]}; },
      crea: ({a, c}) => { const m = Math.max(2, mcmN(a.d, c.d)), nc = c.n * m / c.d, meta = v(a) - v(c);
        return {t: L('El sospechoso tiene <b>' + t(a) + '</b> de fajo en la banca y paga <b>' + t(c) + '</b>. ¿Cómo queda su saldo?', 'El sospitós té <b>' + t(a) + '</b> de feix en la banca i paga <b>' + t(c) + '</b>. Com queda el seu saldo?'),
          pasos: 4, desde: -2, prueba: {v: v(a), nombre: t(a)}, meta, res: OPS['-'](a, c),
          pista: L('A la derecha del cero, lo que tiene; a la izquierda, lo que debe. La verde es lo que tenía.', 'A la dreta del zero, el que té; a l\'esquerra, el que deu. La verda és el que tenia.'),
          bien: t(a) + ' − ' + t(c) + ' = <b>' + fr(a.n * m / a.d - nc, m) + '</b>' + (meta < 0 ? L(': ahora debe.', ': ara deu.') : '.'),
          mal: L('Desde la verde, cuenta <b>' + nc + '</b> trozos de ' + fr(1, m) + ' hacia la izquierda.', 'Des de la verda, compta <b>' + nc + '</b> trossos de ' + fr(1, m) + ' cap a l\'esquerra.')}; }},
    /* la fracción de una cantidad */
    cantidad: {pes: 'partes', nombre: 'Fracción de una cantidad',
      azar: () => { const d = elige([2, 3, 4, 5, 6, 8]), n = ent(1, d - 1); return mcdN(n, d) === 1 ? {N: elige([1, 2, 3, 5]) * 1000 * d, q: Q(n, d)} : null; },
      vale: ({N, q}) => N > 0 && q.n > 0 && q.n < q.d && N % q.d === 0,
      cod: ({N, q}) => N + '_' + cq(q),
      lee: c => { const x = lee2(c, leInt, lq); return x && {N: x[0], q: x[1]}; },
      crea: ({N, q}) => { const n = q.n, d = q.d, parte = N / d, ok = n * parte;
        const malos = [N / n, parte, N - ok, N + ok, parte * (n + 1)].filter(x => x !== ok && x > 0 && Number.isInteger(x));
        const ops = baraja([{t: $$(ok) + ' $', ok: true, r: L('Eso es.', 'Això és.')}].concat(
          [...new Set(malos)].slice(0, 3).map(x => ({t: $$(x) + ' $', ok: false,
            r: L('No: primero se parte la saca en ' + d + ' partes iguales (' + $$(parte) + ' $ cada una) y luego se cogen ' + n + '.', 'No: primer es partix la saca en ' + d + ' parts iguals (' + $$(parte) + ' $ cadascuna) i després se n\'agafen ' + n + '.')}))));
        return {t: L('En la saca hay <b>' + $$(N) + ' dólares</b>, y a Spats le tocan <b>' + t(q) + '</b>. ¿Cuánto se lleva?', 'En la saca hi ha <b>' + $$(N) + ' dòlars</b>, i a Spats li toquen <b>' + t(q) + '</b>. Quant se\'n porta?'),
          sinCinta: true, ops,
          pista: L('Parte la saca en partes iguales, y coge las que le tocan.', 'Partix la saca en parts iguals, i agafa les que li toquen.'),
          bien: $$(N) + ' : ' + d + ' = ' + $$(parte) + L(', y por ', ', i per ') + n + ': <b>' + $$(ok) + ' $</b>.'}; }},
    /* la parte de una parte: c de a */
    partes: {pes: 'partes', nombre: 'Parte de una parte',
      azar: () => { const b = elige([2, 3, 4]), dd = elige([2, 3]); return {a: Q(ent(1, b - 1), b), c: Q(ent(1, dd - 1), dd)}; },
      vale: ({a, c}) => a.n > 0 && c.n > 0 && a.n < a.d && c.n < c.d && CORTES.includes(a.d * c.d),
      cod: ({a, c}) => cq(a) + '_' + cq(c),
      lee: c => { const x = lee2(c, lq, lq); return x && {a: x[0], c: x[1]}; },
      crea: ({a, c}) => { const D = a.d * c.d, N = a.n * c.n;
        return {t: L('De cada bote, la banca deja <b>' + t(a) + '</b> sobre la mesa, y el dueño se lleva <b>' + t(c) + '</b> de eso. Ponme la marca de lo que se lleva el dueño.', 'De cada pot, la banca deixa <b>' + t(a) + '</b> sobre la taula, i l\'amo se\'n porta <b>' + t(c) + '</b> d\'això. Posa\'m la marca del que se\'n porta l\'amo.'),
          tp: L('De cada bote, la banca deja <b>' + t(a) + '</b> sobre la mesa, y el dueño se lleva <b>' + t(c) + '</b> de eso. ¿Qué parte del bote se lleva el dueño?', 'De cada pot, la banca deixa <b>' + t(a) + '</b> sobre la taula, i l\'amo se\'n porta <b>' + t(c) + '</b> d\'això. Quina part del pot se\'n porta l\'amo?'),
          pasos: 1, desde: 0, prueba: {v: v(a), nombre: t(a)}, meta: N / D, res: Q(N, D),
          pista: L('La cinta es el bote entero. La verde, lo que queda en la mesa.', 'La cinta és el pot sencer. La verda, el que queda en la taula.'),
          bien: t(c) + ' de ' + t(a) + ' = <b>' + fr(N, D) + '</b> ' + L('del bote: se corta en ' + D + ' y se cuentan ' + N + '.', 'del pot: es talla en ' + D + ' i se\'n compten ' + N + '.'),
          mal: L('Corta el bote en <b>' + D + '</b>: así cada trozo de la mesa se parte en ' + c.d + '.', 'Talla el pot en <b>' + D + '</b>: així cada tros de la taula es partix en ' + c.d + '.')}; }},
    /* dividir: cuántas piezas p salen de la tela tt. La verde es la tela;
       la roja, la pieza, y la cinta la copia una detrás de otra (tejas). */
    dividir: {pes: 'partes', nombre: 'Dividir',
      azar: () => { const p = Q(ent(1, 2), elige([2, 3, 4, 6, 8])), dt = elige([1, 2, 3, 4, 8]);
        const tt = Q(ent(1, 2 * dt), dt), r = Q(tt.n * p.d, tt.d * p.n);
        return r.d <= 4 && r.n <= 16 ? {tt, p} : null; },
      vale: ({tt, p}) => tt.n > 0 && p.n > 0 && !entera(p) && v(tt) <= 3 && v(p) < 3 && v(tt) !== v(p) && llega(p) && v(tt) / v(p) <= 24,
      cod: ({tt, p}) => cq(tt) + '_' + cq(p),
      lee: c => { const x = lee2(c, lq, lq); return x && {tt: x[0], p: x[1]}; },
      crea: ({tt, p}) => { const r = Q(tt.n * p.d, tt.d * p.n), vuelta = Q(p.d, p.n), k = Math.floor(v(r));
        const met = q => entera(q) ? q.n + L(q.n === 1 ? ' metro' : ' metros', q.n === 1 ? ' metre' : ' metres') : t(q) + L(' de metro', ' de metre');
        const malos = [
          {q: Q(tt.n * p.n, tt.d * p.d), r: L(t(tt) + ' · ' + t(p) + ': eso es coger ' + t(p) + ' de la tela, multiplicar. Dividir es contar cuántas piezas caben.', t(tt) + ' · ' + t(p) + ': això és agafar ' + t(p) + ' de la tela, multiplicar. Dividir és comptar quantes peces hi caben.')},
          {q: Q(tt.d * p.n, tt.n * p.d), r: L('Eso es al revés: cuánta tela cabría en una pieza. La que se cuenta es la pieza.', 'Això és al revés: quanta tela cabria en una peça. La que es compta és la peça.')}];
        if(!entera(r) && k > 0) malos.push({q: Q(k, 1), r: L('Esas son las piezas enteras. Lo que sobra también cuenta, medido con la pieza: es ' + fr(r.n - k * r.d, r.d) + ' de pieza.', 'Eixes són les peces senceres. El que sobra també compta, mesurat amb la peça: és ' + fr(r.n - k * r.d, r.d) + ' de peça.')});
        const vistos = new Set([t(r)]), ops = [{t: t(r), ok: true, r: L('Eso es.', 'Això és.')}];
        malos.forEach(m => { if(!vistos.has(t(m.q))){ vistos.add(t(m.q)); ops.push({t: t(m.q), ok: false, r: m.r}); } });
        return {t: L('Al sastre le quedan <b>' + met(tt) + '</b> de tela, y cada pieza lleva <b>' + met(p) + '</b>. Pon la pieza en la cinta y dime: ¿cuántas piezas salen?', 'Al sastre li queden <b>' + met(tt) + '</b> de tela, i cada peça porta <b>' + met(p) + '</b>. Posa la peça en la cinta i digues-me: quantes peces n\'ixen?'),
          tp: L('Al sastre le quedan <b>' + met(tt) + '</b> de tela, y cada pieza lleva <b>' + met(p) + '</b>. ¿Cuántas piezas salen?', 'Al sastre li queden <b>' + met(tt) + '</b> de tela, i cada peça porta <b>' + met(p) + '</b>. Quantes peces n\'ixen?'),
          pasos: Math.max(1, Math.ceil(v(tt)), Math.floor(v(p)) + 1), desde: 0, prueba: {v: v(tt), nombre: t(tt)}, meta: v(p), tejas: true,
          ops: baraja(ops),
          pista: L('La verde es la tela, y no se toca. Lleva la roja a lo que mide la pieza: la cinta la copia una detrás de otra.', 'La verda és la tela, i no es toca. Porta la roja al que mesura la peça: la cinta la copia una darrere de l\'altra.'),
          bien: t(tt) + ' : ' + t(p) + ' = ' + t(tt) + ' · ' + t(vuelta) + ' = <b>' + t(r) + '</b>. ' + L('Dividir entre ' + t(p) + ' es multiplicar por ' + t(vuelta) + '.', 'Dividir entre ' + t(p) + ' és multiplicar per ' + t(vuelta) + '.'),
          mal: L('La pieza mide <b>' + t(p) + '</b> de metro: corta el metro en <b>' + p.d + '</b> y lleva la roja a ' + p.n + (p.n === 1 ? ' trozo' : ' trozos') + ' del cero.', 'La peça mesura <b>' + t(p) + '</b> de metre: talla el metre en <b>' + p.d + '</b> i porta la roja a ' + p.n + (p.n === 1 ? ' tros' : ' trossos') + ' del zero.')}; }}
,
    /* operaciones combinadas: el orden (paréntesis; · y :; + y −). Siempre
       sobre el papel: la cuenta viene dada y se escribe el resultado. La
       trampa, hacerlas en el orden en que se leen (o saltarse el paréntesis). */
    combinadas: {pes: 'partes', nombre: 'Operaciones combinadas',
      azar: () => { const f = () => Q(ent(1, 5), elige([2, 3, 4, 5, 6])), a = f(), b = f(), c = elige([f(), Q(ent(2, 3), 1)]);
        const s = cq(a), u = cq(b), w = cq(c);
        return {e: elige(['$a + $b · $c', '($a + $b) · $c', '$a − $b · $c', '$a · ($b − $c)', '$a + $b : $c', '($a − $b) : $c'])
          .replace('$a', s).replace('$b', u).replace('$c', w)}; },
      vale: ({e}) => { const a = arbol(e); if(!a || a.q) return false; const r = valor(a), tr = trampaDe(e);
        return !!r && r.n > 0 && r.d <= 36 && r.n <= 72 && (!tr || !igual(tr, r)) && /[()]|[·:].*[+−-]|[+−-].*[·:]/.test(e); },
      cod: ({e}) => e.replace(/ /g, '').replace(/\+/g, 's').replace(/[−-]/g, 'r').replace(/·/g, 'm').replace(/:/g, 'd'),
      lee: c => { const e = String(c || '').replace(/ /g, 's').replace(/s/g, ' + ').replace(/r/g, ' − ').replace(/m/g, ' · ').replace(/d/g, ' : ')
          .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim(); return arbol(e) ? {e} : null; },
      crea: ({e}) => { const r = cuenta(e), tr = trampaDe(e), l = pasos(e);
        return {t: L('Liz ha encontrado esta cuenta en la libreta del contable, sin resolver: <b>' + e + '</b>. Hazla tú, sin cinta, y apúntame el resultado.', 'Liz ha trobat este compte en la llibreta del comptable, sense resoldre: <b>' + e + '</b>. Fes-lo tu, sense cinta, i apunta\'m el resultat.'),
          sinCinta: true, res: r,
          papel: {res: r, cuenta: false, trampas: tr ? [{q: tr, r: /[()]/.test(e)
            ? L('Eso sale saltándose el paréntesis. Lo de dentro va primero; luego · y :; al final, + y −.', 'Això ix botant-se el parèntesi. El de dins va primer; després · i :; al final, + i −.')
            : L('Eso sale haciendo las cuentas en el orden en que se leen. Primero · y :; al final, + y −.', 'Això ix fent els comptes en l\'orde en què es lligen. Primer · i :; al final, + i −.')}] : []},
          pista: L('Primero los paréntesis; luego · y :; al final, + y −, de izquierda a derecha.', 'Primer els parèntesis; després · i :; al final, + i −, d\'esquerra a dreta.'),
          bien: l.join(' = ').replace(/ = ([^=]*)$/, ' = <b>$1</b>') + '. ' + L('Primero lo que va primero.', 'Primer el que va primer.'),
          mal: L('Repásala paso a paso: primero los paréntesis; luego · y :; al final, + y −.', 'Repassa\'l pas a pas: primer els parèntesis; després · i :; al final, + i −.')}; }}
  };
  /* la trampa de una combinada: si tiene paréntesis, sin ellos; si no, en el orden de lectura */
  function trampaDe(e){
    if(/[()]/.test(e)) return cuenta(e.replace(/[()]/g, ''));
    const f = fichas(e); if(!f) return null;
    let x = f[0].q;
    for(let i = 1; i + 1 < f.length; i += 2){ x = OPS[f[i].o](x, f[i + 1].q); if(!x) return null; }
    return x;
  }
  const PESTANAS = {};
  for(const k in TIPOS) (PESTANAS[TIPOS[k].pes] = PESTANAS[TIPOS[k].pes] || []).push(k);

  /* monta el encargo de un tipo con unos datos (ya validados) */
  function monta(tipo, d){
    const e = TIPOS[tipo].crea(d);
    e.tipo = tipo; e.c = TIPOS[tipo].cod(d); e.cortes = CORTES;
    return e;
  }
  /* unos datos al azar que valgan */
  function alAzar(tipo){
    const T = TIPOS[tipo];
    for(let i = 0; i < 200; i++){ const d = T.azar(); if(d && T.vale(d)) return d; }
    throw new Error('sin datos para ' + tipo);
  }
  function deTipo(tipo, d){ return monta(tipo, d && TIPOS[tipo].vale(d) ? d : alAzar(tipo)); }
  /* Sin cinta: el encargo se contesta eligiendo (si tiene respuestas) o
     escribiendo la cuenta y el resultado. Situar no tiene sentido sin cinta. */
  const sinCintaVale = tipo => tipo !== 'situar';
  function aPapel(e){
    if(e.papel || e.sinCinta) return e;
    e.sinCinta = true; e.meta = null; if(e.tp) e.t = e.tp;
    if(!e.ops) e.papel = {res: e.res, cuenta: true, trampas: []};
    e.pista = L('Sin cinta: en la libreta, y aquí la cuenta y el resultado.', 'Sense cinta: en la llibreta, i ací el compte i el resultat.');
    return e;
  }
  /* un encargo de la pestaña (de uno de sus tipos, o del que se pida) */
  function genera(pes, tipo, papel){
    if(papel && !sinCintaVale(tipo)) tipo = null;
    const e = TIPOS[tipo] ? deTipo(tipo) : deTipo(elige((PESTANAS[pes] || PESTANAS.cinta).filter(k => !papel || sinCintaVale(k))));
    return papel ? aPapel(e) : e;
  }
  /* lo que pide un enlace: el tipo m con los datos c; si no se leen o no
     valen, uno al azar de ese tipo. null si el tipo no existe. */
  function deEnlace(m, c){
    if(!TIPOS[m]) return null;
    let d = null; try{ d = c ? TIPOS[m].lee(c) : null; }catch(err){ d = null; }
    return deTipo(m, d);
  }
  return {TIPOS, PESTANAS, genera, deTipo, deEnlace, aPapel, sinCintaVale, cuenta, pasos, revisa, fr, conAzar: f => { azar = f; }};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = PR;
