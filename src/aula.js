/* ── EL MODO AULA ───────────────────────────────────────────────────────
   Se guarda en su propia llave del almacén, aparte del turno, para no tocar
   el guardado de la app. La rejilla —cuando la hay— se monta envolviendo lo
   que ya existe; fuera del modo aula los envoltorios son display:contents y
   la página se lee en fila, como siempre.                                 */
(function(){
  const LLAVE = 'aula.v1';
  const el = s => document.querySelector(s);
  const IZQ = [], DER = [];
  if(IZQ.length && DER.length){
    const primero = el(IZQ[0]);
    if(primero){
      const rej = document.createElement('div'); rej.className = 'aulaRejilla';
      const izq = document.createElement('div'); izq.className = 'colIzq';
      const der = document.createElement('div'); der.className = 'colDer';
      primero.parentNode.insertBefore(rej, primero);
      rej.appendChild(izq); rej.appendChild(der);
      IZQ.forEach(s => { const e = el(s); if(e) izq.appendChild(e); });
      DER.forEach(s => { const e = el(s); if(e) der.appendChild(e); });
    }
  }
  const b = document.createElement('button');
  b.id = 'bAula'; b.type = 'button'; b.className = 'b'; b.setAttribute('aria-pressed', 'false');
  const donde = el('.barra');
  if(donde) donde.appendChild(b);
  const pinta = () => {
    const si = document.documentElement.dataset.aula === 'si';
    document.body.dataset.aula = si ? 'si' : 'no';
    b.setAttribute('aria-pressed', String(si));
    b.textContent = si ? 'Salir del aula' : 'Aula';
  };
  b.addEventListener('click', () => {
    const si = document.documentElement.dataset.aula !== 'si';
    document.documentElement.dataset.aula = si ? 'si' : 'no';
    try{ localStorage.setItem(LLAVE, si ? 'si' : 'no'); }catch(e){}
    pinta();
  });
  try{ document.documentElement.dataset.aula = localStorage.getItem(LLAVE) === 'si' ? 'si' : 'no'; }catch(e){}
  pinta();
})();
