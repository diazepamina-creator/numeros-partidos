/* ── EL MAPA Y LAS CARPETAS ─────────────────────────────────────────── */
const caja = document.getElementById('caso');
const ABRE = {
  1(){ caso1.abre(); vista('vCaso1'); cinta1.repinta(); },
  2(){ caso2.abre(); vista('vCaso2'); cinta2.repinta(); },
  3(){ caso3.abre(); vista('vCaso3'); div3.arranca(1, 4); },
  4(){ caso4.abre(); vista('vCaso4'); cinta4.repinta(); },
  5(){ caso5.abre(); vista('vCaso5'); cinta5.repinta(); },
  6(){ caso6.abre(); vista('vCaso6'); cinta6.repinta(); },
  7(){ caso7.abre(); vista('vCaso7'); cinta7.repinta(); },
  8(){ caso8.abre(); vista('vCaso8'); cinta8.repinta(); },
  9(){ caso9.abre(); vista('vCaso9'); cinta9.repinta(); }
};
document.querySelectorAll('.chincheta').forEach(b => b.addEventListener('click', () => {
  abierto = +b.dataset.c;
  const c = CASOS[abierto];
  document.getElementById('cTit').textContent = T(c.t);
  document.getElementById('cCual').textContent = T(c.s);
  document.getElementById('cTxt').textContent = T(c.x);
  const puede = MONTADOS.has(abierto) && !b.classList.contains('cerrado');
  document.getElementById('cAbrir').disabled = !puede;
  document.getElementById('cAbrir').textContent = puede
    ? T(resueltos.has(abierto) ? 'Repasar el caso' : 'Abrir el caso')
    : T('Aún no está montado');
  caja.classList.add('abierto');
  Ruido.chincheta();
  if(!quieto()) setTimeout(Ruido.sello, 430);
  guardaTurno();
}));
document.getElementById('cCerrar').addEventListener('click', () => caja.classList.remove('abierto'));
document.getElementById('cAbrir').addEventListener('click', () => {
  if(!MONTADOS.has(abierto)) return;
  caja.classList.remove('abierto');
  fogonazo();
  ABRE[abierto]();
});
document.querySelectorAll('.volver').forEach(b =>
  b.addEventListener('click', () => { pintaMapa(); vista('vMapa'); }));

/* ── EL INTERRUPTOR DE LA LENGUA. Cambia el diccionario, vuelve a pintar
   los estáticos y repinta todo lo que estuviera en pantalla: cintas,
   pizarra, encargos abiertos, plano. ── */
document.getElementById('lengua').addEventListener('click', () => {
  idioma = idioma === 'es' ? 'va' : 'es';
  const b = document.getElementById('lengua');
  b.textContent = idioma === 'es' ? 'Valencià' : 'Castellano'; b.lang = idioma === 'es' ? 'ca' : 'es';
  traduce();
  [cinta1, cinta2, cinta4, cinta5, cinta6, cinta7, cinta8, cinta9].forEach(c => c.repinta());
  div3.repinta();
  [caso1, caso2, caso3, caso4, caso5, caso6, caso7, caso8, caso9].forEach(c => c.repinta());
  const so = document.getElementById('sonido');
  so.textContent = Ruido.on ? T('Sonido: sí') : T('Sonido: no');
  pintaMapa(); pintaActa(); pintaCero(); guardaTurno();
  if(document.getElementById('caso').classList.contains('abierto'))
    document.querySelector('.chincheta[data-c="' + abierto + '"]').click();
});

/* ── EMPEZAR DE CERO. Vive en la barra del plano, que es el vestíbulo de la
      ciudad, y solo asoma cuando hay algo que borrar. Borra a la SEGUNDA
      pulsación —el gesto de la terminal—, y se desarma solo a los cinco
      segundos: son ocho expedientes, no se tiran de un dedazo. ── */
let pintaCero = () => {};
{
  const ce = document.getElementById('cero');
  let armado = false, reloj = 0;
  const desarma = () => { armado = false; clearTimeout(reloj);
                          ce.classList.remove('armado'); pintaCero(); };
  pintaCero = () => {
    ce.hidden = resueltos.size === 0 && !armado;
    ce.textContent = T(armado ? 'Pulsa otra vez para borrarlo' : 'Empezar de cero');
  };
  ce.addEventListener('click', () => {
    if(!armado){
      armado = true; ce.classList.add('armado'); pintaCero();
      clearTimeout(reloj); reloj = setTimeout(desarma, 5000);
      return;
    }
    /* se recarga, como en la terminal: la ciudad queda igual que recién
       abierta y no a medio camino, con medio expediente en memoria. */
    desarma(); borraTurno(); location.reload();
  });
}

/* ── LA APERTURA. Si el aparato guarda un turno de hace menos de cuatro
      horas, la ciudad se abre con sus casos cerrados, su hilo rojo tendido
      y sus ajustes puestos. Se entra por el PLANO, que es donde se entra
      siempre: los expedientes se abren desde su chincheta. ── */
EXPS = {1:caso1, 2:caso2, 3:caso3, 4:caso4, 5:caso5, 6:caso6, 7:caso7, 8:caso8, 9:caso9};
{
  const d = leeTurno();
  if(d){
    d.resueltos.forEach(c => { if(ORDEN.includes(c)) resueltos.add(c); });
    if(ORDEN.includes(d.abierto)) abierto = d.abierto;
    if(d.casos) Object.entries(d.casos).forEach(([k, v]) => EXPS[k] && EXPS[k].carga(v));
    if(d.sonido === false) Ruido.on = false;
    if(d.idioma === 'va'){
      idioma = 'va';
      const b = document.getElementById('lengua');
      b.textContent = 'Castellano'; b.lang = 'es';
    }
  }
  const so = document.getElementById('sonido');
  so.textContent = Ruido.on ? T('Sonido: sí') : T('Sonido: no');
  so.setAttribute('aria-pressed', String(Ruido.on));
}

traduce();
[cinta1, cinta2, cinta4, cinta5, cinta6, cinta7, cinta8, cinta9].forEach(c => c.repinta());
[caso1, caso2, caso3, caso4, caso5, caso6, caso7, caso8, caso9].forEach(c => c.repinta());
pintaMapa(); pintaCero();


/* el sumario plegado se despliega al tocarlo */
document.querySelectorAll('.sumario').forEach(s => s.addEventListener('click', () => {
  if(s.classList.contains('plegado')) s.classList.toggle('desplegado');
}));
