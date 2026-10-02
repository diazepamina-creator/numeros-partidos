/* ══════════════════════════════════════════════════════════════════════
   EL ACTA Y LA GUÍA
   El acta de verdad, como en las demás apps: el nombre, el tiempo, los
   aciertos y los fallos, caso a caso y encargo a encargo, para entregársela
   al profesor. Se guarda en este aparato y caduca con el turno (cuatro
   horas); «Empezar de cero» la borra. Las ocho conclusiones de la semana
   —la hoja mecanografiada de siempre— siguen ahí, a un botón del acta.
   La guía: un foco que recorre cada parte de la ciudad con una nota; se
   abre sola la primera vez.
   ══════════════════════════════════════════════════════════════════════ */
const LLAVE_ACTA = 'ciudad.acta.v1';
let acta = {t0: Date.now(), ts: Date.now(), nombre: '', ej: []};
try{
  const d = JSON.parse(localStorage.getItem(LLAVE_ACTA) || 'null');
  if(d && Array.isArray(d.ej) && Date.now() - d.ts < CADUCA) acta = d;
}catch(err){}
const guardaActa = () => { acta.ts = Date.now(); try{ localStorage.setItem(LLAVE_ACTA, JSON.stringify(acta)); }catch(err){} };

/* Un intento en un encargo. Los intentos seguidos al mismo encargo van al
   mismo renglón: los fallos se cuentan, y el acierto lo cierra. */
function anotaActa(caso, enc, bien, dicho){
  let e = acta.ej[acta.ej.length - 1];
  if(!e || e.c !== caso || e.e !== enc || e.ok){
    e = {t: Date.now(), c: caso, e: enc, fallos: 0, ok: false, d: []};
    acta.ej.push(e);
    if(acta.ej.length > 400) acta.ej.shift();
  }
  if(bien) e.ok = true; else e.fallos++;
  if(dicho && !bien) e.d.push(dicho);
  guardaActa();
}

/* de qué es cada renglón: un encargo de un caso, o uno de Practicar ('p:cinta'…) */
const esPr = e => typeof e.c === 'string';
const nombreEj = e => esPr(e) ? T('Practicar') + ' · ' + T(NOMBRE_PES[e.c.slice(2)].split(' · ')[0]) : T(CASOS[e.c].t);
const etqEj = e => esPr(e) ? T('Practicar') : T('Caso ') + e.c + ' · ' + (e.e + 1);
const dos = x => String(x).padStart(2, '0');
const hora = ms => { const f = new Date(ms); return dos(f.getHours()) + ':' + dos(f.getMinutes()); };
const reloj = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ' min ' + dos(s % 60) + ' s'; };
const comoFue = e => e.ok
  ? (e.fallos ? T('bien tras ') + e.fallos + T(e.fallos === 1 ? ' fallo' : ' fallos') : T('bien a la primera'))
  : T('sin resolver') + (e.fallos ? ' (' + e.fallos + T(e.fallos === 1 ? ' fallo' : ' fallos') + ')' : '');
function cuentas(){
  const bien = acta.ej.filter(e => e.ok).length, primera = acta.ej.filter(e => e.ok && !e.fallos).length;
  const fallos = acta.ej.reduce((a, e) => a + e.fallos, 0);
  return {bien, primera, fallos, acierto: bien + fallos ? Math.round(100 * bien / (bien + fallos)) : 0};
}
const $a = id => document.getElementById(id);
function pintaActaM(){
  const k = cuentas(), dato = (n, v) => '<div><span class="etq">' + T(n) + '</span><b>' + v + '</b></div>';
  $a('acDatos').innerHTML = dato('Casos cerrados', resueltos.size + ' / ' + ORDEN.length) + dato('Encargos', k.bien)
    + dato('A la primera', k.primera) + dato('Fallos', k.fallos) + dato('Acierto', k.acierto + '%')
    + dato('Tiempo', reloj(Date.now() - acta.t0).replace(' min ', ':').replace(' s', ''));
  $a('acFilas').innerHTML = ORDEN.map(c => {
    const x = EXPS[c], mios = acta.ej.filter(e => e.c === c), f = mios.reduce((a, e) => a + e.fallos, 0);
    return '<tr' + (f > x.hechos() && f > 1 ? ' class="floja"' : '') + '><td><b>' + c + '.</b> ' + T(CASOS[c].t) + '</td><td>'
      + x.hechos() + T(' de ') + x.total + (resueltos.has(c) ? ' · ' + T('cerrado') : '') + '</td><td>' + f + '</td></tr>';
  }).join('') + '<tr><td><b>¾</b> ' + T('La pizzería de Nick') + '</td><td>' + T(pizzeriaHecha() ? 'cumplida' : 'pendiente') + '</td><td>—</td></tr>'
    + (() => { const p = acta.ej.filter(esPr); if(!p.length) return '';
      return '<tr><td><b>+</b> ' + T('Practicar') + '</td><td>' + p.filter(e => e.ok).length + T(' bien') + '</td><td>' + p.reduce((a, e) => a + e.fallos, 0) + '</td></tr>'; })();
  $a('acDet').hidden = !acta.ej.length;
  $a('acDet').querySelector('summary').textContent = T('Encargo a encargo') + ' (' + acta.ej.length + ')';
  $a('acEj').innerHTML = acta.ej.map(e => '<li class="' + (e.ok ? 'ok' : 'no') + '"><span class="ac-h">' + hora(e.t) + '</span>'
    + '<span class="ac-m">' + etqEj(e) + '</span><span class="ac-c">' + nombreEj(e) + '</span>'
    + '<span class="ac-como">' + comoFue(e) + (e.d.length ? ' — «' + e.d.map(T).join('», «') + '»' : '') + '</span></li>').join('');
  $a('acNombre').value = acta.nombre || '';
}
function actaEnTexto(){
  const k = cuentas(), f = new Date();
  let t = T('LA CIUDAD · acta del turno') + '\n';
  t += T('Nombre: ') + (acta.nombre || T('(sin nombre)')) + '\n';
  t += T('Fecha: ') + dos(f.getDate()) + '/' + dos(f.getMonth() + 1) + '/' + f.getFullYear() + '  ' + hora(+f) + '\n';
  t += T('Tiempo: ') + reloj(Date.now() - acta.t0) + '\n';
  t += T('Casos cerrados: ') + resueltos.size + ' / ' + ORDEN.length + '   ' + T('Encargos resueltos: ') + k.bien + ' (' + k.primera + T(' a la primera') + ')   '
    + T('Fallos: ') + k.fallos + '   ' + T('Acierto: ') + k.acierto + '%\n';
  t += T('Por caso:') + '\n';
  ORDEN.forEach(c => { const x = EXPS[c], f2 = acta.ej.filter(e => e.c === c).reduce((a, e) => a + e.fallos, 0);
    t += '  ' + c + '. ' + T(CASOS[c].t) + ' — ' + x.hechos() + T(' de ') + x.total + (resueltos.has(c) ? ', ' + T('cerrado') : '') + '; ' + T('fallos: ') + f2 + '\n'; });
  t += '  ¾. ' + T('La pizzería de Nick') + ' — ' + T(pizzeriaHecha() ? 'cumplida' : 'pendiente') + '\n';
  { const p = acta.ej.filter(esPr); if(p.length) t += '  +. ' + T('Practicar') + ' — ' + p.filter(e => e.ok).length + T(' bien') + '; ' + T('fallos: ') + p.reduce((a, e) => a + e.fallos, 0) + '\n'; }
  if(acta.ej.length){
    t += T('Encargo a encargo:') + '\n';
    acta.ej.forEach(e => { t += '  ' + hora(e.t) + '  ' + (esPr(e) ? nombreEj(e) : etqEj(e)) + '  ' + comoFue(e)
      + (e.d.length ? ' — «' + e.d.map(T).join('», «') + '»' : '') + '\n'; });
  }
  return t;
}
function abreActa(){
  ajustes(false);
  $a('acMsg').textContent = '';
  pintaActaM();
  $a('mActa').hidden = false;
  $a('verActa').setAttribute('aria-pressed', 'true');
  $a('mActa').querySelector('.caja2').focus();
}
function cierraActa(){ $a('mActa').hidden = true; $a('verActa').setAttribute('aria-pressed', 'false'); $a('verActa').focus(); }
/* la cabecera abre el acta; la hoja de las conclusiones, desde dentro */
{
  const viejo = $a('verActa'), nuevo = viejo.cloneNode(true);   // fuera el manejador de antes
  viejo.replaceWith(nuevo);
  nuevo.addEventListener('click', abreActa);
}
$a('acCierra').addEventListener('click', cierraActa);
$a('mActa').addEventListener('click', ev => { if(ev.target.id === 'mActa') cierraActa(); });
addEventListener('keydown', ev => { if(ev.key === 'Escape' && !$a('mActa').hidden) cierraActa(); });
$a('acNombre').addEventListener('input', () => { acta.nombre = $a('acNombre').value.trim(); guardaActa(); });
$a('acConclusiones').addEventListener('click', () => { cierraActa(); pintaActa(); vista('vActa'); });
$a('acCopia').addEventListener('click', async () => {
  try{ await navigator.clipboard.writeText(actaEnTexto()); $a('acMsg').textContent = T('Copiada. Pégala donde te diga tu profesor.'); }
  catch(err){ $a('acMsg').textContent = T('No se ha podido copiar: descárgala.'); }
});
$a('acBaja').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([actaEnTexto()], {type: 'text/plain;charset=utf-8'}));
  a.download = 'acta-ciudad' + (acta.nombre ? '-' + acta.nombre.replace(/\s+/g, '-').toLowerCase() : '') + '.txt';
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $a('acMsg').textContent = T('Descargada.');
});

/* ── LA GUÍA ── */
const GUIA = [
  {sel: '.juegos', c: 'Los contenidos', t: '<b>La cinta</b>: situar y comparar. <b>Partir</b>: la fracción es una división. <b>Juntar y quitar</b>: sumar y restar. <b>Partes de partes</b>: la fracción de una cantidad. Cada pestaña tiene sus casos.'},
  {sel: '#mapa', c: 'El plano', t: 'Cada chincheta es un <b>caso</b>. Tócala para abrir su carpeta. Los casos de la pestaña se ven encendidos; al cerrarlos, el <b>hilo rojo</b> los va uniendo.'},
  {sel: '#rutaPes', c: 'La ruta', t: 'Los casos de esta pestaña, en orden. En La cinta está también <b>la pizzería de Nick</b>: las fracciones equivalentes se trabajan allí, con pizza.'},
  {sel: '#bPracticar', c: 'Practicar', t: 'Encargos <b>nuevos cada vez</b>, de la pestaña en que estés, sin fin. No cuentan para la ruta, pero sí van al acta. El nombre de tu marca no se ve hasta que compruebas.'},
  {sel: '#bAjustes', c: 'Ajustes', t: 'El corcho (claro) o el asfalto de noche (oscuro), las animaciones, el <b>valenciano</b>, el sonido y empezar de cero.'},
  {sel: '#bAula', c: 'El aula', t: 'Todo más grande, para la pizarra digital.'},
  {sel: '#verActa', c: 'El acta', t: 'Lo que has hecho en el turno, caso a caso y encargo a encargo, para <b>entregárselo a tu profesor</b>. Jeff le espera en la escena del crimen.'}
];
let guiaI = -1, guiaParadas = [], guiaRetoque = 0;
const seVe = e => !!(e && e.offsetParent !== null && e.getBoundingClientRect().height > 0);
function cierraGuia(){
  $a('guia').hidden = true; guiaI = -1; clearTimeout(guiaRetoque);
  $a('bGuia').setAttribute('aria-pressed', 'false');
  try{ localStorage.setItem('ciudad.guia', 'vista'); }catch(err){}
  $a('bGuia').focus();
}
function vaGuia(i){
  if(i >= guiaParadas.length) return cierraGuia();
  guiaI = i;
  const g = guiaParadas[i], e = document.querySelector(g.sel);
  if(!seVe(e)) return vaGuia(i + 1);
  $a('guiaTit').textContent = T(g.c); $a('guiaTxt').innerHTML = T(g.t);
  $a('guiaNum').textContent = (i + 1) + T(' de ') + guiaParadas.length;
  $a('guiaSig').textContent = T(i === guiaParadas.length - 1 ? 'Al caso' : 'Siguiente');
  $a('guia').hidden = false;
  e.scrollIntoView({block: 'center', behavior: 'instant'});
  colocaGuia(); requestAnimationFrame(() => requestAnimationFrame(colocaGuia));
  clearTimeout(guiaRetoque); guiaRetoque = setTimeout(colocaGuia, 180);
}
function colocaGuia(){
  const g = guiaParadas[guiaI]; if(!g || $a('guia').hidden) return;
  const e = document.querySelector(g.sel); if(!seVe(e)) return;
  const r = e.getBoundingClientRect(), m = 7, f = $a('guiaFoco'), gl = $a('guiaGlobo');
  /* lo que no cabe en la pantalla (el plano en el móvil) se recorta al borde */
  const top = Math.max(4, r.top - m), bot = Math.min(innerHeight - 4, r.bottom + m);
  f.style.top = top + 'px'; f.style.left = (r.left - m) + 'px'; f.style.width = (r.width + 2 * m) + 'px'; f.style.height = (bot - top) + 'px';
  const alto = gl.offsetHeight || 180, ancho = gl.offsetWidth || 320;
  const abajo = bot + 12, arriba = top - 12 - alto;
  gl.style.top = (abajo + alto < innerHeight - 8 ? abajo : arriba > 8 ? arriba : Math.max(8, innerHeight - alto - 8)) + 'px';
  gl.style.left = Math.min(Math.max(12, r.left + r.width / 2 - ancho / 2), innerWidth - ancho - 12) + 'px';
}
function abreGuia(){
  ajustes(false);
  if(!$a('mActa').hidden) cierraActa();
  document.getElementById('caso').classList.remove('abierto');
  if(!document.getElementById('vMapa').classList.contains('puesta')){ pintaMapa(); vista('vMapa'); }
  $a('bGuia').setAttribute('aria-pressed', 'true');
  guiaParadas = GUIA.filter(g => seVe(document.querySelector(g.sel))); vaGuia(0); $a('guiaGlobo').focus();
}
$a('bGuia').addEventListener('click', abreGuia);
$a('guiaSig').addEventListener('click', ev => { ev.stopPropagation(); vaGuia(guiaI + 1); });
$a('guiaSalir').addEventListener('click', ev => { ev.stopPropagation(); cierraGuia(); });
$a('guiaGlobo').addEventListener('click', ev => ev.stopPropagation());
$a('guia').addEventListener('click', () => vaGuia(guiaI + 1));
addEventListener('keydown', ev => { if($a('guia').hidden) return; ev.stopPropagation();
  if(ev.key === 'Escape') cierraGuia(); else if(ev.key === 'ArrowRight' || ev.key === 'Enter'){ ev.preventDefault(); vaGuia(guiaI + 1); } }, true);
addEventListener('scroll', colocaGuia, {passive: true});
addEventListener('resize', colocaGuia);
/* la primera vez, sola; no si se llega por un enlace de las fichas */
{
  let primera = false;
  try{ primera = localStorage.getItem('ciudad.guia') !== 'vista'; }catch(err){}
  if(primera && !vieneDeEnlace) setTimeout(abreGuia, 600);
}
