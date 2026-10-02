# Los números partidos · la ciudad

Números racionales en la recta para 1.º y 2.º de ESO, en una ciudad de novela negra. Un manipulativo de una sola página para el aula, publicado con GitHub Pages, en el formato de *Las piezas de Miut*.

**La cinta.** Una fracción es un punto de la calle: se corta el paso en partes iguales y se cuenta. Comparar es ver cuál queda más a la derecha, y 10/8 y 5/4 son la misma marca con otro nombre. Jeff Azzo hace los encargos y Liz Stillo tiende la cinta y mide.

## Las pestañas

Son los contenidos; cada una tiene sus casos en el plano y su ruta debajo:

- **La cinta** — situar y comparar: casos 1 (la escena) y 2 (el taller), y la misión de **la pizzería de Nick**, que es La grapadora de Nick: la equivalencia se trabaja allí, con pizza, y la ciudad lee de ese mismo aparato si ya está hecha.
- **Partir** — la fracción es una división: casos 3 (las celdas: exacto o periódico) y 4 (la barandilla).
- **Juntar y quitar** — sumar y restar: casos 5 (el pantano) y 8 (la deuda, a la izquierda del cero).
- **Multiplicar y dividir** — partes de partes y cuántas caben: casos 6 (el reparto), 7 (el casino) y 9 (la sastrería: dividir fracciones).

Se abren por enlace: `?j=cinta|partir|juntar|partes`.

## Practicar y sus enlaces

Practicar da encargos nuevos sin fin de la pestaña en que se esté: nueve tipos, dos o tres por pestaña. Cada encargo se puede abrir por enlace, para ponerlo como QR en una ficha:

`?j=practicar&m=<tipo>&c=<datos>`

Las fracciones se escriben `n/d` (un entero, sin barra; un negativo, con `-`), y si hay dos datos, se separan con `_`. Sin `c` (o con unos datos que no caben en la cinta), sale uno al azar de ese tipo; sin `m`, Practicar en la pestaña de siempre. Después del primero, «Otro encargo» sigue dando encargos del mismo tipo hasta que se cambia de pestaña.

| Pestaña | Tipo (`m`) | Datos (`c`) | Ejemplo |
|---|---|---|---|
| La cinta | `situar` | la fracción | `?j=practicar&m=situar&c=5/4` — la marca en 5/4 |
| La cinta | `comparar` | la prueba _ la marca | `?j=practicar&m=comparar&c=3/4_9/5` — ¿9/5 pasó de largo de 3/4? |
| Partir | `repartir` | metros _ tramos | `?j=practicar&m=repartir&c=10_3` — 10 metros en 3 tramos |
| Partir | `decimal` | la fracción | `?j=practicar&m=decimal&c=5/6` — ¿exacto o periódico? |
| Juntar y quitar | `sumar` | lo que había _ lo que sube | `?j=practicar&m=sumar&c=1/4_7/8` — 1/4 + 7/8 |
| Juntar y quitar | `restar` | lo que tiene _ lo que paga | `?j=practicar&m=restar&c=1/2_7/4` — 1/2 − 7/4, por debajo del cero |
| Multiplicar y dividir | `cantidad` | dólares _ la fracción | `?j=practicar&m=cantidad&c=12000_3/4` — 3/4 de 12 000 $ |
| Multiplicar y dividir | `partes` | la primera parte _ la parte de esa | `?j=practicar&m=partes&c=2/3_1/2` — 1/2 de 2/3 |
| Multiplicar y dividir | `dividir` | la tela _ la pieza | `?j=practicar&m=dividir&c=3/4_1/8` — 3/4 : 1/8 |
| Multiplicar y dividir | `combinadas` | la cuenta, con `s` (+), `r` (−), `m` (·) y `d` (:) | `?j=practicar&m=combinadas&c=(1/2s1/4)m2/3` — (1/2 + 1/4) · 2/3 |

**Sin cinta.** Con `&papel` al final (por ejemplo, `?j=practicar&m=sumar&c=1/4_7/8&papel`), o con el botón «Sin cinta» de Practicar, lo que se hace en la cinta se contesta sobre el papel: se escribe la cuenta y el resultado. Sumar, restar, repartir, la fracción de una cantidad, la parte de una parte y dividir se escriben siempre; comparar y ¿exacto o periódico? se eligen sin mover marcas; situar no tiene sentido sin cinta y no sale. Al acertar, la cinta aparece por si se quiere comprobar. Las combinadas son siempre sobre el papel: la cuenta viene dada y se escribe el resultado.

Las cuentas se escriben como en la libreta: `3/4 + 1/8`, `2 · 3/5` (también con `*` o `x`), `3/4 : 1/8`, `(1/2 + 1/4) · 2/3`, `0,5 − 1/3`. Una fracción escrita junta va antes que nada: `2 : 3/4` es 2 entre tres cuartos. La cuenta tiene que ser **la del encargo**: sus números (o equivalentes, sin simplificar: 10/12 por 5/6) y su operación. Sumar y multiplicar no tienen orden; restar y dividir, sí (1/3 − 5/6 no es 5/6 − 1/3), y dividir entre una fracción es lo mismo que multiplicar por la vuelta (3/2 : 1/4 o 3/2 · 4). Una cuenta con otros números que dé lo mismo no vale: Liz contesta «Eso da lo mismo, pero no son los números del encargo» y pregunta por ellos. El resultado no hace falta simplificarlo, y 12.000 se lee como doce mil.

Lo que cabe: la marca tiene que caer en un corte de los botones (en 2, 3, 4, 5, 6, 8, 9, 10 o 12); en `sumar` y `restar`, el común denominador también; en `restar`, la cinta va de −2 a 2; en `partes`, los dos denominadores multiplicados son uno de esos cortes. En el acta, cada resolución de Practicar sale con su tipo y su código, y el resumen va tipo a tipo, aparte de los casos.

## La ruta de 1.º

Con `?ruta=1eso` (también junto a los demás enlaces: `?j=cinta&ruta=1eso`, `?j=practicar&m=…&c=…&ruta=1eso`), la ciudad deja a la vista solo lo de 1.º, en el orden de la historia: los casos 1, 2, 4, 5, 6, 7 y 9. Quedan fuera el caso 3 (las celdas: decimales periódicos) y el 8 (la deuda: los negativos), que no se ven en el plano ni en las rutas de las pestañas y no cuentan para cerrar la ciudad: con los siete, se cierra. En Practicar no salen los periódicos, y al restar no se baja del cero (la cinta empieza en 0). La cabecera dice «Ruta de 1.º ESO» y el acta lo apunta. La ruta se mantiene mientras el parámetro esté en la dirección; sin él, la app sigue como siempre, para 2.º.

### Los QR de las fichas de 1.º

Una propuesta de encargos de Practicar para las fichas de 1.º, de dos en dos o de tres en tres por pestaña, de menos a más. Todos llevan `&ruta=1eso`, así que «Otro encargo» sigue en 1.º.

| Pestaña | Encargo | Enlace del QR |
|---|---|---|
| La cinta | Situar 3/4 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=situar&c=3/4&ruta=1eso` |
| La cinta | Situar 5/4 (más de un paso) | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=situar&c=5/4&ruta=1eso` |
| La cinta | Comparar 3/5 con la prueba 2/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=comparar&c=2/3_3/5&ruta=1eso` |
| La cinta | Comparar 5/6 con la prueba 3/4 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=comparar&c=3/4_5/6&ruta=1eso` |
| Partir | Repartir 7 metros en 4 tramos | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=repartir&c=7_4&ruta=1eso` |
| Partir | Repartir 10 metros en 3 tramos | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=repartir&c=10_3&ruta=1eso` |
| Juntar y quitar | Sumar 1/2 + 1/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=sumar&c=1/2_1/3&ruta=1eso` |
| Juntar y quitar | Sumar 3/4 + 5/8 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=sumar&c=3/4_5/8&ruta=1eso` |
| Juntar y quitar | Restar 5/4 − 1/2 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=restar&c=5/4_1/2&ruta=1eso` |
| Juntar y quitar | Restar 5/6 − 1/3, sin cinta | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=restar&c=5/6_1/3&papel&ruta=1eso` |
| Multiplicar y dividir | 3/4 de 12 000 $ | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=cantidad&c=12000_3/4&ruta=1eso` |
| Multiplicar y dividir | 2/3 de 600 $ | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=cantidad&c=600_2/3&ruta=1eso` |
| Multiplicar y dividir | 1/2 de 2/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=partes&c=2/3_1/2&ruta=1eso` |
| Multiplicar y dividir | 2/3 de 3/4 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=partes&c=3/4_2/3&ruta=1eso` |
| Multiplicar y dividir | 3/4 : 1/8 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=dividir&c=3/4_1/8&ruta=1eso` |
| Multiplicar y dividir | 2 : 1/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=dividir&c=2_1/3&ruta=1eso` |
| Multiplicar y dividir | 3/2 : 1/4, sin cinta | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=dividir&c=3/2_1/4&papel&ruta=1eso` |
| Multiplicar y dividir | 1/2 + 1/4 · 2/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=combinadas&c=1/2s1/4m2/3&ruta=1eso` |
| Multiplicar y dividir | (1/2 + 1/4) · 2/3 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=combinadas&c=(1/2s1/4)m2/3&ruta=1eso` |
| Multiplicar y dividir | 3/4 − 1/2 : 2 | `https://diazepamina-creator.github.io/numeros-partidos/?j=practicar&m=combinadas&c=3/4r1/2d2&ruta=1eso` |

Para abrir una pestaña entera de 1.º: `https://diazepamina-creator.github.io/numeros-partidos/?j=cinta&ruta=1eso` (o `partir`, `juntar`, `partes`).

## Ficheros

La app es **un solo `index.html`**: se genera con `node construye.mjs` a partir de `src/`. Se edita `src/`, no `index.html`.

- `src/pagina.html` — la cabecera, los ajustes, el plano, los nueve expedientes, Practicar, el acta y el pie.
- `src/estilo.css` — el plano, las escenas, la cinta y los expedientes. `src/piel.css` — el formato de Miut: el corcho (claro) y el asfalto de noche (oscuro), la cabecera, las pestañas, las hojas, los ajustes y el pie.
- `src/ciudad.js` — la cinta, los expedientes y los nueve casos. `src/plano.js` — el plano y las carpetas, la lengua, empezar de cero y la apertura. `src/pestanas.js` — las pestañas, la ruta, la misión de la pizzería y los ajustes. `src/acta.js` — el acta del turno y la guía. `src/encargos.js` — los generadores de Practicar (sin pantalla); `src/practica.js` — su vista. `src/valenciano.js` — el diccionario. `src/sonido.js` — los ruidos del despacho, sintetizados. `src/aula.js` — el modo aula.
- `pruebas/` — `node --test pruebas/*.test.mjs`: que `index.html` esté construido y que los encargos de Practicar se puedan resolver y que sus códigos (también los de este README) se abran.

## Historial

1. ✅ Versiones 0.1 a 0.7: el plano, los ocho casos, el valenciano, el modo papel, el acta de conclusiones y la pizzería en el plano.
2. ✅ Versión 0.8: el formato de Las piezas de Miut. La app pasa a `src/` con `construye.mjs`. Dos temas, elegidos por Andrés: claro, el corcho del detective con Special Elite; oscuro, el asfalto mojado de noche con Bebas Neue; el texto en IBM Plex Sans. La cabecera con Ajustes · Aula · Acta y las cuatro pestañas por contenidos, con su ruta bajo el plano (también para el móvil). La pizzería pasa a ser una misión de La cinta que abre La grapadora de Nick y se marca cumplida al terminar su ruta de Servir. El plano cabe entero en la pantalla, también en el aula. Ajustes: tema, animaciones, lengua, sonido y empezar de cero. Y el pie.

3. ✅ Versión 0.9: la Guía y el acta de verdad. La Guía pone un foco sobre cada parte (las pestañas, el plano, la ruta, los ajustes, el aula y el acta) y se abre sola la primera vez. El acta apunta cada intento: el nombre, el tiempo, los casos cerrados, los encargos resueltos (y cuántos a la primera), los fallos y el porcentaje de acierto; caso a caso, y encargo a encargo con lo que se contestó mal en los interrogatorios. Se copia o se descarga en .txt, caduca con el turno y la borra «Empezar de cero». Las ocho conclusiones de la semana siguen a un botón, dentro del acta.

4. ✅ Versión 0.10: Practicar y el veredicto, después. Practicar da encargos nuevos sin fin de la pestaña en que se esté, dos tipos por pestaña —situar una fracción y comparar con la prueba de Liz; repartir metros en tramos y ¿exacto o periódico?; sumar en el dique y restar en la banca, también por debajo del cero; la fracción de una cantidad y la parte de una parte—, con una sola cinta que cambia de tamaño, de cortes y de marcas. No cuentan para la ruta; sí van al acta. En Practicar, el nombre de la marca roja y la lectura no se ven hasta comprobar; en los casos, el veredicto de la cinta tampoco (mover la marca o cortar otra vez lo esconde hasta que se vuelve a comprobar). Y los casos, más compactos: el título junto a «← La ciudad» y el sumario plegado cuando ya se ha leído, para que la cinta quepa en la pantalla de un portátil.
5. ✅ Versión 0.11: dividir fracciones. El caso 9, la sastrería de la calle 2 (entre el casino y el desguace en la historia; en la pestaña de Partes de partes, que pasa a llamarse **Multiplicar y dividir**). Dividir es medir: ¿cuántas veces cabe la pieza (roja) en la tela (verde)? Desde el cero, la pieza se copia una detrás de otra hasta donde llega la tela, y la que no cabe entera sale rayada. Siete encargos: repartir 3/4 entre 3 corbatas (y ver que el cuarto cabe tres veces); 3/4 : 1/8 = 6 con el mismo corte; 2 : 1/3 = 6, que da más de 2; el interrogatorio de «dividir siempre da menos»; 3/4 : 1/2, que cabe una vez y sobra media pieza; ¿cuántas solapas salen? (3/2, no 1/4 ni 3/8), y la regla de multiplicar por el inverso, que sale de lo visto en la libreta de Liz, con las respuestas falsas de verdad: arriba entre arriba sin el mismo corte, darle la vuelta al dividendo y «dividir siempre da menos». Su conclusión entra en el acta de la semana, y en el sumario plegado ya no queda un hueco.

6. ✅ Versión 0.12: Practicar, tipo a tipo y por enlace. Nueve tipos de encargo generado —situar, comparar, repartir, ¿exacto o periódico?, sumar, restar, la fracción de una cantidad, la parte de una parte y, nuevo, dividir, con la tela y las piezas de la sastrería—, y cada uno se abre por enlace con sus datos (`?j=practicar&m=<tipo>&c=<datos>`, arriba) para ponerlo como QR en las fichas. El veredicto sigue sin verse hasta comprobar. En el acta, cada resolución de Practicar va con su tipo y su código, y el resumen, tipo a tipo y aparte de los casos.
7. ✅ Versión 0.13: sobre el papel. Los casos de operaciones (5, 6, 7 y 9) acaban con un encargo en el que se escribe la cuenta y se resuelve sin tocar la cinta, que está escondida hasta que sale bien; después se puede comprobar en ella, si se quiere: el nivel del martes (2/3 + 1/4 − 1/6), lo que cobra el abogado (1/3 · 3/4 · 12 000), lo que se lleva el dueño en la otra mesa (2/5 · 3/4) y los pañuelos del sastre (3 : 3/4). Liz distingue la cuenta que no es la del encargo del resultado mal sacado. En Practicar, el modo **sin cinta** (`&papel` en los enlaces) y un tipo nuevo, **las operaciones combinadas**, con paréntesis: la réplica señala si se han hecho en el orden en que se leen o saltándose el paréntesis, y la buena va paso a paso.
8. ✅ Versión 0.14: la ruta de 1.º. Con `?ruta=1eso`, solo lo de 1.º y en orden: fuera el caso 3 (periódicos) y el 8 (la deuda, negativos), que no se ven en el plano ni cuentan para cerrar la ciudad (con siete casos, se cierra); en Practicar, sin periódicos y sin bajar del cero al restar. La cabecera y el acta dicen en qué ruta se está, y la dirección conserva el parámetro. Sin él, la ciudad entera, como siempre, para 2.º. Y en el README, la tabla de los QR de Practicar para las fichas de 1.º.
9. ✅ Versión 0.15: la cuenta, con sus números. Sobre el papel, la cuenta ya no vale solo por lo que da: tiene que llevar los números del encargo (o equivalentes) y su operación, con el orden de la resta y la división; dividir entre una fracción vale también escrito como multiplicar por la vuelta. Si da lo mismo con otros números, Liz lo dice y pregunta por los del encargo. Vale en Practicar sin cinta y en los encargos finales de los casos 5, 6, 7 y 9. Sin cinta, dividir y la fracción de una cantidad se escriben (con cinta, dividir sigue siendo de elegir). En el móvil, la cinta va antes que las respuestas y «Comprobar», en Practicar y en los casos; en el portátil y en el aula, como estaba. Y el botón del modo dice a qué se pasa («Con cinta» cuando se está sin ella), con aria-pressed y el subtítulo diciendo el modo.

© 2026 Andrés Asensio · [CC BY-NC-ND 4.0](LICENSE.md)
