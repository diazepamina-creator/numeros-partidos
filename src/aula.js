/* ── EL MODO AULA ───────────────────────────────────────────────────────
   Para la pizarra digital: todo un tercio más grande (piel.css). Se guarda
   en su propia llave del almacén, aparte del turno, y no caduca. El botón
   es el «Aula» de la cabecera.                                            */
(function(){
  const LLAVE = 'aula.v1';
  const b = document.getElementById('bAula');
  const pinta = () => {
    const si = document.documentElement.dataset.aula === 'si';
    document.body.dataset.aula = si ? 'si' : 'no';
    b.setAttribute('aria-pressed', String(si));
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
