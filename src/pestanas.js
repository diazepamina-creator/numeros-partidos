/* ══════════════════════════════════════════════════════════════════════
   LAS PESTAÑAS, LOS AJUSTES Y LA MISIÓN DE LA PIZZERÍA
   El formato de Las piezas de Miut sobre la ciudad. Las pestañas son los
   contenidos, y cada una tiene sus casos en el plano:
     La cinta          situar y comparar          casos 1 y 2, y la pizzería
     Partir            la fracción es una división casos 3 y 4
     Juntar y quitar   sumar y restar              casos 5 y 8
     Partes de partes  la fracción de una cantidad casos 6 y 7
   En el plano, lo que no es de la pestaña queda en segundo plano; debajo,
   su ruta. La pizzería es una misión más de La cinta: la equivalencia se
   trabaja con pizza en La grapadora de Nick, y como las dos apps viven en el
   mismo sitio, la ciudad lee de ahí si ya está hecha.
   ══════════════════════════════════════════════════════════════════════ */
const PESTANAS = {
  cinta:  {casos: [1, 2], pizzeria: true},
  partir: {casos: [3, 4]},
  juntar: {casos: [5, 8]},
  partes: {casos: [6, 7]}
};
const GRAPADORA = 'https://diazepamina-creator.github.io/grapadora-de-nick/';
let pestana = 'cinta';
try{ const p = localStorage.getItem('ciudad.pestana'); if(PESTANAS[p]) pestana = p; }catch(err){}

/* La pizzería, hecha: la ruta de Servir de La grapadora (5 pedidos), en
   este mismo aparato. Si no hay nada guardado, sigue pendiente. */
function pizzeriaHecha(){
  try{
    const d = JSON.parse(localStorage.getItem('grapadora.turno.v1') || 'null');
    return !!(d && d.stats && d.stats.servir && d.stats.servir.ruta >= 5);
  }catch(err){ return false; }
}

function pintaRuta(){
  const P = PESTANAS[pestana], r = document.getElementById('rutaPes');
  document.querySelectorAll('.juegos button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === pestana)));
  document.querySelectorAll('.mapa .chincheta').forEach(b => b.classList.toggle('fuera', !P.casos.includes(+b.dataset.c)));
  const vec = document.querySelector('.mapa .vecina');
  vec.classList.toggle('fuera', !P.pizzeria);
  vec.classList.toggle('resuelto', pizzeriaHecha());
  let h = '<div class="tit">' + T('Los casos de esta pestaña') + '</div>';
  P.casos.forEach(c => {
    const hecho = resueltos.has(c);
    h += '<button type="button" data-c="' + c + '"' + (hecho ? ' class="hecho"' : '') + '><span class="n">' + c + '</span>'
      + '<span><b>' + T(CASOS[c].t) + '</b></span><small>' + T(hecho ? 'cerrado' : CASOS[c].s.replace(/^Caso \d+ · /, '')) + '</small></button>';
  });
  if(P.pizzeria){
    const hecha = pizzeriaHecha();
    h += '<a class="vec' + (hecha ? ' hecho' : '') + '" href="' + GRAPADORA + '" target="_blank" rel="noopener"><span class="n">¾</span>'
      + '<span><b>' + T('La pizzería de Nick') + '</b></span><small>' + T(hecha ? 'cumplida' : 'equivalentes, en La grapadora') + '</small></a>';
  }
  r.innerHTML = h;
}
document.getElementById('rutaPes').addEventListener('click', ev => {
  const b = ev.target.closest('button[data-c]');
  if(b) document.querySelector('.chincheta[data-c="' + b.dataset.c + '"]').click();
});
function ponPestana(id){
  if(!PESTANAS[id]) return;
  pestana = id;
  try{ localStorage.setItem('ciudad.pestana', id); }catch(err){}
  document.getElementById('caso').classList.remove('abierto');
  if(!document.getElementById('vMapa').classList.contains('puesta')) vista('vMapa');
  pintaMapa();
}
document.querySelector('.juegos').addEventListener('click', ev => {
  const b = ev.target.closest('button[data-tab]'); if(b) ponPestana(b.dataset.tab);
});
/* el plano se repinta al cerrar un caso o cambiar de lengua: la ruta, con él */
{ const antes = pintaMapa; pintaMapa = function(){ antes(); pintaRuta(); }; }
/* al volver de La grapadora, por si se ha cumplido la pizzería */
addEventListener('focus', () => { if(document.getElementById('vMapa').classList.contains('puesta')) pintaRuta(); });

/* ── EL ACTA, desde la cabecera ── */
document.getElementById('verActa').addEventListener('click', () => ajustes(false));

/* ── LOS AJUSTES: el tema (claro, el corcho; oscuro, el asfalto) y las
   animaciones. Se guardan en este aparato y no caducan. La lengua, el
   sonido y empezar de cero son los de siempre, ahora aquí dentro. ── */
const AJUSTES = 'ciudad.ajustes.v1';
const aj = {tema: 'papel', mov: 'si'};
try{ Object.assign(aj, JSON.parse(localStorage.getItem(AJUSTES) || '{}')); }catch(err){}
function aplicaAjustes(){
  document.body.dataset.modo = aj.tema === 'pantalla' ? 'pantalla' : 'papel';
  document.body.dataset.quieto = aj.mov === 'no' ? 'si' : 'no';
  document.querySelectorAll('#ajTema button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === aj.tema)));
  document.querySelectorAll('#ajMov button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === aj.mov)));
  /* el coche del plano anda con SMIL, que no hace caso al CSS: se le para a mano */
  const plano = document.querySelector('#mapa svg[aria-label]');
  if(plano) quieto() ? plano.pauseAnimations() : plano.unpauseAnimations();
  [cinta1, cinta2, cinta4, cinta5, cinta6, cinta7, cinta8].forEach(c => c.repinta());
  div3.repinta();
}
function guardaAjustes(){ try{ localStorage.setItem(AJUSTES, JSON.stringify(aj)); }catch(err){} }
document.getElementById('ajTema').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if(!b) return; aj.tema = b.dataset.v; guardaAjustes(); aplicaAjustes();
});
document.getElementById('ajMov').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if(!b) return; aj.mov = b.dataset.v; guardaAjustes(); aplicaAjustes();
});
function ajustes(si){
  document.getElementById('ajustes').hidden = !si;
  document.getElementById('bAjustes').setAttribute('aria-pressed', String(si));
  if(si){ pintaCero(); document.getElementById('cero').hidden = false; }
}
document.getElementById('bAjustes').addEventListener('click', () => ajustes(document.getElementById('ajustes').hidden));
document.getElementById('ajCierra').addEventListener('click', () => ajustes(false));
aplicaAjustes();

/* ── UN ENLACE: ?j=cinta|partir|juntar|partes abre esa pestaña (los QR de
   las fichas). La dirección se limpia. ── */
let vieneDeEnlace = false;
try{
  const q = new URLSearchParams(location.search);
  if(q.get('j')){ vieneDeEnlace = true; if(PESTANAS[q.get('j')]) pestana = q.get('j'); history.replaceState(null, '', location.pathname); }
}catch(err){}
pintaRuta();
