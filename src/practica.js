/* ══════════════════════════════════════════════════════════════════════
   PRACTICAR · encargos nuevos de cada pestaña, sin fin
   Una sola cinta, que cada encargo monta a su medida: cuántos pasos tiene,
   desde dónde empieza, en cuánto se puede cortar, si lleva la prueba verde
   de Liz y adónde tiene que ir la marca roja. Algunos encargos se contestan
   además (o solo) eligiendo una respuesta.
   Lo de siempre en la ciudad, y más aquí: el nombre de la marca roja y la
   lectura no se ven hasta comprobar. Si no, bastaría con mover la marca
   hasta que el rótulo dijera lo que pide Jeff.
   No cuenta para la ruta; sí va al acta.
   ══════════════════════════════════════════════════════════════════════ */

/* ── LA VISTA ── */
const prSt = montaCinta({
  esc: 'escP', tira: 'tiraP', farolas: null, pasos: 2, desde: 0, cortes: 1, rozan: 52,
  botones: '#vPractica .nada', activa: 'pMarca',
  marcas: {pPrueba: {v: 0.5}, pMarca: {v: 0}},
  alCambiar(st){
    const m = st.marcas.pMarca, P = prEnc && prEnc.prueba;
    const l = document.getElementById('prLec');
    l.innerHTML = (P ? '<span>' + T('Prueba: ') + '<b>' + P.nombre + '</b> = <b>' + dec(P.v) + '</b></span>' : '')
      + '<span>' + T('Tu marca: ') + '<b>' + st.texto(m.v) + '</b> = <b>' + dec(m.v) + '</b></span>';
    pintaTejas(st);
  }
});
/* la prueba lleva el nombre con que la firmó Liz */
prSt.marcas.pPrueba.nombre = () => prEnc && prEnc.prueba ? prEnc.prueba.nombre : '';
let prEnc = null, prElegida = null, prHecho = false, prN = 0, prBien = 0;
/* el tipo de encargo que pide un enlace: mientras no se cambie de pestaña,
   «Otro encargo» da otro de ese tipo */
let prTipo = null;
/* dividir: la tela (la verde) sobre la cinta, y la pieza (la roja) copiada
   desde el cero una detrás de otra, como en la sastrería */
function pintaTejas(st){
  const si = !!(prEnc && prEnc.tejas), tela = document.getElementById('telaP'), tj = document.getElementById('tejasP');
  tela.hidden = tj.hidden = !si; tj.innerHTML = '';
  if(!si) return;
  const t = document.getElementById('tiraP'), an = t.getBoundingClientRect().width, x0 = t.offsetLeft;
  const px = x => x0 + (x - st.desde) * an / st.pasos, T0 = prEnc.prueba.v, p = st.marcas.pMarca.v;
  tela.style.left = px(0) + 'px'; tela.style.width = (px(T0) - px(0)) + 'px'; tela.style.top = tj.style.top = (t.offsetTop - 14) + 'px';
  if(p <= 1e-9) return;
  const n = Math.floor(T0 / p + 1e-9);
  for(let k = 0; k < Math.min(n, 48); k++){
    const d = document.createElement('div'); d.className = 'teja' + (k % 2 ? ' par' : '');
    d.style.left = px(k * p) + 'px'; d.style.width = (px((k + 1) * p) - px(k * p)) + 'px'; tj.appendChild(d);
  }
  if(T0 - n * p > 1e-9){
    const d = document.createElement('div'); d.className = 'teja sobra';
    d.style.left = px(n * p) + 'px'; d.style.width = (px(T0) - px(n * p)) + 'px'; tj.appendChild(d);
  }
}
const vP = document.getElementById('vPractica');
/* cualquier cambio en la cinta vuelve a esconder la lectura */
document.getElementById('escP').addEventListener('pointerdown', () => { if(!prHecho) vP.classList.remove('visto'); });

function pintaCortes(){
  const c = document.getElementById('prCortes');
  c.innerHTML = '<span class="etq">' + T('cortar el paso en') + '</span>' + prEnc.cortes.map(k =>
    '<button type="button" class="b" data-k="' + k + '" aria-pressed="' + (prSt.cortes === k) + '">' + k + '</button>').join('');
}
document.getElementById('prCortes').addEventListener('click', ev => {
  const b = ev.target.closest('button[data-k]'); if(!b || prHecho) return;
  prSt.cortes = +b.dataset.k; vP.classList.remove('visto'); pintaCortes(); prSt.repinta();
});
function pintaOps(){
  const caja = document.getElementById('prOps');
  caja.hidden = !prEnc.ops; caja.innerHTML = '';
  (prEnc.ops || []).forEach((o, i) => {
    const b = document.createElement('button'); b.className = 'op'; b.textContent = T(o.t);
    b.setAttribute('aria-pressed', String(prElegida === i));
    b.addEventListener('click', () => { if(prHecho) return; prElegida = i; vP.classList.remove('visto'); pintaOps(); });
    caja.appendChild(b);
  });
}
/* un encargo nuevo: el que se dé (el de un enlace) o uno de la pestaña */
function nuevoPr(dado){
  prEnc = dado || PR.genera(pestana, prTipo); prElegida = null; prHecho = false; prN = Date.now();
  vP.classList.remove('visto');
  document.getElementById('prSub').textContent = T(NOMBRE_PES[pestana].split(' · ')[0]) + ' · ' + T(PR.TIPOS[prEnc.tipo].nombre);
  document.getElementById('prTxt').innerHTML = T(prEnc.t);
  document.getElementById('prInf').hidden = true;
  document.getElementById('prComprueba').textContent = T('Comprobar');
  document.getElementById('prOtro').hidden = false;
  document.getElementById('prCuenta').textContent = prBien ? prBien + T(' bien en este rato') : '';
  document.getElementById('prMesa').hidden = !!prEnc.sinCinta;
  pintaOps();
  if(!prEnc.sinCinta){
    prSt.pasos = prEnc.pasos; prSt.desde = prEnc.desde; prSt.cortes = 1;
    prSt.marcas.pMarca.v = prEnc.desde < 0 ? 0 : prEnc.desde; prSt.marcas.pMarca.medido = null;
    document.getElementById('pPrueba').hidden = !prEnc.prueba;
    prSt.marcas.pPrueba.v = prEnc.prueba ? prEnc.prueba.v : 0;
    document.getElementById('prPista').innerHTML = T(prEnc.pista);
    pintaCortes();
    requestAnimationFrame(() => prSt.repinta());
  }
}
document.getElementById('prComprueba').addEventListener('click', () => {
  if(prHecho){ nuevoPr(); return; }
  const e = prEnc;
  if(e.ops && prElegida === null){
    document.getElementById('prInf').hidden = false; document.getElementById('prInfTxt').innerHTML = T('Elija una respuesta, jefe.'); return;
  }
  const enSitio = e.meta === undefined || e.meta === null || Math.abs(prSt.marcas.pMarca.v - e.meta) < 1e-9;
  const op = e.ops ? e.ops[prElegida] : null, bien = enSitio && (!op || op.ok);
  let dice;
  if(bien) dice = T(e.bien);
  else if(!enSitio) dice = T(e.mal);
  else dice = T(op.r);
  vP.classList.add('visto');
  const inf = document.getElementById('prInf'); inf.hidden = false;
  inf.className = 'informe'; requestAnimationFrame(() => { inf.className = 'informe nueva' + (bien ? '' : ' mal'); });
  document.getElementById('prInfTxt').innerHTML = dice;
  bien ? Ruido.bien() : Ruido.mal();
  if(typeof anotaActa === 'function') anotaActa('p:' + e.tipo, prN, bien, op && !op.ok ? op.t : null, e.c);
  if(bien){
    prHecho = true; prBien++;
    if(op) vP.querySelectorAll('#prOps .op')[prElegida].classList.add('buena');
    document.getElementById('prComprueba').textContent = T('Otro encargo →');
    document.getElementById('prOtro').hidden = true;
  }else if(op && !op.ok) vP.querySelectorAll('#prOps .op')[prElegida].classList.add('fallada');
});
document.getElementById('prOtro').addEventListener('click', nuevoPr);

/* ── EL BOTÓN DE LA CABECERA: entra y sale de Practicar, en la pestaña en
   que se esté. Las pestañas, mientras tanto, cambian de tipo de encargo. ── */
const NOMBRE_PES = {cinta: 'La cinta · situar y comparar', partir: 'Partir · la fracción es una división',
  juntar: 'Juntar y quitar · sumar y restar', partes: 'Multiplicar y dividir · partes de partes y cuántas caben'};
let enPractica = false;
function practicar(si, dado){
  enPractica = si;
  document.getElementById('bPracticar').setAttribute('aria-pressed', String(si));
  document.getElementById('caso').classList.remove('abierto');
  if(si){ ajustes(false); vista('vPractica'); nuevoPr(dado); }
  else{ prTipo = null; if(vP.classList.contains('puesta')){ pintaMapa(); vista('vMapa'); } }
}
document.getElementById('bPracticar').addEventListener('click', () => practicar(!enPractica));
vP.querySelector('.volver').addEventListener('click', () => practicar(false));
{ const antes = ponPestana; ponPestana = function(id){ if(enPractica && PESTANAS[id]){ pestana = id; prTipo = null;
    try{ localStorage.setItem('ciudad.pestana', id); }catch(err){} pintaRuta(); nuevoPr(); } else antes(id); }; }
/* abrir un caso desde el plano saca de Practicar */
document.getElementById('cAbrir').addEventListener('click', () => { if(enPractica){ enPractica = false; document.getElementById('bPracticar').setAttribute('aria-pressed', 'false'); } });

/* ── EL ENLACE: ?j=practicar&m=<tipo>&c=<datos> abre Practicar con ese
   encargo (los códigos, en encargos.js y en el README). Sin m, Practicar
   en la pestaña de siempre. ── */
if(enlacePr){
  const e = enlacePr.m ? PR.deEnlace(enlacePr.m, enlacePr.c) : null;
  if(e){ pestana = PR.TIPOS[e.tipo].pes; prTipo = e.tipo; pintaRuta(); }
  practicar(true, e);
}
