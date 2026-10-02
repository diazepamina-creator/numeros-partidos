/* ══════════════════════════════════════════════════════════════════════
   LOS ENCARGOS DE PRACTICAR · los generadores, sin pantalla
   Cada pestaña tiene dos tipos de encargo. Cada encargo dice cómo es la
   cinta (pasos, desde dónde, cortes), si lleva la prueba verde de Liz,
   adónde tiene que ir la marca roja (meta) y, si hace falta, qué respuesta
   se elige. Vale en el navegador y en Node (pruebas/encargos.test.mjs).
   ══════════════════════════════════════════════════════════════════════ */
const PR = (() => {
  let azar = Math.random;
  const ent = (a, b) => a + Math.floor(azar() * (b - a + 1));
  const elige = l => l[Math.floor(azar() * l.length)];
  const mcdN = (a, b) => { a = Math.abs(a); b = Math.abs(b); while(b){ [a, b] = [b, a % b]; } return a || 1; };
  /* una fracción, escrita: 5/4, −1/2, 3 */
  const fr = (n, d) => { const g = mcdN(n, d); n /= g; d /= g;
    return (n < 0 ? '−' : '') + (d === 1 ? Math.abs(n) : Math.abs(n) + '/' + d); };
  const baraja = l => { const c = l.slice(); for(let i = c.length - 1; i > 0; i--){ const j = Math.floor(azar() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };
  const CORTES = [2, 3, 4, 5, 6, 8, 9, 10, 12];
  /* los encargos se escriben con números dentro: el diccionario no los
     encuentra, así que cada frase va en las dos lenguas */
  const L = (es, va) => (typeof idioma !== 'undefined' && idioma === 'va') ? va : es;
  const $$ = x => x.toLocaleString('es-ES');

  /* Cada generador devuelve un encargo:
     {t, pasos, desde, cortes:[…], prueba:{v, nombre}|null, meta:v|null,
      ops:[{t, ok, r}]|null, pista, bien, mal} */
  const GEN = {
    cinta: [
      /* situar: la marca en a/b */
      () => { const d = elige([2, 3, 4, 5, 6, 8]), n = ent(1, 2 * d - 1);
        if(n % d === 0) return null;
        return {t: L('Liz ha encontrado una colilla a <b>' + fr(n, d) + '</b> de paso de la esquina. Corta el paso como haga falta y ponme ahí la marca.', 'Liz ha trobat una burilla a <b>' + fr(n, d) + '</b> de pas de la cantonada. Talla el pas com calga i posa-hi la marca.'),
          pasos: 2, desde: 0, prueba: null, meta: n / d,
          pista: L('Toca la cinta para llevar la marca roja.', 'Toca la cinta per a portar la marca roja.'),
          bien: L('Ahí está: ' + fr(n, d) + '. El paso, cortado en ' + d + ', y ' + n + ' trozos desde la esquina.', 'Ací està: ' + fr(n, d) + '. El pas, tallat en ' + d + ', i ' + n + ' trossos des de la cantonada.'),
          mal: L('Todavía no. Corta el paso en <b>' + d + '</b> trozos iguales y cuenta <b>' + n + '</b> desde la esquina.', 'Encara no. Talla el pas en <b>' + d + '</b> trossos iguals i compta-ne <b>' + n + '</b> des de la cantonada.')}; },
      /* comparar: la prueba en p, la marca en q, y el signo */
      () => { const d1 = elige([2, 3, 4, 5, 6, 8]), d2 = elige([2, 3, 4, 5, 6, 8].filter(x => x !== d1));
        const n1 = ent(1, 2 * d1 - 1), n2 = ent(1, 2 * d2 - 1), p = n1 / d1, q = n2 / d2;
        if(Math.abs(p - q) < 1e-9 || n1 % d1 === 0 || n2 % d2 === 0) return null;
        const mayor = q > p;
        return {t: L('La verde es la prueba: <b>' + fr(n1, d1) + '</b>. El sospechoso dice que estuvo en <b>' + fr(n2, d2) + '</b>. Pon su marca y dime: ¿pasó de largo o se quedó antes?', 'La verda és la prova: <b>' + fr(n1, d1) + '</b>. El sospitós diu que va estar en <b>' + fr(n2, d2) + '</b>. Posa la seua marca i digues-me: va passar de llarg o es va quedar abans?'),
          pasos: 2, desde: 0, prueba: {v: p, nombre: fr(n1, d1)}, meta: q,
          ops: baraja([
            {t: L('Pasó de largo: su marca queda a la derecha.', 'Va passar de llarg: la seua marca queda a la dreta.'), ok: mayor, r: mayor ? L('Eso es: más a la derecha, mayor.', 'Això és: més a la dreta, major.') : L('Mira la cinta: su marca queda a la IZQUIERDA de la prueba.', 'Mira la cinta: la seua marca queda a l\'ESQUERRA de la prova.')},
            {t: L('Se quedó antes: su marca queda a la izquierda.', 'Es va quedar abans: la seua marca queda a l\'esquerra.'), ok: !mayor, r: !mayor ? L('Eso es: más a la izquierda, menor.', 'Això és: més a l\'esquerra, menor.') : L('Mira la cinta: su marca queda a la DERECHA de la prueba.', 'Mira la cinta: la seua marca queda a la DRETA de la prova.')},
            {t: L('Pasó de largo, porque su número de arriba es más grande.', 'Va passar de llarg, perquè el seu número de dalt és més gran.'), ok: false, r: L('Con el número de arriba solo no se compara: hay que mirar en cuántos trozos está cortado el paso.', 'Amb el número de dalt només no es compara: cal mirar en quants trossos està tallat el pas.')}]),
          pista: L('La verde no se toca. Lleva la roja con la cinta, y luego elige.', 'La verda no es toca. Porta la roja amb la cinta, i després tria.'),
          bien: fr(n2, d2) + L(mayor ? ' es mayor que ' : ' es menor que ', mayor ? ' és major que ' : ' és menor que ') + fr(n1, d1) + ': ' + L(mayor ? 'más a la derecha.' : 'más a la izquierda.', mayor ? 'més a la dreta.' : 'més a l\'esquerra.'),
          mal: L('La marca roja tiene que ir en <b>' + fr(n2, d2) + '</b>: corta el paso en ' + d2 + '.', 'La marca roja ha d\'anar en <b>' + fr(n2, d2) + '</b>: talla el pas en ' + d2 + '.')}; }
    ],
    partir: [
      /* repartir: n metros en k tramos */
      () => { const k = elige([2, 3, 4, 5, 6, 8]), n = ent(1, 3 * k - 1);
        if(n % k === 0) return null;
        const pasos = Math.max(2, Math.ceil(n / k) + 1);
        return {t: L('Hay <b>' + n + ' metros</b> de barandilla para <b>' + k + ' tramos</b> iguales. Ponme la marca donde acaba el primer tramo.', 'Hi ha <b>' + n + ' metres</b> de barana per a <b>' + k + ' trams</b> iguals. Posa\'m la marca on acaba el primer tram.'),
          pasos, desde: 0, prueba: null, meta: n / k,
          pista: L('La cinta mide metros. Toca la cinta para llevar la marca roja.', 'La cinta mesura metres. Toca la cinta per a portar la marca roja.'),
          bien: L('Cada tramo mide ' + n + ' : ' + k + ' = <b>' + fr(n, k) + '</b> de metro. La fracción es una división.', 'Cada tram mesura ' + n + ' : ' + k + ' = <b>' + fr(n, k) + '</b> de metre. La fracció és una divisió.'),
          mal: L('Un tramo es lo que toca a cada uno al repartir ' + n + ' entre ' + k + ': corta cada metro en <b>' + k + '</b> y cuenta <b>' + n + '</b> trozos.', 'Un tram és el que toca a cadascun en repartir ' + n + ' entre ' + k + ': talla cada metre en <b>' + k + '</b> i compta <b>' + n + '</b> trossos.')}; },
      /* exacto o periódico */
      () => { const d = elige([3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 20, 25]), n = ent(1, d - 1);
        if(mcdN(n, d) !== 1) return null;
        let m = d; while(m % 2 === 0) m /= 2; while(m % 5 === 0) m /= 5;
        const exacto = m === 1;
        return {t: L('Una coartada dice <b>' + fr(n, d) + '</b> de hora. Al pasarla a decimal, ¿la cuenta se acaba o se repite para siempre?', 'Una coartada diu <b>' + fr(n, d) + '</b> d\'hora. En passar-la a decimal, el compte s\'acaba o es repetix per sempre?'),
          sinCinta: true,
          ops: [{t: L('Se acaba: es un decimal exacto.', 'S\'acaba: és un decimal exacte.'), ok: exacto, r: exacto ? L('Eso es.', 'Això és.') : L('No se acaba: el ' + d + ' tiene factores que no son 2 ni 5, y los restos acaban repitiéndose.', 'No s\'acaba: el ' + d + ' té factors que no són 2 ni 5, i els restos acaben repetint-se.')},
                {t: L('Se repite: es un decimal periódico.', 'Es repetix: és un decimal periòdic.'), ok: !exacto, r: !exacto ? L('Eso es.', 'Això és.') : L('Se acaba: el ' + d + ' solo tiene doses y cincos, y algún resto llega a cero.', 'S\'acaba: el ' + d + ' només té dosos i cincs, i algun resto arriba a zero.')}],
          pista: L('Piensa en la pizarra de la comisaría: ¿algún resto llegará a cero?', 'Pensa en la pissarra de la comissaria: algun resto arribarà a zero?'),
          bien: exacto ? L('Exacto: el ' + d + ' solo tiene doses y cincos, y la cuenta llega a resto cero.', 'Exacte: el ' + d + ' només té dosos i cincs, i el compte arriba a resto zero.') : L('Periódico: el ' + d + ' tiene otros factores, y los restos vuelven a salir.', 'Periòdic: el ' + d + ' té altres factors, i els restos tornen a eixir.')}; }
    ],
    juntar: [
      /* sumar: el nivel sube */
      () => { const d = elige([4, 6, 8, 10, 12]), b = elige([2, 3, 4, 5, 6].filter(x => d % x === 0 && x < d));
        const a = ent(1, b - 1), c = ent(1, d - 1), meta = a / b + c / d;
        if(meta >= 2) return null;
        return {t: L('El nivel estaba en <b>' + fr(a, b) + '</b> del dique y anoche subió <b>' + fr(c, d) + '</b>. Ponme el nivel de esta mañana.', 'El nivell estava en <b>' + fr(a, b) + '</b> del dic i anit va pujar <b>' + fr(c, d) + '</b>. Posa\'m el nivell d\'este matí.'),
          pasos: 2, desde: 0, prueba: {v: a / b, nombre: fr(a, b)}, meta,
          pista: L('La verde es el nivel de ayer. Toca la cinta para llevar el de hoy.', 'La verda és el nivell d\'ahir. Toca la cinta per a portar el d\'hui.'),
          bien: fr(a, b) + ' + ' + fr(c, d) + ' = ' + (a * d / b) + '/' + d + ' + ' + c + '/' + d + ' = <b>' + fr(a * d / b + c, d) + '</b>. ' + L('Primero, los trozos del mismo tamaño.', 'Primer, els trossos de la mateixa grandària.'),
          mal: L('Corta el dique en <b>' + d + '</b>: ' + fr(a, b) + ' son ' + (a * d / b) + ' trozos, y suben ' + c + ' más.', 'Talla el dic en <b>' + d + '</b>: ' + fr(a, b) + ' són ' + (a * d / b) + ' trossos, i en pugen ' + c + ' més.')}; },
      /* restar, también por debajo del cero */
      () => { const d = elige([2, 3, 4, 6, 8]), a = ent(-d, d), c = ent(1, 2 * d - 1), meta = (a - c) / d;
        if(meta <= -2 || a === 0) return null;
        return {t: L('El sospechoso tiene <b>' + fr(a, d) + '</b> de fajo en la banca y paga <b>' + fr(c, d) + '</b>. ¿Cómo queda su saldo?', 'El sospitós té <b>' + fr(a, d) + '</b> de feix en la banca i paga <b>' + fr(c, d) + '</b>. Com queda el seu saldo?'),
          pasos: 4, desde: -2, prueba: {v: a / d, nombre: fr(a, d)}, meta,
          pista: L('A la derecha del cero, lo que tiene; a la izquierda, lo que debe. La verde es lo que tenía.', 'A la dreta del zero, el que té; a l\'esquerra, el que deu. La verda és el que tenia.'),
          bien: fr(a, d) + ' − ' + fr(c, d) + ' = <b>' + fr(a - c, d) + '</b>' + (meta < 0 ? L(': ahora debe.', ': ara deu.') : '.'),
          mal: L('Desde la verde, cuenta <b>' + c + '</b> trozos de ' + fr(1, d) + ' hacia la izquierda.', 'Des de la verda, compta <b>' + c + '</b> trossos de ' + fr(1, d) + ' cap a l\'esquerra.')}; }
    ],
    partes: [
      /* la fracción de una cantidad */
      () => { const d = elige([2, 3, 4, 5, 6, 8]), n = ent(1, d - 1), parte = elige([1, 2, 3, 5]) * 1000, N = parte * d;
        if(mcdN(n, d) !== 1) return null;
        const ok = n * parte, malos = [N / n, parte, N - n * parte, n * d * 1000].filter(x => x !== ok && x > 0 && Number.isInteger(x));
        const ops = baraja([{t: $$(ok) + ' $', ok: true, r: L('Eso es.', 'Això és.')}].concat(
          [...new Set(malos)].slice(0, 3).map(x => ({t: $$(x) + ' $', ok: false,
            r: L('No: primero se parte la saca en ' + d + ' partes iguales (' + $$(parte) + ' $ cada una) y luego se cogen ' + n + '.', 'No: primer es partix la saca en ' + d + ' parts iguals (' + $$(parte) + ' $ cadascuna) i després se n\'agafen ' + n + '.')}))));
        return {t: L('En la saca hay <b>' + $$(N) + ' dólares</b>, y a Spats le tocan <b>' + fr(n, d) + '</b>. ¿Cuánto se lleva?', 'En la saca hi ha <b>' + $$(N) + ' dòlars</b>, i a Spats li toquen <b>' + fr(n, d) + '</b>. Quant se\'n porta?'),
          sinCinta: true, ops,
          pista: L('Parte la saca en partes iguales, y coge las que le tocan.', 'Partix la saca en parts iguals, i agafa les que li toquen.'),
          bien: $$(N) + ' : ' + d + ' = ' + $$(parte) + L(', y por ', ', i per ') + n + ': <b>' + $$(ok) + ' $</b>.'}; },
      /* la parte de una parte */
      () => { const b = elige([2, 3, 4]), dd = elige([2, 3]), a = ent(1, b - 1), c = ent(1, dd - 1);
        if(b * dd > 12) return null;
        return {t: L('De cada bote, la banca deja <b>' + fr(a, b) + '</b> sobre la mesa, y el dueño se lleva <b>' + fr(c, dd) + '</b> de eso. Ponme la marca de lo que se lleva el dueño.', 'De cada pot, la banca deixa <b>' + fr(a, b) + '</b> sobre la taula, i l\'amo se\'n porta <b>' + fr(c, dd) + '</b> d\'això. Posa\'m la marca del que se\'n porta l\'amo.'),
          pasos: 1, desde: 0, prueba: {v: a / b, nombre: fr(a, b)}, meta: a * c / (b * dd),
          pista: L('La cinta es el bote entero. La verde, lo que queda en la mesa.', 'La cinta és el pot sencer. La verda, el que queda en la taula.'),
          bien: fr(c, dd) + L(' de ', ' de ') + fr(a, b) + ' = <b>' + fr(a * c, b * dd) + '</b> ' + L('del bote: se corta en ' + (b * dd) + ' y se cuentan ' + (a * c) + '.', 'del pot: es talla en ' + (b * dd) + ' i se\'n compten ' + (a * c) + '.'),
          mal: L('Corta el bote en <b>' + (b * dd) + '</b>: así cada trozo de la mesa se parte en ' + dd + '.', 'Talla el pot en <b>' + (b * dd) + '</b>: així cada tros de la taula es partix en ' + dd + '.')}; }
    ]
  };
  function genera(pes){
    for(let i = 0; i < 80; i++){ const e = elige(GEN[pes])(); if(e){ e.cortes = CORTES; return e; } }
    return GEN.cinta[0]() || genera(pes);
  }
  return {genera, fr, conAzar: f => { azar = f; }};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = PR;
