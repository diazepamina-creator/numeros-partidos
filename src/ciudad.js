/* ── LA LENGUA. Todo texto que se pinta desde aquí pasa por T(): en
   castellano devuelve lo mismo que recibe; en valenciano busca la frase en el
   diccionario VA (al final del archivo) y, si no está, la deja en castellano
   —que es mejor que un hueco—. El guion se escribe en castellano una sola
   vez y el diccionario lo acompaña frase a frase. ── */
let idioma = 'es';
const VA = {};
function T(s){ return idioma === 'va' && VA[s] !== undefined ? VA[s] : s; }
/* Los textos que están escritos en el HTML (sumarios, pistas, rótulos,
   botones) se traducen de otra manera: cada elemento marcado guarda su
   castellano en data-es y se busca su HTML entero —con espacios
   normalizados— en el mismo diccionario. Los elementos se marcan al
   arrancar por selector, y a mano (data-t) los rótulos del plano. */
const ESTATICOS = 'h1, .sub, .sumario, .pista, .lectura span, .etq, .chincheta .rot, .acta .cabecera, '
  + '.acta .firmas, .b.volver, #verActa, #imprimeActa, .b[data-fr], #d3paso, #d3todo, #d3otra, '
  + '.carpeta .b, [data-t]';
const norma = h => h.replace(/\s+/g, ' ').trim();
function traduce(){
  document.querySelectorAll(ESTATICOS).forEach(el => {
    if(el.dataset.es === undefined) el.dataset.es = el.innerHTML;
    const k = norma(el.dataset.es);
    el.innerHTML = (idioma === 'va' && VA[k] !== undefined) ? VA[k] : el.dataset.es;
  });
  document.documentElement.lang = idioma === 'va' ? 'ca-ES-valencia' : 'es';
}

const CASOS = {
 1:{t:'La escena del crimen', s:'Caso 1 · la cinta',
    x:'Alguien midió la calle antes que nosotros. Liz tiende la cinta: cada paso se puede cortar en partes iguales, y ahí es donde está la marca.'},
 2:{t:'El taller de Nick', s:'Caso 2 · comparar',
    x:'Un perno de 3/8 y tres llaves que no se parecen en nada: 5/16, 3/8, 1/2. Solo una entra. Averigua cuál antes de que Jeff pierda la paciencia.'},
 3:{t:'La comisaría', s:'Caso 3 · exacto o periódico',
    x:'Cuatro coartadas medidas en trozos de hora y entregadas en decimal. Un cuarto sale redondo; un séptimo no acaba nunca. Alguien escribió un número que no se puede escribir.'},
 4:{t:'El puente viejo', s:'Caso 4 · la fracción es una división',
    x:'Diez metros de barandilla en tres tramos iguales. No cae exacto, y el contratista facturó como si cayera. Demuéstralo con la cinta.'},
 5:{t:'El pantano', s:'Caso 5 · sumar y restar',
    x:'El nivel sube y baja en fracciones del dique, y el guarda suma como puede. Si pasa de tres cuartos, se moja el barrio bajo.'},
 8:{t:'El desguace', s:'Caso 8 · los negativos',
    x:'El coche del sospechoso ha acabado en el desguace, y con él el libro de la banca: una columna de deudas. Aquí la cinta sigue hacia la izquierda del cero.'},
 7:{t:'El casino de la calle 9', s:'Caso 7 · parte de una parte',
    x:'Una ruleta que paga «tres a dos», un bote que la banca corta antes de que nadie lo vea y un dueño que se lleva la mitad de lo que sobra. Aquí se toma una parte de otra parte.'},
 6:{t:'El reparto del botín', s:'Caso 6 · fracción de cantidad',
    x:'Doce mil dólares en una saca y una nota de reparto: tres cuartos para uno, un sexto para otro y dos hombres esperando en el coche. Las cuentas no le cuadran a nadie.'}
};
/* Ya no hay casos por montar: los siete tienen su vista. Se deja la lista
   porque es la que decide si el botón de la carpeta abre o no, y el día que
   se añada un caso nuevo al plano hará falta otra vez. */
const MONTADOS = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
/* Los casos resueltos se guardan en el propio aparato —sin servidor y sin
   cuentas—, porque ocho expedientes no caben en una sesión y una tablet que
   se bloquea los borraba todos. El acta la sigue llevando el papel; esto es
   solo para poder volver mañana. Caduca a las cuatro horas: en un ordenador
   compartido, el grupo siguiente empieza su propia ciudad. */
const resueltos = new Set();
let abierto = 1;

let EXPS = null;                  // los ocho expedientes, cuando estén montados
const GUARDADO = 'np.turno.v1';
const CADUCA = 4*60*60*1000;

function guardaTurno(){
  try{
    localStorage.setItem(GUARDADO, JSON.stringify({
      v:1, ts:Date.now(), resueltos:[...resueltos], abierto:abierto,
      casos: EXPS ? Object.fromEntries(Object.entries(EXPS).map(([k, c]) => [k, c.guarda()])) : {},
      idioma:idioma, sonido:Ruido.on, modo:document.body.dataset.modo
    }));
  }catch(e){ /* sin almacén disponible: se sigue igual, sin guardar */ }
}
function leeTurno(){
  try{
    const d = JSON.parse(localStorage.getItem(GUARDADO) || 'null');
    if(!d || d.v !== 1 || !Array.isArray(d.resueltos)) return null;
    if(Date.now() - d.ts > CADUCA){ borraTurno(); return null; }
    return d;
  }catch(e){ return null; }
}
function borraTurno(){ try{ localStorage.removeItem(GUARDADO); }catch(e){} }

/* Las caras, clonadas de sus plantillas: cada carpeta pide la suya. */
document.querySelectorAll('.cara-caja[data-cara]').forEach(c =>
  c.appendChild(document.getElementById(c.dataset.cara).content.cloneNode(true)));

/* ¿Se mueve algo? No si se han quitado las animaciones en Ajustes, ni si el aparato pide calma. Lo que
   dependa de una animación para llegar a su estado final tiene que
   preguntarlo aquí, que si no se queda a medias. */
const quieto = () => document.body.dataset.quieto === 'si'
  || matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── EL HILO ROJO. El orden de la historia es el de los números: cada caso
   cerrado tiende un hilo hasta la chincheta del siguiente, que es adonde
   señala la pista con que acaba. Las chinchetas van en porcentajes del
   plano; el hilo, en el viewBox de 900×620, así que se convierte. Un hilo
   tirante queda muerto: cada tramo se comba un poco hacia abajo, que es lo
   que hace un hilo que cuelga entre dos chinchetas. ── */
const ORDEN = [1, 2, 3, 4, 5, 6, 7, 8];
const hilosTendidos = new Set();
function pos(c){
  const st = document.querySelector('.chincheta[data-c="' + c + '"]').style;
  return [parseFloat(st.left) * 9, parseFloat(st.top) * 6.2];
}
function pintaHilo(){
  const svg = document.getElementById('hilo');
  ORDEN.forEach((c, k) => {
    const sig = ORDEN[k + 1];
    if(!sig || !resueltos.has(c) || hilosTendidos.has(c)) return;
    hilosTendidos.add(c);
    const [x1, y1] = pos(c), [x2, y2] = pos(sig);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + Math.hypot(x2 - x1, y2 - y1) * .12;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' Q' + mx + ' ' + my + ' ' + x2 + ' ' + y2);
    svg.appendChild(p);
    p.style.setProperty('--l', p.getTotalLength());
    const o = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    o.setAttribute('cx', x2); o.setAttribute('cy', y2); o.setAttribute('r', 4);
    svg.appendChild(o);
    requestAnimationFrame(() => { p.classList.add('tendido'); o.classList.add('tendido'); });
  });
}
function pintaMapa(){
  document.querySelectorAll('.chincheta').forEach(b => {
    b.classList.toggle('resuelto', resueltos.has(+b.dataset.c));
    const n = b.querySelector('.num');
    if(resueltos.has(+b.dataset.c) && !n.querySelector('span'))
      n.innerHTML = '<span>' + b.dataset.c + '</span>';
  });
  document.getElementById('cuenta').textContent =
    resueltos.size === 8 ? T('ciudad cerrada')
    : resueltos.size ? resueltos.size + T(' de 8 cerrados') : T('ocho casos abiertos');
  pintaHilo();
  /* los siete cerrados: el sello gordo cae sobre el plano, una sola vez */
  const mapa = document.getElementById('mapa');
  if(resueltos.size === 8 && !mapa.querySelector('.sellazo')){
    const z = document.createElement('div');
    z.className = 'sellazo golpea'; z.textContent = T('CIUDAD CERRADA');
    mapa.appendChild(z);
    if(!quieto()) setTimeout(Ruido.sello, 500);
  }
}

/* ── EL PLANO SE LADEA. Sigue al puntero con dos variables CSS; al salir,
   vuelve a plano. En el móvil no hay puntero que seguir y el plano se queda
   quieto, que es lo que toca en una pantalla que se toca. ── */
{
  const mapa = document.getElementById('mapa');
  mapa.addEventListener('pointermove', ev => {
    if(quieto() || ev.pointerType !== 'mouse') return;
    const r = mapa.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
    mapa.style.setProperty('--ty', (x * 8).toFixed(2) + 'deg');
    mapa.style.setProperty('--tx', (-y * 6).toFixed(2) + 'deg');
  });
  mapa.addEventListener('pointerleave', () => {
    mapa.style.setProperty('--tx', '0deg'); mapa.style.setProperty('--ty', '0deg');
  });
  /* la animación de aterrizaje solo la primera vez: después el plano ya
     está en la mesa */
  mapa.addEventListener('animationend', ev => {
    if(ev.animationName === 'aterriza')
      setTimeout(() => mapa.classList.remove('aterriza'), 900);
    if(ev.animationName === 'clava') Ruido.chincheta();
  });
}
function vista(cual){
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('puesta', 'entra'));
  const v = document.getElementById(cual);
  v.classList.add('puesta');
  if(cual !== 'vMapa') v.classList.add('entra');
  scrollTo(0, 0);
}
/* el disparo de la cámara de Liz entre el plano y el caso */
function fogonazo(){
  if(quieto()) return;
  Ruido.obturador();
  const f = document.getElementById('flash');
  f.classList.remove('dispara'); void f.offsetWidth; f.classList.add('dispara');
}
/* los decimales, con su coma y sin ceros de relleno */
function dec(v){
  return v.toFixed(4).replace(/0+$/,'').replace(/[.,]$/,'').replace('.', ',').replace('-', '−');
}

/* ── LA CINTA, DE ENCARGO ─────────────────────────────────────────────
   La cinta métrica es EL manipulativo de la ciudad entera: todos los casos
   vuelven a ella. Antes vivía cosida al caso 1; ahora es una pieza que se
   monta donde haga falta —se le dice cuántos pasos tiene, qué marcas lleva,
   qué botones la cortan y a quién avisar cuando algo cambia—. Montar la
   cinta de un caso nuevo es una llamada, no un copia-y-pega. */
function montaCinta(cfg){
  const esc = document.getElementById(cfg.esc),
        tira = document.getElementById(cfg.tira),
        far  = cfg.farolas ? document.getElementById(cfg.farolas) : null;
  /* Las marcas guardan el PUNTO de la calle (v), no el número de trozos: un
     punto no cambia porque cambien los cortes, y así la equivalencia sale
     sola —la chincheta se queda quieta y solo cambia su nombre—. */
  /* «desde» es el número del borde izquierdo: 0 en toda la ciudad menos en
     el desguace, donde la cinta arranca en −2 y el cero cae en medio. Un
     punto v está a (v − desde) pasos del borde; lo demás no cambia. */
  const st = {cortes:cfg.cortes || 1, pasos:cfg.pasos, desde:cfg.desde || 0, marcas:cfg.marcas};

  /* El nombre de un punto depende de en cuántos trozos esté cortado el paso,
     y NO se simplifica: si el paso va en octavos, 1,25 se llama 10/8. Ahí
     está la gracia —la marca no se mueve y el nombre cambia—. */
  st.texto = function(v){
    const n = v * st.cortes;
    /* Un corte que no pasa por el punto no le da nombre: eso solo pasa antes
       de que el alumno corte nada (las marcas se colocan luego siempre sobre
       un corte). Mientras tanto, el punto se lee con el nombre más corto que
       tiene —1,25 es 5/4—, y no con el del corte más cercano, que mentiría. */
    if(Math.abs(n - Math.round(n)) > 1e-9){
      for(let d = 1; d <= 64; d++) if(Math.abs(v * d - Math.round(v * d)) < 1e-9)
        return (d === 1 ? String(Math.round(v)) : Math.round(v * d) + '/' + d).replace('-', '−');
      return dec(v);
    }
    const k = Math.round(n);
    return (k % st.cortes === 0 ? String(k / st.cortes) : k + '/' + st.cortes).replace('-', '−');
  };

  function pintaTira(){
    tira.innerHTML = '';
    if(far) far.innerHTML = '';
    const an = tira.getBoundingClientRect().width, tot = st.pasos * st.cortes;
    for(let k = 0; k <= tot; k++){
      const x = k * an / tot, ent = k % st.cortes === 0;
      const t = document.createElement('div'); t.className = 't';
      t.style.left = x + 'px';
      t.style.height = ent ? '17px'
        : (st.cortes % 2 === 0 && k % (st.cortes/2) === 0 ? '12px' : '8px');
      tira.appendChild(t);
      if(ent){ const n = document.createElement('div');
               const val = st.desde + k / st.cortes;
               n.className = 'n' + (k === 0 ? ' izq' : (k === tot ? ' der' : '')) + (val === 0 ? ' cero' : '');
               n.textContent = val < 0 ? '−' + (-val) : val; n.style.left = x + 'px'; tira.appendChild(n);
               if(far){ const f = document.createElement('div'); f.className = 'farola';
                        f.style.left = x + 'px'; far.appendChild(f); } }
    }
  }
  function pinta(){
    const r = tira.getBoundingClientRect(), an = r.width, izq = tira.offsetLeft;
    const ids = Object.keys(st.marcas);
    for(const id of ids){
      const el = document.getElementById(id), m = st.marcas[id];
      el.style.left = (izq + (m.v - st.desde) * an / st.pasos) + 'px';
      /* Un corte solo da nombre a los puntos por los que PASA. Si el corte
         no pasa por la marca, la marca conserva el nombre con que se midió:
         así 1/7 sigue llamándose 1/7 aunque la cinta vaya en centésimas
         —ninguna centésima cae en él, y que se vea es media lección—.
         Y una marca puede llevar nombre propio a piñón fijo, como el 3/4
         de Liz, que ella midió en cuartos y en cuartos firma. */
      const n = m.v * st.cortes, cae = Math.abs(n - Math.round(n)) < 1e-9;
      el.querySelector('.val').textContent =
        m.nombre ? m.nombre(m.v, st)
                 : (cae ? st.texto(m.v) : (m.medido || st.texto(m.v)));
    }
    /* ¿se pisan los rótulos? se mide en píxeles, que es donde se pisan */
    if(ids.length === 2){
      const a = document.getElementById(ids[0]).offsetLeft,
            b = document.getElementById(ids[1]).offsetLeft;
      esc.querySelector('.chin.dos').classList.toggle('subida',
        Math.abs(a - b) < (cfg.rozan || 44));
    }
    cfg.alCambiar(st);
  }

  /* ── LA MARCA ACTIVA ────────────────────────────────────────────────
     Primero se probó a arrastrar la chincheta: en el móvil, si el dedo no
     cae justo encima no pasa nada y parece que la app está rota. Después, a
     mover «la más cercana al dedo»: cómodo, pero traicionero. Al final, lo
     que no falla: hay una marca ACTIVA y tocar la cinta la lleva donde
     tocas. La marca fija es una PRUEBA: la midió Liz y va firmada en el
     informe. El jugador solo mueve la que se está poniendo a prueba. */
  document.getElementById(cfg.activa).classList.add('activa');
  for(const id of Object.keys(st.marcas))
    if(id !== cfg.activa) document.getElementById(id).classList.add('prueba');

  let cogida = false;
  function alPunto(ev){
    const r = tira.getBoundingClientRect();
    const x = Math.min(r.width, Math.max(0, ev.clientX - r.left));
    const m = st.marcas[cfg.activa];
    m.v = st.desde + Math.round(x / r.width * st.pasos * st.cortes) / st.cortes;
    m.medido = st.texto(m.v);   // el nombre de pila: con el corte con que se puso
    document.getElementById(cfg.activa).classList.add('arrastrando');
    pinta();
  }
  esc.addEventListener('pointerdown', ev => {
    esc.setPointerCapture(ev.pointerId);
    cogida = true; alPunto(ev);
  });
  esc.addEventListener('pointermove', ev => { if(cogida) alPunto(ev); });
  ['pointerup','pointercancel'].forEach(e => esc.addEventListener(e, () => {
    document.getElementById(cfg.activa).classList.remove('arrastrando');
    cogida = false;
  }));

  /* los botones de corte del caso: cada vista lleva los suyos */
  document.querySelectorAll(cfg.botones).forEach(b => b.addEventListener('click', () => {
    st.cortes = +b.dataset.b;   // el punto no se toca: solo cambia su nombre
    document.querySelectorAll(cfg.botones).forEach(o =>
      o.setAttribute('aria-pressed', String(+o.dataset.b === st.cortes)));
    pintaTira(); pinta();
  }));

  /* La cinta se mide en píxeles, y mientras su vista está oculta mide CERO:
     si se pinta antes de mostrarla, las chinchetas caen fuera del campo.
     Así que quien abra el caso repinta justo después de ponerla en
     pantalla, y también al girar el aparato. */
  st.repinta = () => { pintaTira(); pinta(); };
  addEventListener('resize', st.repinta);
  return st;
}

/* ── EL EXPEDIENTE, DE ENCARGO ────────────────────────────────────────
   Los encargos, el interrogatorio, el ◀ y el botón de comprobar funcionan
   igual en todos los casos: lo que cambia es el guion. Así que el motor se
   monta una vez por caso, con su guion y su vista, y el diálogo lo sigue
   llevando el alumno: nada se mueve sin que se pulse. Al acertar, el botón
   se convierte en «Siguiente encargo» y el informe se queda en pantalla
   todo el rato que haga falta. Con el ◀ se vuelve a los encargos
   anteriores —con su informe, tal como quedaron—, que en clase se pregunta
   mucho «¿qué había dicho antes?». */
/* ── LA MÁQUINA DE ESCRIBIR. Se pone el HTML entero y luego se vacían sus
   nodos de texto para irlos rellenando letra a letra, así las negritas de
   Jeff siguen siendo negritas. Devuelve una función que lo remata de golpe:
   la usan el toque sobre el texto y cualquier cambio de encargo. ── */
function escribe(el, html, alAcabar){
  el.innerHTML = html;
  if(quieto()){ if(alAcabar) alAcabar(); return () => {}; }
  const nodos = [], camina = n => {
    if(n.nodeType === 3){ nodos.push([n, n.nodeValue]); n.nodeValue = ''; }
    else n.childNodes.forEach(camina);
  };
  camina(el);
  const cursor = document.createElement('span'); cursor.className = 'cursor';
  el.appendChild(cursor);
  let i = 0, j = 0, timer;
  function remata(){
    clearInterval(timer);
    nodos.forEach(([n, t]) => n.nodeValue = t);
    cursor.remove();
    if(alAcabar) alAcabar();
  }
  let golpe = 0;
  timer = setInterval(() => {
    if(i >= nodos.length){ Ruido.retorno(); remata(); return; }
    const [n, t] = nodos[i];
    n.nodeValue = t.slice(0, ++j);
    if(t[j - 1] !== ' ' && (golpe++ % 2 === 0)) Ruido.tecla();
    if(j >= t.length){ i++; j = 0; }
  }, 14);
  return remata;
}

function montaExpediente(cfg){
  const R = document.getElementById(cfg.vista);
  const q = sel => R.querySelector(sel);
  let enc = 0, elegida = null, remata = () => {}, sellado = false;
  const hechos = new Set(), vistos = new Set();
  q('.encTxt').addEventListener('click', () => remata());

  function pintaOpciones(){
    const e = cfg.encargos[enc], caja = q('.ops');
    caja.innerHTML = '';
    caja.hidden = !e.ops;
    if(!e.ops) return;
    e.ops.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'op' + (o.ok ? ' buena' : '');
      b.textContent = T(o.t);
      b.setAttribute('aria-pressed', String(elegida === i));
      b.addEventListener('click', () => {
        if(hechos.has(enc)) return;            // resuelto: ya no se toca
        elegida = i; pintaOpciones();
      });
      caja.appendChild(b);
    });
  }
  function pintaEncargo(){
    const ultimo = enc === cfg.encargos.length - 1, hecho = hechos.has(enc);
    elegida = hecho && cfg.encargos[enc].ops
            ? cfg.encargos[enc].ops.findIndex(o => o.ok) : null;
    pintaOpciones();
    /* se escribe solo la primera vez que se ve; al volver, ya está escrito */
    remata();
    const txt = T((ultimo && hecho) ? cfg.cierre : cfg.encargos[enc].t);
    const encCaja = q('.encargo');
    encCaja.classList.remove('bien', 'mal');
    if(!hecho && !vistos.has(enc)){
      vistos.add(enc);
      encCaja.classList.add('escribiendo');
      remata = escribe(q('.encTxt'), txt, () => encCaja.classList.remove('escribiendo'));
    }else q('.encTxt').innerHTML = txt;
    /* el sello de CASO CERRADO, sobre el cierre; golpea solo la primera vez */
    const viejo = encCaja.querySelector('.sellazo');
    if(ultimo && hecho){
      if(!viejo){ const z = document.createElement('div');
                  z.className = 'sellazo' + (sellado ? '' : ' golpea');
                  z.textContent = T('CASO CERRADO'); encCaja.appendChild(z); sellado = true;
                  if(!quieto()) setTimeout(Ruido.sello, 350); }
    }else if(viejo) viejo.remove();
    q('.cualEnc').textContent = (ultimo && hecho) ? T('caso cerrado')
      : T('encargo ') + (enc + 1) + T(' de ') + cfg.encargos.length;
    q('.atras').disabled = enc === 0;
    q('.comprobar').textContent = !hecho ? T('Comprobar')
      : (ultimo ? T('Volver a la ciudad') : T('Siguiente encargo →'));
    const inf = q('.informe');
    inf.hidden = !hecho;
    /* en los interrogatorios, la réplica buena de Liz es más rica que el
       «bien» genérico: al volver con el ◀ (o al acertar) se enseña esa */
    if(hecho){ const e = cfg.encargos[enc];
               inf.className = 'informe';
               q('.infTxt').innerHTML = T(e.ops ? e.ops.find(o => o.ok).r : e.bien); }
  }
  q('.atras').addEventListener('click', () => {
    if(enc > 0){ enc--; pintaEncargo(); }
  });
  q('.comprobar').addEventListener('click', () => {
    const e = cfg.encargos[enc], inf = q('.informe');
    if(hechos.has(enc)){                       // ya resuelto: el botón avanza
      if(enc < cfg.encargos.length - 1){ enc++; pintaEncargo(); }
      else { pintaMapa(); vista('vMapa'); }
      return;
    }
    let bien, dice;
    if(e.ops){                                  // interrogatorio
      if(elegida === null){ bien = false; dice = T(e.mal); }
      else { bien = e.ops[elegida].ok; dice = T(e.ops[elegida].r);
             if(!bien) R.querySelectorAll('.op')[elegida].classList.add('fallada'); }
    }else{                                      // encargo de la cinta
      bien = e.ok();
      dice = T(bien ? e.bien : (typeof e.mal === 'function' ? e.mal() : e.mal));
    }
    inf.hidden = false;
    /* Liz entra con la cámara y Jeff reacciona: las clases se quitan y se
       vuelven a poner en el fotograma siguiente, que si no el navegador no
       relanza la animación */
    const encCaja = q('.encargo');
    encCaja.classList.remove('bien', 'mal');
    inf.className = 'informe';
    requestAnimationFrame(() => {
      inf.className = 'informe nueva' + (bien ? '' : ' mal');
      encCaja.classList.add(bien ? 'bien' : 'mal');
    });
    if(!quieto()) Ruido.obturador();
    bien ? Ruido.bien() : Ruido.mal();
    q('.infTxt').innerHTML = dice;
    if(bien){
      hechos.add(enc);
      if(enc === cfg.encargos.length - 1){ resueltos.add(cfg.caso); pintaMapa(); }
      guardaTurno();
      pintaEncargo();
      inf.hidden = false;                      // pintaEncargo ya lo deja puesto
    }
  });
  /* GUARDA y CARGA. Lo que el expediente sabe de sí mismo: qué encargos ha
     resuelto y cuáles ya se han visto escribir —al volver, el texto está
     puesto y no se teclea otra vez—. El encargo abierto no se guarda porque
     abre() siempre entra por el primero, que es como funcionaba ya. */
  return {
    abre(){ enc = 0; pintaEncargo(); },
    repinta(){ vistos.add(enc); pintaEncargo(); },
    guarda(){ return {h:[...hechos], v:[...vistos]}; },
    carga(d){
      if(!d) return;
      (d.h || []).forEach(i => { if(i >= 0 && i < cfg.encargos.length) hechos.add(i); });
      (d.v || []).forEach(i => { if(i >= 0 && i < cfg.encargos.length) vistos.add(i); });
    }
  };
}

/* ═══ EL CASO 1 · LA CINTA ══════════════════════════════════════════ */
const cinta1 = montaCinta({
  esc:'esc', tira:'tira', farolas:'farolas', pasos:3,
  botones:'#vCaso1 .b[data-b]', activa:'c2',
  /* la prueba de Liz lleva SU nombre —ella midió en cuartos— */
  /* el sospechoso arranca en la primera farola, que es donde jura que se
     quedó: el encargo es llevarlo a donde estuvo de verdad */
  marcas:{ c1:{v:0.75, nombre:() => '3/4'}, c2:{v:1, medido:'1'} },
  alCambiar(st){
    const v1 = st.marcas.c1.v, v2 = st.marcas.c2.v;
    l1.textContent = '3/4'; l2.textContent = st.texto(v2);
    d1.textContent = dec(v1); d2.textContent = dec(v2);
    const ver = document.getElementById('ver');
    if(Math.abs(v1 - v2) < 1e-9){
      ver.className = 'veredicto igual';
      ver.textContent = T('Las dos marcas caen en el MISMO punto: son la misma cantidad.');
    }else{
      ver.className = 'veredicto';
      const a = '3/4', b = st.texto(v2);
      ver.innerHTML = v1 > v2
        ? '<b>' + a + '</b>' + T(' está más a la derecha que ') + '<b>' + b + '</b>' + T(', así que es mayor.')
        : '<b>' + b + '</b>' + T(' está más a la derecha que ') + '<b>' + a + '</b>' + T(', así que es mayor.');
    }
  }
});

/* Cada encargo pide una cosa distinta y todos se resuelven en la cinta:
   localizar, comparar, y ver que dos nombres pueden ser el mismo punto. */
const ENCARGOS1 = [
 {t:'Liz ya ha marcado en verde dónde apareció el reloj: <b>tres cuartos</b> de paso desde la esquina. El sospechoso jura que él no pasó de <b>cinco cuartos</b>. Corta el paso como haga falta y ponme ahí su marca.',
  ok:() => Math.abs(cinta1.marcas.c2.v - 1.25) < 1e-9,
  bien:'Ahí lo tiene. Y fíjese: cinco cuartos es más de un paso entero, porque con cuatro cuartos ya se hace la unidad y sobra uno. Por eso su marca ha pasado de la primera farola.',
  mal:() => cinta1.cortes === 1
    ? T('Así no, jefe: con la cinta sin cortar solo puede señalar farolas. <b>Corte el paso</b> en trozos iguales —ahí arriba— y luego cuente.')
    : T('Cuente cinco trozos de cuarto desde la esquina: tiene que pasarse del 1.')},

 {t:'Entonces dígame una cosa, y piénselo: ¿el sospechoso se quedó <b>antes</b> de donde apareció el reloj, o <b>pasó de largo</b>?',
  ops:[
   {t:'Se quedó antes: su marca está más a la izquierda.', ok:false,
    r:'Mire otra vez la cinta, jefe. La suya es la roja, y está a la DERECHA de la prueba de Liz. Más a la derecha es más lejos de la esquina.'},
   {t:'Pasó de largo: su marca queda más a la derecha en la cinta.', ok:true,
    r:'Eso es. Y sin echar una sola cuenta: en la cinta, el de más a la derecha es el mayor. Estuvo donde juró que no estuvo.'},
   {t:'Pasó de largo, porque 5 es más grande que 3.', ok:false,
    r:'Le ha salido bien de chiripa, jefe, y eso en un juicio no vale. Mire: 5/8 tiene el 5 y es MENOR que 3/4. Con el numerador solo no se compara; hay que mirar en cuántos trozos se ha cortado el paso.'},
   {t:'No se puede saber: son fracciones distintas.', ok:false,
    r:'Sí se puede, y es lo bueno de la cinta: dos fracciones son dos PUNTOS de la misma calle. Siempre se puede ver cuál queda más a la derecha.'}],
  bien:'Eso es. Y sin echar una sola cuenta: en la cinta, el de más a la derecha es el mayor.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'Se ha puesto nervioso y cambia la declaración: ahora dice que él dijo <b>diez octavos</b>, no cinco cuartos. Corta el paso en <b>ocho</b> y dime si eso le salva.',
  ok:() => cinta1.cortes === 8 && Math.abs(cinta1.marcas.c2.v - 1.25) < 1e-9,
  bien:'No le salva, jefe: la marca <b>no se ha movido</b>. 10/8 y 5/4 son el mismo punto de la acera, así que ha declarado dos veces lo mismo con otro nombre. A eso lo llamamos <b>fracciones equivalentes</b>.',
  mal:() => cinta1.cortes !== 8
    ? T('Pulse el <b>8</b> ahí arriba para cortar el paso en octavos. La marca no hay que tocarla.')
    : T('La marca se le ha movido: vuelva a dejarla en <b>10/8</b>, que es donde estaba.')},

 {t:'Última cosa y cerramos. Si el sospechoso quisiera una coartada que se sostenga, ¿dónde tendría que haber estado? Ponme su marca en <b>cualquier</b> sitio que le salve.',
  ok:() => cinta1.marcas.c2.v < 0.75,
  bien:'Cualquier punto <b>a la izquierda de la tiza</b> le valdría: 1/2, 5/8, 0… todos son menores que 3/4, y desde ahí no ve el escaparate. Pero él dijo 5/4, y eso está al otro lado.',
  mal:'Todavía está en la parte mala de la calle, jefe: tiene que quedar <b>a la izquierda</b> de la marca verde.'}
];
const caso1 = montaExpediente({
  vista:'vCaso1', caso:1, encargos:ENCARGOS1,
  cierre:'<b>Caso cerrado.</b> Con las dos marcas en la cinta no hay '
    + 'declaración que valga. Y hay más: su coche entró esa noche en el taller '
    + 'de Nick, a cambiar una rueda.'
});

/* ═══ EL CASO 2 · LA LLAVE ══════════════════════════════════════════
   El corazón del caso es comparar 5/16, 3/8 y 1/2, y se hace a lo Wu: dos
   fracciones se comparan poniéndolas en la MISMA sucesión de puntos —el
   mismo corte—. Por eso el perno no lleva nombre fijo del todo: cuando la
   pulgada va en dieciseisavos, 3/8 se lee 6/16, y la comparación con 5/16
   queda a la vista —quinto punto contra sexto punto—. Y cuando el corte NO
   pasa por el perno (en terceros, en doceavos…), el punto sigue ahí pero
   ese corte no le da nombre: se queda con el 3/8 con que lo midió Liz. */
const cinta2 = montaCinta({
  esc:'esc2', tira:'tira2', farolas:null, pasos:1, rozan:62,
  botones:'#vCaso2 .b[data-b]', activa:'m2l',
  marcas:{ m2p:{v:0.375, medido:'3/8'}, m2l:{v:0.5, medido:'1/2'} },
  alCambiar(st){
    const vp = st.marcas.m2p.v, vl = st.marcas.m2l.v;
    pn2.textContent = document.querySelector('#m2p .val').textContent;
    dp2.textContent = dec(vp);
    ll2.textContent = st.texto(vl); dl2.textContent = dec(vl);
    const ver = document.getElementById('ver2');
    /* el veredicto habla en llave y perno: menor no entra, mayor baila */
    if(Math.abs(vp - vl) < 1e-9){
      ver.className = 'veredicto igual';
      ver.textContent = T('La llave cae en el MISMO punto que el perno: es su llave exacta.');
    }else if(vl < vp){
      ver.className = 'veredicto';
      ver.innerHTML = '<b>' + st.texto(vl) + '</b>' + T(' queda a la izquierda del perno: la boca es <b>menor</b> que 3/8 y no entra.');
    }else{
      ver.className = 'veredicto';
      ver.innerHTML = '<b>' + st.texto(vl) + '</b>' + T(' queda a la derecha del perno: la boca es <b>mayor</b> que 3/8 y baila.');
    }
  }
});

const ENCARGOS2 = [
 {t:'Nick jura que a esa rueda solo la tocó una llave, y en el banco hay tres: <b>5/16</b>, <b>3/8</b> y <b>1/2</b> de pulgada. Empecemos por la pequeña: corta la pulgada como haga falta y ponme la marca de la llave de <b>cinco dieciseisavos</b>.',
  ok:() => Math.abs(cinta2.marcas.m2l.v - 5/16) < 1e-9,
  bien:'Ahí está. Y mire lo que ha pasado con el perno: al cortar en dieciseisavos también ha cambiado de nombre — <b>3/8 = 6/16</b>. Ahora los dos viven en la misma sucesión: la llave es el <b>5.º</b> punto y el perno el <b>6.º</b>.',
  mal:() => cinta2.cortes !== 16
    ? T('Dieciseisavos, jefe: hay que cortar la pulgada en <b>16</b> partes iguales. Con este corte no hay manera de señalarlos.')
    : T('Cuente <b>cinco</b> trozos desde el 0: se queda antes del perno.')},

 {t:'Pues dígamelo en fino: la llave de 5/16, ¿es <b>menor</b> o <b>mayor</b> que el perno de 3/8? Y ojo con el porqué, que va al informe.',
  ops:[
   {t:'Mayor: 5 es más grande que 3, y 16 más grande que 8.', ok:false,
    r:'Con los números sueltos no se compara, jefe. Mire la cinta: su marca ha quedado a la IZQUIERDA del perno. Y con el mismo corte se ve el porqué: 5/16 contra 6/16, el quinto punto de la sucesión llega antes que el sexto.'},
   {t:'Menor: con la pulgada en dieciseisavos son 5/16 y 6/16, y el 5.º punto queda a la izquierda del 6.º.', ok:true,
    r:'Eso es un informe. Mismo corte, misma sucesión de puntos, y entonces sí: gana el numerador. La llave se queda corta y en ese perno no entra.'},
   {t:'Menor, porque los dieciseisavos son trozos más pequeños que los octavos.', ok:false,
    r:'A medias, jefe, y las medias verdades me dan urticaria. Los trozos son más pequeños, sí, pero la llave lleva CINCO y el perno solo TRES: muchos trozos chicos pueden ganar a pocos grandes —7/16 ya es más que 3/8—. El tamaño del trozo solo decide cuando se llevan los MISMOS. Para esto: mismo corte, 5/16 contra 6/16.'},
   {t:'No se puede saber sin calculadora.', ok:false,
    r:'La calculadora está bien, pero la cinta no miente: dos fracciones son dos puntos de la misma pulgada, y siempre se ve cuál queda a la izquierda.'}],
  bien:'Eso es un informe. Mismo corte, misma sucesión de puntos, y entonces sí: gana el numerador.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'Queda la grande. Nick asegura que la de <b>1/2</b> «es la misma que la de 8/16, que lo pone grabado en el mango». Deja la pulgada en <b>dieciseisavos</b>, ponme la marca en un medio y dime si el hombre miente.',
  ok:() => cinta2.cortes === 16 && Math.abs(cinta2.marcas.m2l.v - 0.5) < 1e-9,
  bien:'No miente: en dieciseisavos la marca se llama <b>8/16</b> y está clavada en mitad de la pulgada. 1/2 y 8/16: dos nombres, un punto — como el 5/4 y el 10/8 de la relojería. Y de paso ya tiene usted las tres medidas en la misma sucesión: 5, 6 y 8 dieciseisavos.',
  mal:() => cinta2.cortes !== 16
    ? T('En dieciseisavos, jefe: pulse el <b>16</b>. Si el hombre dice la verdad, el medio tendrá nombre ahí también.')
    : T('Un medio es la MITAD de la pulgada: la marca va justo en medio del 0 y el 1.')},

 {t:'Cerremos. Al perno de 3/8 solo lo abre su llave clavada: ni corta ni bailona. Con las tres medidas vistas en la cinta, ¿cuál es la buena y en qué orden van, de chica a grande?',
  ops:[
   {t:'5/16 < 3/8 < 1/2, y la buena es la de 3/8.', ok:true,
    r:'Cerrado. En dieciseisavos: 5/16, 6/16 y 8/16 — quinto, sexto y octavo punto de la misma sucesión—. La de 5/16 no entra, la de 1/2 baila, y la de 3/8 ajusta clavada. Esa es la que usó Nick.'},
   {t:'3/8 < 5/16 < 1/2, y la buena es la de 5/16.', ok:false,
    r:'La cinta dice que no: la marca de 5/16 cayó a la IZQUIERDA del perno. Una boca menor que el perno no entra, por mucho que se empeñe.'},
   {t:'5/16 < 1/2 < 3/8, porque el 2 es el más pequeño de los de abajo.', ok:false,
    r:'Al revés, jefe: cortar en MENOS trozos da trozos MÁS grandes. Un medio es 8/16, y ocho dieciseisavos es lo más a la derecha que tenemos en el banco.'},
   {t:'Da igual el orden: una llave un poco grande también aprieta.', ok:false,
    r:'Dígaselo al perno cuando se le coman las esquinas. En este oficio y en esta cinta, «un poco» también se mide: mayor es mayor, y baila.'}],
  bien:'Cerrado. La de 3/8 ajusta clavada: esa es la que usó Nick.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso2 = montaExpediente({
  vista:'vCaso2', caso:2, encargos:ENCARGOS2,
  cierre:'<b>Caso cerrado.</b> La llave de 3/8 es la de Nick, y en su registro '
    + 'la rueda se cambió la noche del robo. ¿La hora? «Y cuarto… o y veinte, '
    + 'no sabría decirle.» En comisaría hay cuatro coartadas medidas en horas, '
    + 'y una no sale redonda ni queriendo.'
});


/* ── LA DIVISIÓN LARGA, DE ENCARGO ───────────────────────────────────
   El caso 3 no se juega en la cinta: se juega en una división. Y el motor
   es el mismo argumento de Wu, hecho botón: al dividir m entre n, el resto
   de cada paso es un número entre 0 y n−1. Si sale 0, la cuenta se acaba.
   Si no, solo quedan n−1 valores posibles, así que en n pasos como mucho
   uno TIENE que repetirse —y desde ahí se repite todo lo que venga detrás,
   porque cada paso depende solo del resto anterior—. No es una
   observación: es una demostración, y aquí se ve caer resto a resto. */
function montaDivision(cfg){
  const R = document.getElementById(cfg.vista), q = sel => R.querySelector(sel);
  const st = {num:1, den:4, cifras:[], restos:[1], estado:'anda', desde:0, periodo:0};
  const TOPE = 14;                       // ni un paso más: en clase no hace falta

  st.arranca = function(num, den){
    st.num = num; st.den = den; st.cifras = []; st.restos = [num];
    st.estado = 'anda'; st.desde = 0; st.periodo = 0; st.animaUltimo = false; pinta();
  };
  st.paso = function(){
    if(st.estado !== 'anda' || st.cifras.length >= TOPE) return;
    const r = st.restos[st.restos.length - 1] * 10;
    const c = Math.floor(r / st.den), nr = r - c * st.den;
    st.cifras.push(c); st.restos.push(nr);
    if(nr === 0) st.estado = 'exacta';
    else {
      const i = st.restos.indexOf(nr);
      if(i < st.restos.length - 1){        // ese resto ya había estado en la celda
        st.estado = 'periodica'; st.desde = i; st.periodo = st.restos.length - 1 - i;
      }
    }
    pinta();
  };

  function pinta(){
    document.getElementById(cfg.num).textContent = st.num;
    document.getElementById(cfg.den).textContent = st.den;
    /* el cociente, con el periodo subrayado: la cifra que se repite es la
       que nace del resto repetido, no la del resto en sí */
    const ult = st.cifras.length - 1;
    let coc = '0,';
    st.cifras.forEach((c, k) => {
      coc += (st.estado === 'periodica' && k === st.desde) ? '<span class="periodo">' : '';
      coc += '<span class="cifra' + (k === ult && st.animaUltimo ? ' nueva' : '') + '">' + c + '</span>';
    });
    if(st.estado === 'periodica') coc += '</span>…';
    document.getElementById(cfg.coc).innerHTML = coc || '0,';
    /* la bajada: el resto anterior con su cero, y lo que da */
    const baj = document.getElementById(cfg.bajada);
    if(st.cifras.length){
      const rAnt = st.restos[ult], r10 = rAnt * 10, c = st.cifras[ult], nr = st.restos[ult + 1];
      baj.innerHTML = T('bajo un ') + '<span class="cero">0</span>: <b>' + rAnt + '</b>'
        + '<span class="cero">0</span> ÷ ' + st.den + ' = <b>' + c + '</b>'
        + (nr ? T(' y sobran ') + '<b>' + nr + '</b>' : T(' y no sobra nada'));
      baj.classList.toggle('nueva', !!st.animaUltimo);
    }else baj.innerHTML = '';

    const caja = document.getElementById(cfg.celdas); caja.innerHTML = '';
    st.restos.forEach((r, k) => {
      const d = document.createElement('div');
      d.className = 'celda' + (r === 0 ? ' cero' : '')
        + (st.estado === 'periodica' && (k === st.desde || k === st.restos.length - 1) ? ' repe' : '')
        + (k === st.restos.length - 1 && k > 0 && st.animaUltimo ? ' nueva' : '');
      d.innerHTML = '<b>' + r + '</b>' + (k ? T('paso ') + k : T('de salida'));
      caja.appendChild(d);
    });
    q('#' + cfg.paso).disabled = st.estado !== 'anda' || st.cifras.length >= TOPE;
    q('#' + cfg.todo).disabled = q('#' + cfg.paso).disabled;
    cfg.alCambiar(st);
  }

  q('#' + cfg.paso).addEventListener('click', () => { st.animaUltimo = true; st.paso(); });
  q('#' + cfg.todo).addEventListener('click', () => {
    st.animaUltimo = false;   // catorce animaciones seguidas marean: de golpe
    while(st.estado === 'anda' && st.cifras.length < TOPE) st.paso();
  });
  q('#' + cfg.otra).addEventListener('click', () => st.arranca(st.num, st.den));
  R.querySelectorAll('.b[data-fr]').forEach(b => b.addEventListener('click', () => {
    const [n, d] = b.dataset.fr.split('/').map(Number);
    R.querySelectorAll('.b[data-fr]').forEach(o =>
      o.setAttribute('aria-pressed', String(o === b)));
    st.arranca(n, d);
  }));
  st.repinta = pinta;
  return st;
}

/* ═══ EL CASO 3 · LAS CELDAS ════════════════════════════════════════ */
const div3 = montaDivision({
  vista:'vCaso3', num:'d3n', den:'d3d', coc:'d3c', celdas:'d3celdas', bajada:'d3bajada',
  paso:'d3paso', todo:'d3todo', otra:'d3otra',
  alCambiar(st){
    const ver = document.getElementById('ver3');
    if(st.estado === 'exacta'){
      ver.className = 'veredicto igual';
      ver.innerHTML = T('Resto <b>0</b>: la cuenta se acabó. ') + st.num + '/' + st.den
        + T(' es una fracción <b>decimal exacta</b>.');
    }else if(st.estado === 'periodica'){
      ver.className = 'veredicto';
      ver.innerHTML = T('El resto ') + '<b>' + st.restos[st.desde] + '</b>' + T(' ha vuelto a salir. Desde ahí todo se repite: ')
        + st.num + '/' + st.den + T(' es <b>periódica</b>, con un periodo de ') + st.periodo + T(st.periodo === 1 ? ' cifra.' : ' cifras.');
    }else{
      ver.className = 'veredicto';
      ver.innerHTML = st.cifras.length
        ? T('Van ') + st.cifras.length + T(' pasos y el resto todavía no es 0 ni se ha repetido.')
        : T('Elija una coartada y empiece a dar pasos.');
    }
  }
});
const ENCARGOS3 = [
 {t:'Empecemos por la portera: <b>un cuarto</b> de hora. Elija su coartada ahí arriba y déle pasos hasta que la cuenta se le acabe sola.',
  ok:() => div3.den === 4 && div3.estado === 'exacta',
  bien:'0,25 de hora, o sea quince minutos. Y fíjese en cómo terminó: el resto llegó a <b>cero</b> y ya no había nada que bajar. Cuando eso pasa, decimos que la fracción es <b>decimal exacta</b> — y entonces sí se puede escribir entera en un papel.',
  mal:() => div3.den !== 4
    ? T('La de la portera, jefe: <b>1/4</b>. Pulse su botón ahí arriba.')
    : T('Siga dando pasos: esa cuenta todavía tiene cuerda.')},

 {t:'El vigilante dice <b>tres octavos</b>. Compruébelo, que este tiene más pasos y quiero ver si también se le acaba.',
  ok:() => div3.den === 8 && div3.estado === 'exacta',
  bien:'0,375: tres pasos y resto cero, se acabó igual. Apunte una cosa para luego: 8 es 2·2·2, y 4 era 2·2. Los dos están hechos solo de doses. Guárdeselo.',
  mal:() => div3.den !== 8
    ? T('La del vigilante, jefe: <b>3/8</b>.')
    : T('Siga: le quedan pasos antes de que salga el cero.')},

 {t:'Ahora la del sereno, que es la que huele: <b>un séptimo</b> de hora. Déle pasos y no me quite ojo a las celdas.',
  ok:() => div3.den === 7 && div3.estado === 'periodica',
  bien:'Ahí lo tiene: el resto <b>1</b> ha vuelto a la celda donde empezó, y a partir de ahí la cuenta se muerde la cola — 0,142857 142857… sin final. El sereno entregó ese número <b>escrito y firmado como si acabara</b>. Nadie puede escribir 1/7 en decimal: no cabe en ningún papel.',
  mal:() => div3.den !== 7
    ? T('La del sereno, jefe: <b>1/7</b>.')
    : T('Déle más pasos, que la cosa se pone interesante hacia el sexto.')},

 {t:'Antes de seguir quiero entenderlo yo. ¿Por qué esa cuenta <b>tenía</b> que repetirse? No me valga «porque sí».',
  ops:[
   {t:'Porque 7 es impar.', ok:false,
    r:'5 también es impar, jefe, y 1/5 son 0,2 clavados. Por ahí no va.'},
   {t:'Porque al dividir entre 7 los restos solo pueden ser 1, 2, 3, 4, 5 o 6. Como cada paso depende solo del resto anterior, en cuanto uno se repite se repite todo lo que viene detrás.', ok:true,
    r:'Eso es exactamente el motivo, y fíjese en lo bueno que tiene: no hace falta dividir para saberlo. Seis celdas, siete pasos — alguna se ocupa dos veces por fuerza. Y desde ese momento la cuenta ya no puede hacer otra cosa que repetirse.'},
   {t:'Porque 7 es un número primo.', ok:false,
    r:'5 es primo y 1/5 sale exacta; 2 es primo y 1/2 sale exacta. Ser primo no tiene nada que ver, jefe: lo que importa es <b>qué</b> primos, no cuántos.'},
   {t:'Porque la división está mal hecha y en algún paso nos hemos equivocado.', ok:false,
    r:'La división está impecable. Y menos mal, porque lo que enseña no es un error: es que hay números que en decimal no acaban nunca.'}],
  bien:'Seis celdas y siete pasos: alguna se ocupa dos veces por fuerza.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'El taxista jura que <b>cinco sextos</b> de hora son «cero coma ochenta y tres, redondos». Compruébelo usted y dígame si el hombre exagera.',
  ok:() => div3.den === 6 && div3.estado === 'periodica',
  bien:'Exagera: 0,8<b>333</b>… El resto <b>2</b> se queda dando vueltas en su celda y ya no sale de ahí. El taxista redondeó y llamó «redondo» a lo que había redondeado él. (En minutos sí le sale limpio —50—, pero eso es porque la hora tiene 60, no porque el decimal acabe.)',
  mal:() => div3.den !== 6
    ? T('La del taxista, jefe: <b>5/6</b>.')
    : T('Déle otro paso más: mire el resto y mire el anterior.')},

 {t:'Cerremos el turno. Ya ha visto las cuatro: 1/4 y 3/8 acaban; 5/6 y 1/7 no. ¿Hay manera de saberlo <b>antes</b> de ponerse a dividir?',
  ops:[
   {t:'Sí: las de denominador par acaban y las de impar no.', ok:false,
    r:'6 es par, jefe, y 5/6 no acaba. Casi, pero no: el par no basta.'},
   {t:'Sí: acaban aquellas cuyo denominador se construye solo con doses y cincos. 4 = 2·2 y 8 = 2·2·2 acaban; 6 = 2·3 y 7 llevan otra cosa dentro y no acaban.', ok:true,
    r:'Eso es. Un decimal exacto no es más que una fracción con 10, 100 o 1000 debajo, y 10 se hace con un 2 y un 5. Si el denominador lleva algún otro primo —un 3, un 7— no hay manera de llegar a una potencia de diez, y la cuenta no puede acabar. Con eso se sabe de un vistazo, sin dividir.',
   },
   {t:'Sí: acaban las de denominador pequeño.', ok:false,
    r:'1/7 tiene el denominador más pequeño que 1/8, y es la que no acaba. El tamaño no pinta nada.'},
   {t:'No hay regla: hay que dividir siempre y ver qué sale.', ok:false,
    r:'Dividir siempre funciona, jefe, no se lo discuto. Pero sí hay regla, y es corta: mire de qué primos está hecho el denominador. Si solo hay doses y cincos, acaba.'}],
  bien:'Doses y cincos: los que fabrican el diez.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso3 = montaExpediente({
  vista:'vCaso3', caso:3, encargos:ENCARGOS3,
  cierre:'<b>Caso cerrado.</b> El sereno escribió un número que no se puede '
    + 'escribir: copió la cifra de un papel que no era suyo. ¿De dónde? De la '
    + 'libreta del contratista del puente viejo, que anda repartiendo diez '
    + 'metros de barandilla entre tres tramos y cobrando como si cayeran justos.'
});

/* ═══ EL CASO 4 · LA BARANDILLA ═════════════════════════════════════
   Aquí se ve que una fracción ES una división. Diez metros repartidos en
   tres tramos: el tramo mide 10/3, y ese punto se puede alcanzar de las dos
   maneras —cortando el metro en tercios y contando diez, o partiendo los
   diez metros en tres—. Es el mismo punto, y por eso 10/3 y 10÷3 son la
   misma cosa. La división con resto (10 = 3·3 + 1) dice además ENTRE QUÉ
   ENTEROS cae: entre el 3 y el 4. */
const cinta4 = montaCinta({
  esc:'esc4', tira:'tira4', farolas:null, pasos:4, cortes:1,
  botones:'#vCaso4 .b[data-b]', activa:'m4t',
  marcas:{ m4f:{v:3, nombre:() => '3'}, m4t:{v:2} },
  alCambiar(st){
    const v = st.marcas.m4t.v;
    tr4.textContent = st.texto(v); dt4.textContent = dec(v);
    const ver = document.getElementById('ver4');
    if(Math.abs(v - 3) < 1e-9){
      ver.className = 'veredicto';
      ver.innerHTML = T('El tramo mide lo mismo que dice la factura. Nueve tercios de metro.');
    }else if(Math.abs(v - 10/3) < 1e-9){
      ver.className = 'veredicto igual';
      ver.innerHTML = T('<b>10/3</b> contra los <b>9/3</b> de la factura: sobra <b>un tercio de metro</b> en cada tramo.');
    }else{
      ver.className = 'veredicto';
      ver.innerHTML = v > 3
        ? '<b>' + st.texto(v) + '</b>' + T(' pasa de los 3 metros de la factura.')
        : '<b>' + st.texto(v) + '</b>' + T(' no llega a los 3 metros de la factura.');
    }
  }
});
const ENCARGOS4 = [
 {t:'Diez metros de barandilla y tres tramos iguales entre pilar y pilar. Córteme el metro en <b>tercios</b> y póngame dónde acaba el <b>primer tramo</b>.',
  ok:() => cinta4.cortes === 3 && Math.abs(cinta4.marcas.m4t.v - 10/3) < 1e-9,
  bien:'Diez tercios de metro. Y mire dónde ha caído: <b>entre el 3 y el 4</b>. Eso no es casualidad — 10 = 3·3 + 1, o sea tres metros enteros y todavía un tercio suelto. La división con resto le dice de antemano entre qué farolas va a caer la marca.',
  mal:() => cinta4.cortes !== 3
    ? T('En tercios, jefe: pulse el <b>3</b>. Diez metros en tres tramos pide cortar el metro en tres.')
    : T('Cuente <b>diez</b> trozos de tercio desde el cero: se le pasará del 3.')},

 {t:'Antes de ir a por el contratista quiero que me diga qué es eso de <b>10/3</b>, exactamente.',
  ops:[
   {t:'Es el punto que sale al partir los diez metros en tres partes iguales y quedarse con una.', ok:true,
    r:'Justo, y ahí está lo bonito: usted ha llegado a ese punto por el otro camino —cortando UN metro en tercios y contando diez—, y ha caído en el mismo sitio. Por eso una fracción es una división: 10/3 y 10 ÷ 3 son el mismo punto de la cinta.'},
   {t:'Son tres metros, y sobra uno que ya no se reparte.', ok:false,
    r:'Ese metro que sobra también es barandilla, jefe, y también se reparte: le toca un tercio a cada tramo. Por eso el tramo es 3 <b>y un tercio</b>, no 3 pelado. Justo ese tercio es lo que estamos persiguiendo.'},
   {t:'Son 3,3 metros.', ok:false,
    r:'Casi, y ese «casi» es el negocio del contratista. 10/3 es 3,333… sin final —como el 5/6 del taxista—. En la cinta la marca está un pelo a la derecha de 3,3.'},
   {t:'No se puede repartir: 10 no es múltiplo de 3.', ok:false,
    r:'Con metros de barandilla se puede cortar por donde haga falta, jefe. Que no salga entero no quiere decir que no salga: sale 10/3, que es un punto perfectamente localizado en la cinta. Lo acaba usted de poner.'}],
  bien:'Una fracción es una división: 10/3 y 10 ÷ 3 son el mismo punto.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'Ahora póngase en la piel del contratista: él puso los pilares a <b>tres metros justos</b> cada tramo. Deje el metro en tercios y ponga ahí la marca roja, encima de la verde.',
  ok:() => cinta4.cortes === 3 && Math.abs(cinta4.marcas.m4t.v - 3) < 1e-9,
  bien:'Con el metro en tercios, sus tres metros se llaman <b>9/3</b>. Y el tramo de verdad era <b>10/3</b>. Mismo corte, misma sucesión de puntos: nueve contra diez. Falta <b>un tercio de metro</b> en cada tramo, y eso ya no hay quien lo discuta.',
  mal:() => cinta4.cortes !== 3
    ? T('Déjelo en tercios, jefe, que es donde se ven las dos medidas con el mismo nombre.')
    : T('Tres metros justos: la marca roja va encima de la verde.')},

 {t:'Última pregunta y le pongo las esposas. Con tres tramos a un tercio de menos cada uno, ¿cuánta barandilla cobró sin ponerla?',
  ops:[
   {t:'Un tercio de metro.', ok:false,
    r:'Un tercio es lo que falta en <b>un</b> tramo, jefe, y hay tres. Vuelva a contar.'},
   {t:'Un metro entero: un tercio por tramo, y tres tramos son 1/3 + 1/3 + 1/3.', ok:true,
    r:'Un metro clavado. Y mire qué limpio sale juntando los tres tramos: 1/3 + 1/3 + 1/3 son tres trozos de tercio, o sea 3/3, que es la unidad entera. Puso nueve metros y cobró diez.'},
   {t:'Siete metros: diez menos tres.', ok:false,
    r:'Los tres metros son un tramo, no la barandilla entera. La barandilla son tres tramos, jefe.'},
   {t:'Nada: 10/3 y 3 son lo mismo.', ok:false,
    r:'En la cinta están en sitios distintos: 9/3 y 10/3, un tercio de diferencia. Si fueran lo mismo no habría caso — y hay caso.'}],
  bien:'Un metro: 1/3 + 1/3 + 1/3 son 3/3, la unidad entera.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso4 = montaExpediente({
  vista:'vCaso4', caso:4, encargos:ENCARGOS4,
  cierre:'<b>Caso cerrado.</b> Un metro de barandilla que nunca se puso, y el '
    + 'hueco justo por donde se cae al río. Hablando de agua: en el pantano '
    + 'llevan tres noches sumando lluvia y el guarda no sabe sumar fracciones.'
});

/* ═══ EL CASO 5 · EL NIVEL ══════════════════════════════════════════
   Sumar es JUNTAR: se pone un tramo detrás de otro y se mide el total. Por
   eso solo se pueden contar juntos los trozos del mismo tamaño —cuatro
   octavos y un octavo son cinco octavos—, y por eso 1/2 + 1/8 no puede ser
   2/10: juntando agua el nivel no baja. */
const cinta5 = montaCinta({
  esc:'esc5', tira:'tira5', farolas:null, pasos:2, cortes:1, rozan:52,
  botones:'#vCaso5 .b[data-b]', activa:'m5n',
  marcas:{ m5p:{v:0.75, nombre:() => '3/4'}, m5n:{v:0.5} },
  alCambiar(st){
    const v = st.marcas.m5n.v;
    nv5.textContent = st.texto(v); dn5.textContent = dec(v);
    /* el agua se dibuja hasta la marca, y el dique se planta en el 1 */
    const t = document.getElementById('tira5'), r = t.getBoundingClientRect();
    const agua = document.getElementById('agua5'), dique = document.getElementById('dique5');
    agua.style.left = t.offsetLeft + 'px';
    agua.style.top  = (t.offsetTop + 44) + 'px';
    agua.style.width = Math.max(0, v * r.width / st.pasos) + 'px';
    dique.style.left = (t.offsetLeft + r.width / st.pasos - 2) + 'px';
    dique.style.top  = (t.offsetTop + 30) + 'px';
    dique.style.height = '66px';
    const ver = document.getElementById('ver5');
    if(v > 1 + 1e-9){
      ver.className = 'veredicto'; ver.style.borderColor = 'var(--oxido)';
      ver.innerHTML = '<b>' + st.texto(v) + '</b>' + T(' pasa del dique entero: la ciudad se moja.');
    }else{
      ver.style.borderColor = '';
      if(v > 0.75 + 1e-9){
        ver.className = 'veredicto';
        ver.innerHTML = '<b>' + st.texto(v) + '</b>' + T(' ha pasado la línea de peligro: se moja el barrio bajo.');
      }else if(Math.abs(v - 0.75) < 1e-9){
        ver.className = 'veredicto igual';
        ver.innerHTML = T('El nivel está clavado en la <b>línea de peligro</b>.');
      }else{
        ver.className = 'veredicto';
        ver.innerHTML = '<b>' + st.texto(v) + '</b>' + T(' queda por debajo de 3/4: de momento, seco.');
      }
    }
  }
});
const ENCARGOS5 = [
 {t:'El guarda me dice que el nivel estaba en <b>medio dique</b> y que anoche llovió <b>un octavo</b> más. Córteme el dique en octavos y póngame el nivel de esta mañana.',
  ok:() => Math.abs(cinta5.marcas.m5n.v - 0.625) < 1e-9,
  bien:'Cinco octavos. Y fíjese en cómo ha salido, que es lo único que hay que entender de sumar: medio dique son <b>4/8</b>, y detrás se le junta <b>1/8</b>. Cuatro trozos y uno más, todos del mismo tamaño: <b>5/8</b>. Sumar es poner un tramo detrás del otro y medir el total.',
  mal:() => cinta5.cortes !== 8
    ? T('En octavos, jefe: pulse el <b>8</b>. Con ese corte medio dique también tiene nombre.')
    : T('Cuente: medio dique son cuatro octavos, y uno más son cinco.')},

 {t:'El guarda lo había apuntado así en el libro: «1/2 + 1/8 = <b>2/10</b>». Dígame por qué eso no puede ser.',
  ops:[
   {t:'Porque los de arriba se suman con los de arriba y los de abajo con los de abajo, y él lo hizo al revés.', ok:false,
    r:'No, jefe: eso que describe usted es justo lo que él hizo, y es lo que está mal. Los de abajo no se suman nunca — dicen de qué tamaño es el trozo, no cuántos hay.'},
   {t:'Porque 2/10 es menor que 1/2, y juntando agua el nivel no puede bajar.', ok:false,
    r:'Bien visto, y con eso ya se tira el 2/10 a la basura: 0,2 contra 0,5. Pero eso dice que está MAL, no por qué. El motivo es el de abajo, y conviene saberlo: si no, la próxima vez que el número salga mayor se lo tragará.'},
   {t:'Porque para juntar trozos tienen que ser del mismo tamaño: en octavos son 4/8 y 1/8, y juntos hacen 5/8.', ok:true,
    r:'Ese es el motivo entero. Cuatro octavos y un octavo son cinco octavos igual que cuatro sillas y una silla son cinco sillas — pero solo porque son del mismo tamaño. Con medios y octavos mezclados no hay nada que contar hasta que se les da el mismo corte.'},
   {t:'Porque hay que multiplicar en cruz antes de sumar.', ok:false,
    r:'Multiplicar en cruz es una receta, y aquí las recetas se quedan en la puerta. Lo que hay que hacer es darles el mismo corte y contar.'}],
  bien:'Para juntar trozos tienen que ser del mismo tamaño.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'Han abierto la compuerta y el nivel <b>ha bajado un cuarto</b> de dique desde esos 5/8. Póngame dónde se ha quedado.',
  ok:() => Math.abs(cinta5.marcas.m5n.v - 0.375) < 1e-9,
  bien:'Tres octavos. Restar es lo mismo pero al revés: <b>quitar</b> un tramo del que había y medir lo que queda. Un cuarto son <b>2/8</b>, y a cinco octavos les quitamos dos: quedan <b>3/8</b>. Otra vez, todo del mismo tamaño antes de contar.',
  mal:() => cinta5.cortes !== 8
    ? T('Déjelo en octavos, jefe, que un cuarto también se llama 2/8.')
    : T('De cinco octavos quite dos octavos, que es lo que vale un cuarto.')},

 {t:'Mala noche. Sobre <b>medio dique</b> de partida les han caído <b>un tercio</b> y <b>un cuarto</b> a la vez. Corte el dique en <b>doceavos</b> y dígame si dormimos tranquilos.',
  ok:() => cinta5.cortes === 12 && Math.abs(cinta5.marcas.m5n.v - 13/12) < 1e-9,
  bien:'No dormimos, jefe: <b>13/12</b>. Con el dique en doceavos las tres aguas tienen por fin el mismo nombre — 6/12 + 4/12 + 3/12 — y trece trozos de doceavo son <b>más que los doce</b> que hace el dique entero. Igual que los 5/4 de la relojería: cuando el de arriba pasa al de abajo, se ha pasado de la unidad. Avise al barrio bajo.',
  mal:() => cinta5.cortes !== 12
    ? T('En doceavos, jefe: pulse el <b>12</b>. Es el único corte donde caben los medios, los tercios y los cuartos a la vez.')
    : T('Junte los tres: 6/12 del nivel, 4/12 del tercio y 3/12 del cuarto.')}
];
const caso5 = montaExpediente({
  vista:'vCaso5', caso:5, encargos:ENCARGOS5,
  cierre:'<b>Caso cerrado.</b> El pantano aguantó por los pelos y el libro del '
    + 'guarda queda corregido. Y en la saca que apareció flotando bajo el '
    + 'puente había doce mil dólares del banco de la calle 4, con una nota de '
    + 'reparto que no le cuadra a nadie.'
});

/* ═══ EL CASO 6 · EL REPARTO ════════════════════════════════════════
   Una fracción DE una cantidad no es una regla aparte: es la misma cinta con
   otra unidad. Si de 0 a 1 está el botín entero, cortar en cuatro y contar
   tres es 3/4 del botín — y en dinero, partir 12.000 en cuatro partes de
   3.000 y quedarse con tres. La cinta lo enseña; la cuenta lo confirma. */
const BOTIN = 12000;
const euros = n => String(Math.round(n)).replace(/\B(?=(\d{3})+$)/g, '.');
const cinta6 = montaCinta({
  esc:'esc6', tira:'tira6', farolas:null, pasos:1, cortes:1,
  botones:'#vCaso6 .b[data-b]', activa:'m6',
  marcas:{ m6:{v:0.5} },
  alCambiar(st){
    const v = st.marcas.m6.v;
    pa6.textContent = st.texto(v); di6.textContent = euros(v * BOTIN);
    const ver = document.getElementById('ver6');
    ver.className = 'veredicto';
    ver.innerHTML = st.cortes > 1
      ? T('El botín en ') + '<b>' + st.cortes + '</b>' + T(' partes iguales: cada una vale ') + '<b>'
        + euros(BOTIN / st.cortes) + ' $</b>' + T('. La marca cuenta ') + '<b>'
        + Math.round(v * st.cortes) + '</b>' + T(' de esas partes.')
      : T('Corte el botín en partes iguales para poder contar.');
  }
});
const ENCARGOS6 = [
 {t:'La nota dice que al jefe le tocan <b>tres cuartos</b> del botín. Corte y póngame su parte; quiero la cifra en dólares.',
  ok:() => Math.abs(cinta6.marcas.m6.v - 0.75) < 1e-9,
  bien:'<b>9.000 dólares.</b> Y salió sin ninguna regla nueva: partir el botín en <b>cuatro</b> partes iguales deja cada una en 3.000, y el jefe se queda con <b>tres</b>. Eso es todo lo que significa «tres cuartos de doce mil».',
  mal:() => cinta6.cortes === 1
    ? T('Corte primero, jefe: sin cortes solo puede señalar el botín entero o nada.')
    : T('Tres cuartos: parta en cuatro y cuente tres.')},

 {t:'Que conste en acta cómo lo ha sacado, que el abogado del jefe es de los que preguntan.',
  ops:[
   {t:'Divido 12.000 entre 4 —salen 3.000— y me quedo con 3 de esas partes: 9.000.', ok:true,
    r:'Así, con todas las letras. Y fíjese en que es lo mismo que ha hecho en la cinta: los cortes parten la unidad, y la marca cuenta trozos. Da igual que la unidad sea un paso, una pulgada o una saca de doce mil.'},
   {t:'Divido 12.000 entre 3 y multiplico por 4.', ok:false,
    r:'Eso da 16.000, jefe: más de lo que había en la saca. Se le han cruzado los papeles — el de abajo es el que parte, el de arriba el que cuenta.'},
   {t:'12.000 entre 4 son 3.000, y esa es su parte.', ok:false,
    r:'3.000 es <b>un</b> cuarto, y él pidió <b>tres</b>. Ha hecho la mitad del trabajo: le falta contar.'},
   {t:'Tres cuartos es 0,75, y 0,75 de 12.000 son 900.', ok:false,
    r:'La coma le ha jugado una mala pasada: 0,75 × 12.000 son 9.000, no 900. Y mire la cinta — su marca está en tres cuartos del botín, no en una perra chica.'}],
  bien:'Partir en cuatro, contar tres. Ni regla nueva ni receta.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'El chivato que dio el aviso reclama <b>un sexto</b> del botín. Póngamelo en la cinta.',
  ok:() => Math.abs(cinta6.marcas.m6.v - 1/6) < 1e-9,
  bien:'<b>2.000 dólares.</b> Seis partes de 2.000 hacen los doce mil, y él se lleva una. Mire de paso dónde ha caído: bastante a la izquierda del cuarto, porque cuantas más partes se hace el botín, más pequeña es cada una.',
  mal:() => cinta6.cortes !== 6
    ? T('En sextos, jefe: pulse el <b>6</b>.')
    : T('Un sexto es <b>una</b> de las seis partes: la primera marca después del cero.')},

 {t:'Ya está: 3/4 para el jefe y 1/6 para el chivato. Quedan dos hombres esperando en el coche. ¿Cuánto hay para ellos?',
  ops:[
   {t:'Nada: con 3/4 y 1/6 ya está repartido todo.', ok:false,
    r:'No llega, jefe. Ponga las dos partes en doceavos —9/12 y 2/12— y verá que suman <b>11/12</b>: falta un doceavo para el botín entero.'},
   {t:'Un doceavo del botín, o sea 1.000 dólares para los dos.', ok:true,
    r:'Mil dólares para dos hombres que se jugaron el cuello. En doceavos se ve de un vistazo: el jefe 9/12, el chivato 2/12, y de los doce que hay solo queda <b>1/12</b>. Con eso y una foto de la nota, esos dos hablan antes del desayuno.'},
   {t:'Un décimo: 3/4 + 1/6 son 4/10, y sobran 6/10.', ok:false,
    r:'Otra vez sumando los de abajo, jefe. Los denominadores no se suman: dicen el tamaño del trozo. En doceavos son 9/12 + 2/12 = 11/12.'},
   {t:'La mitad, porque 3/4 y 1/6 son partes pequeñas.', ok:false,
    r:'Tres cuartos de nada tiene de pequeño: es casi todo el botín. Échele el ojo a la cinta antes de fiarse del tamaño de los números.'}],
  bien:'Un doceavo: 9/12 del jefe, 2/12 del chivato, y de doce queda uno.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso6 = montaExpediente({
  vista:'vCaso6', caso:6, encargos:ENCARGOS6,
  cierre:'<b>Caso cerrado.</b> Los dos del coche cantaron por mil dólares. Y '
    + 'todos los caminos —el reloj, la rueda, la barandilla, la saca— acaban '
    + 'en el mismo sitio: el casino de la calle 9, donde la banca se queda su '
    + 'parte antes de que nadie cuente nada.'
});

/* ═══ EL CASO 7 · LA BANCA ══════════════════════════════════════════
   Tomar una parte DE otra parte es cortar lo ya cortado: la mitad de 4/5 se
   ve partiendo cada quinto en dos —el bote queda en décimos—, y entonces
   4/5 son 8/10 y su mitad, 4/10. La regla de multiplicar numeradores y
   denominadores sale de ahí; sin la cinta es solo una receta. */
const cinta7 = montaCinta({
  esc:'esc7', tira:'tira7', farolas:null, pasos:1, cortes:1,
  botones:'#vCaso7 .b[data-b]', activa:'m7',
  marcas:{ m7:{v:0.5} },
  alCambiar(st){
    const v = st.marcas.m7.v;
    pa7.textContent = st.texto(v); de7.textContent = dec(v);
    const ver = document.getElementById('ver7');
    ver.className = 'veredicto';
    ver.innerHTML = st.cortes > 1
      ? T('El bote en ') + '<b>' + st.cortes + '</b>' + T(' partes: la marca cuenta ') + '<b>'
        + Math.round(v * st.cortes) + '</b>' + T(' de ellas.')
      : T('Corte el bote en partes iguales para poder contar.');
  }
});
const ENCARGOS7 = [
 {t:'Empecemos por el principio de la noche. La banca se queda <b>un quinto</b> del bote antes de repartir nada. Póngame en la cinta <b>lo que sobra</b> para los jugadores.',
  ok:() => cinta7.cortes === 5 && Math.abs(cinta7.marcas.m7.v - 0.8) < 1e-9,
  bien:'<b>4/5.</b> De las cinco partes del bote, la banca se lleva una y quedan cuatro. Hasta aquí, aritmética de cajero.',
  mal:() => cinta7.cortes !== 5
    ? T('En quintos, jefe: pulse el <b>5</b>.')
    : T('Si la banca se queda uno de los cinco, para la mesa quedan cuatro.')},

 {t:'Ahora lo fino. De esos cuatro quintos, el dueño se lleva <b>la mitad</b>. No me lo calcule: <b>párta</b> cada quinto en dos y póngame su parte en la cinta.',
  ok:() => cinta7.cortes === 10 && Math.abs(cinta7.marcas.m7.v - 0.4) < 1e-9,
  bien:'Ahí está, y mire lo que ha hecho: al partir cada quinto en dos, el bote entero se ha quedado en <b>décimos</b>, y los 4/5 pasaron a llamarse <b>8/10</b>. La mitad de ocho décimos son cuatro: <b>4/10</b>. Cortar lo ya cortado — eso es tomar una parte de otra parte.',
  mal:() => cinta7.cortes !== 10
    ? T('Partir cada quinto en dos deja el bote en <b>diez</b> partes: pulse el 10.')
    : T('La mitad de ocho décimos, jefe. Cuente cuatro desde el cero.')},

 {t:'Al abogado del casino le va a faltar tiempo para preguntarme por qué. ¿Cómo se toma la mitad de cuatro quintos?',
  ops:[
   {t:'1/2 × 4/5 = 4/10: se multiplica arriba con arriba y abajo con abajo.', ok:false,
    r:'El número le sale bien, jefe, y la regla es esa: no se la voy a discutir. Pero me ha dado la receta, no el motivo, y en un juicio eso se cae solo. El motivo está en la cinta: partir cada quinto en dos multiplica por 2 el número de trozos del bote —de quintos a décimos— y quedarse con la mitad de ellos deja 4. Por eso se multiplican los de abajo entre sí y los de arriba entre sí.'},
   {t:'Partiendo cada quinto en dos: el bote queda en décimos, los 4/5 pasan a ser 8/10, y la mitad de ocho décimos son cuatro décimos.', ok:true,
    r:'Eso lo firmo yo. Y de regalo se lleva la regla: 4/10 es lo mismo que 2/5, porque la marca no se ha movido de sitio — solo hemos cambiado el corte. Como el 5/4 de la relojería y el 8/16 del taller.'},
   {t:'La mitad de 4/5 es 2/10: se parte por la mitad el de arriba y el de abajo.', ok:false,
    r:'Partiendo los dos números no se parte la cantidad, jefe: 2/10 es 0,2 y la mitad de 4/5 es 0,4. Se ha llevado usted un cuarto en vez de una mitad.'},
   {t:'La mitad no se puede tomar de una fracción, solo de un número entero.', ok:false,
    r:'Acaba usted de tomarla en la cinta hace un minuto. Todo punto de la cinta tiene su mitad, y está justo en medio entre él y el cero.'}],
  bien:'Cortar lo ya cortado: de quintos a décimos.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'En la puerta hay un cartel que dice que la banca se queda «el <b>20 %</b>». Póngame el 20 % del bote en la cinta y dígame si el cartel dice la verdad.',
  ok:() => Math.abs(cinta7.marcas.m7.v - 0.2) < 1e-9,
  bien:'El cartel es verdad, y por eso lo puso: <b>20 % es 20/100</b>, y 20/100 cae exactamente donde <b>1/5</b>. Mismo punto, dos nombres. Un tanto por ciento no es un bicho aparte — es una fracción con cien debajo, y por eso se compara con las demás en la misma cinta.',
  mal:'El 20 % es 20 de cada 100, jefe. Búsquele el nombre corto: ¿en cuántas partes hay que cortar el bote para que 20 de cada 100 sea una de ellas?'},

 {t:'Y para acabar el turno: el cartel de la ruleta promete que paga «<b>tres a dos</b>». ¿Qué le devuelven si apuesta?',
  ops:[
   {t:'Tres de cada cinco fichas de la mesa.', ok:false,
    r:'Eso sería 3/5 y es lo que la casa deja creer. «Tres a dos» compara lo que le dan con lo que puso: tres contra dos, no tres de cinco.'},
   {t:'Por cada 2 fichas apostadas le devuelven 3: le vuelve 3/2 de lo que puso, una vez y media.', ok:true,
    r:'Una vez y media, ni un céntimo más. Y ya lo ha visto usted en la primera calle de esta ciudad: 3/2 pasa del 1, porque con 2/2 ya se hace la unidad y sobra uno. Todo lo que hemos medido esta semana —el reloj, el perno, la barandilla, el agua, la saca— eran puntos de la misma cinta. Cierre la ciudad, jefe.'},
   {t:'Gana 3 y pierde 2, así que se lleva 1 ficha.', ok:false,
    r:'No es una resta, jefe, es una comparación: por cada 2 que pone, 3 que le vuelven.'},
   {t:'Le devuelven 6 fichas: 3 × 2.', ok:false,
    r:'Ojalá. El «a» de «tres a dos» no multiplica: separa lo que le dan de lo que puso.'}],
  bien:'Tres por cada dos: 3/2 de lo apostado, una vez y media.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso7 = montaExpediente({
  vista:'vCaso7', caso:7, encargos:ENCARGOS7,
  cierre:'<b>Caso cerrado.</b> La banca paga una vez y media y se queda un '
    + 'quinto: el negocio cuadra. Pero en su libro hay una columna en rojo con '
    + 'lo que la gente le debe, y el coche del sospechoso ha aparecido esta '
    + 'mañana en el desguace, con la cuenta pendiente.'
});

/* ═══ EL CASO 8 · LA DEUDA ══════════════════════════════════════════
   Los negativos, a lo Wu: −x es el punto ESPEJO de x respecto del 0 —misma
   distancia, otro lado—, y lo que hace que x + (−x) = 0. Con eso, comparar
   sigue siendo mirar quién queda a la izquierda, sumar sigue siendo
   moverse, y doblar una deuda es dar dos pasos hacia la izquierda. La cinta
   arranca en −2 para que el cero caiga en medio y se vea el espejo. */
const cinta8 = montaCinta({
  esc:'esc8', tira:'tira8', farolas:null, pasos:4, desde:-2, cortes:1, rozan:52,
  botones:'#vCaso8 .b[data-b]', activa:'m8s',
  marcas:{ m8c:{v:0.75, nombre:() => '3/4'}, m8s:{v:0, medido:'0'} },
  alCambiar(st){
    const v = st.marcas.m8s.v;
    sa8.textContent = st.texto(v); ds8.textContent = dec(v);
    /* el poste del cero y la franja roja de la deuda, de la marca al cero */
    const t = document.getElementById('tira8'), r = t.getBoundingClientRect();
    const x0 = t.offsetLeft + (0 - st.desde) * r.width / st.pasos;
    const poste = document.getElementById('poste8'), deuda = document.getElementById('deuda8');
    poste.style.left = (x0 - 1.5) + 'px'; poste.style.top = (t.offsetTop - 24) + 'px'; poste.style.height = '86px';
    const xv = t.offsetLeft + (v - st.desde) * r.width / st.pasos;
    deuda.style.top = (t.offsetTop + 44) + 'px';
    deuda.style.left = Math.min(x0, xv) + 'px';
    deuda.style.width = (v < 0 ? x0 - xv : 0) + 'px';
    const ver = document.getElementById('ver8');
    if(Math.abs(v) < 1e-9){
      ver.className = 'veredicto igual';
      ver.textContent = T('Saldo cero: ni tiene ni debe.');
    }else if(v < 0){
      ver.className = 'veredicto';
      ver.innerHTML = '<b>' + st.texto(v) + '</b>' + T(' queda a la izquierda del cero: ')
        + T('debe ') + '<b>' + st.texto(-v) + '</b>' + T(' de fajo.');
    }else{
      ver.className = 'veredicto';
      ver.innerHTML = '<b>' + st.texto(v) + '</b>' + T(' queda a la derecha del cero: ')
        + T('tiene ') + '<b>' + st.texto(v) + '</b>' + T(' de fajo.');
    }
  }
});
const ENCARGOS8 = [
 {t:'El libro de la banca dice que el sospechoso <b>debe tres cuartos</b> de fajo. Póngame su saldo en la cinta. Y piense a qué lado del cero cae una deuda.',
  ok:() => Math.abs(cinta8.marcas.m8s.v + 0.75) < 1e-9,
  bien:'<b>−3/4.</b> Mírelo con la marca verde: son la misma distancia del cero, una a cada lado. −3/4 es el <b>espejo</b> de 3/4. El signo menos no es un adorno: dice de qué lado del cero está el punto.',
  mal:() => cinta8.marcas.m8s.v > 0
    ? T('Eso es tener, jefe, no deber. Las deudas van a la <b>izquierda</b> del cero.')
    : (cinta8.cortes % 4 ? T('Tres cuartos: corte el fajo en cuartos, o en algo que los contenga.')
                         : T('Tres trozos de cuarto a la izquierda del cero. Justo enfrente de la marca verde.'))},

 {t:'En el mismo libro hay otro nombre que debe <b>un medio</b> de fajo. ¿Quién está peor: el que debe 3/4 o el que debe 1/2?',
  ops:[
   {t:'El que debe 3/4: −3/4 queda más a la izquierda que −1/2, y en la cinta el de más a la izquierda es el menor.', ok:true,
    r:'Eso es, y fíjese en que la regla no ha cambiado ni un pelo: más a la izquierda, menor. −3/4 < −1/2. Cuanto más grande la deuda, más pequeño el número. Es lo que tiene deber.'},
   {t:'El que debe 1/2: −1/2 es menor porque 1/2 es menor que 3/4.', ok:false,
    r:'Se le ha dado la vuelta, jefe. En la cinta: −1/2 está a medio fajo del cero y −3/4 a tres cuartos. El −3/4 queda más a la izquierda, así que es el menor. Con los negativos, el que tiene el «tamaño» más grande es el más pequeño.'},
   {t:'Están igual: lo que importa es cuánto se debe, no el signo.', ok:false,
    r:'Cuánto se debe importa, sí, pero no están igual: uno debe más que el otro, y eso en la cinta se ve. Dos puntos distintos, uno más a la izquierda.'},
   {t:'No se pueden comparar deudas con la cinta: la cinta es para lo que se tiene.', ok:false,
    r:'La cinta es para todo número, jefe: por eso la hemos alargado hacia la izquierda del cero. Cada deuda es un punto, y dos puntos siempre se pueden comparar.'}],
  bien:'Más a la izquierda, menor: −3/4 < −1/2.',
  mal:'Elija una de las cuatro, jefe.'},

 {t:'Buenas noticias para él: cobra <b>cinco cuartos</b> de fajo. Desde −3/4, muévale el saldo cinco cuartos y dígame dónde se queda.',
  ok:() => Math.abs(cinta8.marcas.m8s.v - 0.5) < 1e-9,
  bien:'<b>1/2.</b> Sumar sigue siendo moverse hacia la derecha: tres cuartos para llegar al cero —ahí se acaba la deuda— y dos cuartos más. −3/4 + 5/4 = 2/4 = 1/2. Pasar por el cero es lo único nuevo, y no es nada.',
  mal:() => cinta8.marcas.m8s.v < 0
    ? T('Todavía debe, jefe. Cobrar es moverse a la <b>derecha</b>: cinco trozos de cuarto desde −3/4.')
    : T('Cuente bien: desde −3/4, tres cuartos lo llevan al cero, y todavía le quedan dos.')},

 {t:'Cambio de escena: antes del cobro, cuando debía 3/4, la banca le <b>dobló la deuda</b> por retraso. Póngame lo que debía después del castigo.',
  ok:() => Math.abs(cinta8.marcas.m8s.v + 1.5) < 1e-9,
  bien:'<b>−3/2.</b> Doblar es sumar dos veces: −3/4 y otros −3/4, dos pasos de tres cuartos hacia la izquierda. −6/4 = −3/2, que ya está más allá del −1: debía fajo y medio. Doblar un negativo lo aleja del cero por el mismo lado.',
  mal:() => cinta8.marcas.m8s.v >= 0
    ? T('Doblar una deuda sigue siendo deber, jefe: a la izquierda del cero.')
    : T('Dos veces tres cuartos hacia la izquierda. Se pasa del −1.')},

 {t:'Cerremos la ciudad. El sospechoso protesta: «−3/2 es más que 3/2, que tiene los mismos números y encima un signo». ¿Qué son −3/2 y 3/2, el uno del otro?',
  ops:[
   {t:'Opuestos: la misma distancia del cero, uno a cada lado, y juntos hacen 0.', ok:true,
    r:'Eso es, y con eso se cierra la ciudad. Todo número tiene su espejo al otro lado del cero, y un número más su espejo es cero: 3/2 + (−3/2) = 0. Un fajo y medio que se tiene y un fajo y medio que se debe se cancelan. El signo no añade: coloca.'},
   {t:'−3/2 es mayor: tiene los mismos números y además un signo.', ok:false,
    r:'El signo no suma, jefe: coloca. −3/2 está a la izquierda del cero y 3/2 a la derecha, y en esta ciudad el de la izquierda es el menor. Siempre.'},
   {t:'−3/2 es la mitad de 3/2.', ok:false,
    r:'La mitad de 3/2 es 3/4, y está a la derecha del cero. −3/2 está al otro lado: no es una parte de 3/2, es su reflejo.'},
   {t:'No tienen nada que ver: uno es una deuda y el otro un fajo.', ok:false,
    r:'Tienen todo que ver: son el mismo punto visto en el espejo del cero. Juntos hacen cero, y esa es toda su relación.'}],
  bien:'Opuestos: misma distancia del cero, y juntos hacen 0.',
  mal:'Elija una de las cuatro, jefe.'}
];
const caso8 = montaExpediente({
  vista:'vCaso8', caso:8, encargos:ENCARGOS8,
  cierre:'<b>Ciudad cerrada.</b> Ocho expedientes y una sola cinta, que ahora '
    + 'llega hasta donde llegan las deudas. Cada número de esta semana ha sido '
    + 'un punto de una calle: con su sitio, con su nombre, con su espejo al '
    + 'otro lado del cero. Guarde la cinta, Liz. Mañana amanece otra vez sobre '
    + 'la relojería.'
});

/* ═══ EL ACTA ═══════════════════════════════════════════════════════
   Ocho renglones: lo que se averiguó, con sus números, y el principio que lo
   sostiene. Se pinta cada vez que se abre, con lo que haya cerrado. */
const ACTA = [
 {c:1, t:'La cinta', h:'5/4 queda a la derecha de 3/4: el sospechoso pasó de largo. Y 10/8 es el mismo punto que 5/4.',
  p:'Una fracción es un punto de la cinta. El de más a la derecha es el mayor, y un punto puede tener varios nombres según el corte.'},
 {c:2, t:'La llave', h:'5/16 < 3/8 < 1/2: la llave de 3/8 ajusta. En dieciseisavos: 5, 6 y 8.',
  p:'Para comparar, el mismo corte: en la misma sucesión de puntos gana el numerador.'},
 {c:3, t:'Las celdas', h:'1/4 y 3/8 acaban; 5/6 y 1/7 no acaban nunca.',
  p:'Con denominador n solo hay n−1 restos posibles: alguno se repite por fuerza. Acaba si el denominador se hace solo con doses y cincos.'},
 {c:4, t:'La barandilla', h:'10/3 = 3 + 1/3: faltaba un tercio por tramo, un metro en total.',
  p:'Una fracción es una división. 10 = 3·3 + 1 dice entre qué enteros cae.'},
 {c:5, t:'El nivel', h:'1/2 + 1/8 = 5/8; 1/2 + 1/3 + 1/4 = 13/12, más que el dique.',
  p:'Sumar es juntar tramos: solo se cuentan juntos los trozos del mismo tamaño.'},
 {c:6, t:'El reparto', h:'3/4 de 12.000 son 9.000; 3/4 + 1/6 = 11/12, y queda 1/12.',
  p:'Fracción de una cantidad: la cantidad es la unidad; se corta y se cuenta.'},
 {c:7, t:'La banca', h:'La mitad de 4/5 es 4/10 = 2/5; el 20 % es 1/5; «tres a dos» es 3/2.',
  p:'Parte de otra parte: cortar lo ya cortado. Un tanto por ciento es una fracción con cien debajo.'},
 {c:8, t:'La deuda', h:'−3/4 es el espejo de 3/4; −3/4 < −1/2; −3/4 + 5/4 = 1/2.',
  p:'−x es el opuesto de x: misma distancia del cero, al otro lado, y x + (−x) = 0.'}
];
function pintaActa(){
  const ol = document.getElementById('actaLista'); ol.innerHTML = '';
  ACTA.forEach(a => {
    const li = document.createElement('li'), cerrado = resueltos.has(a.c);
    li.className = cerrado ? '' : 'pendiente';
    li.innerHTML = '<span class="n">' + a.c + '</span><div><div class="tit">' + T(a.t) + '</div>'
      + '<div class="hecho">' + (cerrado ? T(a.h) : T('— sin cerrar —')) + '</div>'
      + '<div class="porque">' + T(a.p) + '</div></div>'
      + '<span class="cerrado">' + T('CERRADO') + '</span>';
    ol.appendChild(li);
  });
}
document.getElementById('verActa').addEventListener('click', () => { pintaActa(); vista('vActa'); });
document.getElementById('imprimeActa').addEventListener('click', () => print());

