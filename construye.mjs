/* Funde la página en un solo index.html, como las demás apps: cada hoja de
   estilos y cada módulo van dentro. Se edita src/, no index.html. La versión va en el fichero VERSION.
     node construye.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(fileURLToPath(import.meta.url));
export function construye(){
  let h = readFileSync(join(raiz, 'src', 'pagina.html'), 'utf8');
  const lee = f => readFileSync(join(raiz, f), 'utf8').trim();
  h = h.replace(/<link rel="stylesheet" href="(src\/[^"]+\.css)">/g, (_, f) => '<style>\n' + lee(f) + '\n</style>');
  h = h.replace(/<script src="(src\/[^"]+\.js)"><\/script>/g, (_, f) => '<script>\n' + lee(f) + '\n</script>');
  /* la versión sale de un solo sitio: el fichero VERSION */
  h = h.replaceAll('{{versión}}', lee('VERSION'));
  h = h.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<!-- Generado por construye.mjs a partir de src/: edita src/pagina.html y los módulos, no este fichero. -->');
  return h;
}
if(process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const h = construye();
  writeFileSync(join(raiz, 'index.html'), h);
  console.log('index.html: ' + h.length + ' caracteres, ' + h.split('\n').length + ' líneas');
}
