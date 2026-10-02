# Los números partidos · la ciudad

Números racionales en la recta para 1.º y 2.º de ESO, en una ciudad de novela negra. Un manipulativo de una sola página para el aula, publicado con GitHub Pages, en el formato de *Las piezas de Miut*.

**La cinta.** Una fracción es un punto de la calle: se corta el paso en partes iguales y se cuenta. Comparar es ver cuál queda más a la derecha, y 10/8 y 5/4 son la misma marca con otro nombre. Jeff Azzo hace los encargos y Liz Stillo tiende la cinta y mide.

## Las pestañas

Son los contenidos; cada una tiene sus casos en el plano y su ruta debajo:

- **La cinta** — situar y comparar: casos 1 (la escena) y 2 (el taller), y la misión de **la pizzería de Nick**, que es La grapadora de Nick: la equivalencia se trabaja allí, con pizza, y la ciudad lee de ese mismo aparato si ya está hecha.
- **Partir** — la fracción es una división: casos 3 (las celdas: exacto o periódico) y 4 (la barandilla).
- **Juntar y quitar** — sumar y restar: casos 5 (el pantano) y 8 (la deuda, a la izquierda del cero).
- **Partes de partes** — la fracción de una cantidad: casos 6 (el reparto) y 7 (el casino).

Se abren por enlace: `?j=cinta|partir|juntar|partes`.

## Ficheros

La app es **un solo `index.html`**: se genera con `node construye.mjs` a partir de `src/`. Se edita `src/`, no `index.html`.

- `src/pagina.html` — la cabecera, los ajustes, el plano, los ocho expedientes, el acta y el pie.
- `src/estilo.css` — el plano, las escenas, la cinta y los expedientes. `src/piel.css` — el formato de Miut: el corcho (claro) y el asfalto de noche (oscuro), la cabecera, las pestañas, las hojas, los ajustes y el pie.
- `src/ciudad.js` — la cinta, los expedientes y los ocho casos. `src/plano.js` — el plano y las carpetas, la lengua, empezar de cero y la apertura. `src/pestanas.js` — las pestañas, la ruta, la misión de la pizzería y los ajustes. `src/acta.js` — el acta del turno y la guía. `src/encargos.js` — los generadores de Practicar (sin pantalla); `src/practica.js` — su vista. `src/valenciano.js` — el diccionario. `src/sonido.js` — los ruidos del despacho, sintetizados. `src/aula.js` — el modo aula.
- `pruebas/` — `node --test pruebas/*.test.mjs`: que `index.html` esté construido y que los encargos de Practicar se puedan resolver.

## Historial

1. ✅ Versiones 0.1 a 0.7: el plano, los ocho casos, el valenciano, el modo papel, el acta de conclusiones y la pizzería en el plano.
2. ✅ Versión 0.8: el formato de Las piezas de Miut. La app pasa a `src/` con `construye.mjs`. Dos temas, elegidos por Andrés: claro, el corcho del detective con Special Elite; oscuro, el asfalto mojado de noche con Bebas Neue; el texto en IBM Plex Sans. La cabecera con Ajustes · Aula · Acta y las cuatro pestañas por contenidos, con su ruta bajo el plano (también para el móvil). La pizzería pasa a ser una misión de La cinta que abre La grapadora de Nick y se marca cumplida al terminar su ruta de Servir. El plano cabe entero en la pantalla, también en el aula. Ajustes: tema, animaciones, lengua, sonido y empezar de cero. Y el pie.

3. ✅ Versión 0.9: la Guía y el acta de verdad. La Guía pone un foco sobre cada parte (las pestañas, el plano, la ruta, los ajustes, el aula y el acta) y se abre sola la primera vez. El acta apunta cada intento: el nombre, el tiempo, los casos cerrados, los encargos resueltos (y cuántos a la primera), los fallos y el porcentaje de acierto; caso a caso, y encargo a encargo con lo que se contestó mal en los interrogatorios. Se copia o se descarga en .txt, caduca con el turno y la borra «Empezar de cero». Las ocho conclusiones de la semana siguen a un botón, dentro del acta.

4. ✅ Versión 0.10: Practicar y el veredicto, después. Practicar da encargos nuevos sin fin de la pestaña en que se esté, dos tipos por pestaña —situar una fracción y comparar con la prueba de Liz; repartir metros en tramos y ¿exacto o periódico?; sumar en el dique y restar en la banca, también por debajo del cero; la fracción de una cantidad y la parte de una parte—, con una sola cinta que cambia de tamaño, de cortes y de marcas. No cuentan para la ruta; sí van al acta. En Practicar, el nombre de la marca roja y la lectura no se ven hasta comprobar; en los casos, el veredicto de la cinta tampoco (mover la marca o cortar otra vez lo esconde hasta que se vuelve a comprobar). Y los casos, más compactos: el título junto a «← La ciudad» y el sumario plegado cuando ya se ha leído, para que la cinta quepa en la pantalla de un portátil.

© 2026 Andrés Asensio · [CC BY-NC-ND 4.0](LICENSE.md)
