/* ═══ EL SONIDO ═════════════════════════════════════════════════════
   Cuatro ruidos de despacho, sintetizados en el momento —ni un archivo—:
   la tecla de la máquina, el obturador de Liz, el golpe del sello y la
   chincheta al clavarse; y dos avisos, uno claro para el acierto y uno
   sordo para el fallo. Todo son ráfagas de ruido filtrado y algún seno
   corto: lo justo para que la ciudad suene a oficina de noche y no a
   videojuego. El contexto de audio se crea en el primer toque (los
   navegadores no dejan sonar nada antes), y el botón del plano lo apaga.
   Sin él, ningún sonido: nada se cae si no hay WebAudio. */
const Ruido = (() => {
  let ctx = null, buf = null, on = true;
  function ac(){
    if(ctx) return ctx;
    try{ ctx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; }
    buf = ctx.createBuffer(1, ctx.sampleRate * .3, ctx.sampleRate);
    const d = buf.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  /* una ráfaga de ruido: frecuencia del filtro, duración y volumen */
  function rafaga(f, dur, vol, q, t){
    const c = ac(); if(!c) return;
    const src = c.createBufferSource(); src.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || 1.2;
    const g = c.createGain(); const t0 = c.currentTime + (t || 0);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    src.connect(fl); fl.connect(g); g.connect(c.destination); src.start(t0); src.stop(t0 + dur + .02);
  }
  function tono(f, dur, vol, tipo, t){
    const c = ac(); if(!c) return;
    const o = c.createOscillator(); o.type = tipo || 'sine'; o.frequency.value = f;
    const g = c.createGain(); const t0 = c.currentTime + (t || 0);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + .02);
  }
  const R = {
    get on(){ return on; }, set on(v){ on = v; if(v) ac(); },
    despierta(){ if(on){ const c = ac(); if(c && c.state === 'suspended') c.resume(); } },
    tecla(){ if(on) rafaga(2600 + Math.random() * 800, .04, .12, 2); },
    retorno(){ if(on){ rafaga(1200, .08, .1, 1); tono(1800, .12, .05, 'triangle', .02); } },
    obturador(){ if(on){ rafaga(1800, .05, .2, 1.5); rafaga(900, .07, .18, 1.5, .09); } },
    sello(){ if(on){ tono(85, .16, .5); rafaga(300, .12, .35, .8); } },
    chincheta(){ if(on){ rafaga(3200, .03, .1, 3); tono(1400, .05, .04, 'triangle'); } },
    bien(){ if(on){ tono(659, .18, .12, 'triangle'); tono(988, .26, .1, 'triangle', .11); } },
    mal(){ if(on){ tono(140, .22, .16, 'square'); } }
  };
  return R;
})();
{
  const b = document.getElementById('sonido');
  const pinta = () => { b.textContent = Ruido.on ? T('Sonido: sí') : T('Sonido: no');
                        b.setAttribute('aria-pressed', String(Ruido.on)); };
  b.addEventListener('click', () => { Ruido.on = !Ruido.on; Ruido.despierta(); pinta(); guardaTurno(); });
  pinta();
  /* el primer toque de cualquier cosa despierta el audio */
  document.addEventListener('pointerdown', () => Ruido.despierta(), {once:true});
}

