Entrega 2.3 - Funcionalidades en Tiempo Real

## Objetivos

Esta tercera y última entrega busca abordar la implementación de funcionalidades en tiempo real en la aplicación móvil, utilizando WebSockets, Action Cable y React Native. A su vez, planteará los requisitos finales con los cuales darle cierre a la visión del proyecto, logrando entonces una aplicación funcional, a espera de afinar aquellos detalles que se consideren necesarios.

## Conjunto de Características a Desarrollar

Se solicita implementar a continuación las siguientes características específicas del proyecto:

1. [0.5] Implementar la sección _Feed_, la cual muestra en tiempo real la actividad de amistades y bares en los que el usuario haya escrito algo. Las publicaciones se ordenan desde la más reciente a la más antigua.
2. [2.0] Cuando una amistad publique algo en un evento, la publicación debe aparecer en tiempo real en el feed del usuario. Al presionar en la publicación, se debe dirigir al usuario a la vista del evento.
3. [2.0] Cuando una amistad evalúe una cerveza, se debe mostrar en el _Feed_ la puntuación, la cerveza y la amistad que hizo la evaluación. Al presionar en la publicación, se debe dirigir al usuario a la vista del bar.
4. [1.0] El _Feed_ debe contar con una opción para filtrar publicaciones, permitiendo elegir entre filtrar por alguna amistad, un bar, un país o una cerveza.
5. [0.5] La conexión al servidor de websockets debe estar autentificada, por ningún motivo se puede permitir que un usuario no autentificado pueda acceder a la información en tiempo real.

## Implementación de la Funcionalidad

**Requisito 1**
El _Feed_ sería la típica vista de redes sociales, donde a medida que los usuarios publican cosas, estas se van colocando una sobre otra en la vista de la aplicación. El desafío de esta vista es mantener consistencia entre la primera carga (donde el usuario no cuenta con publicaciones en su _Feed_) y las actualizaciones que van llegando como eventos una detrás de la otra. Sugiero no mantener la información de las publicaciones en el estado de un componente, pues estos requieren estar montados en la aplicación para almacenar información, sin embargo, podemos no estar en la vista _Feed_, y seguir recibiendo publicaciones. Tengan en consideración estas cosas al diseñar esta vista, y que se debe poder scrollear hacia abajo para ver publicaciones anteriores, dado que a medida que aparecen cosas nuevas, las viejas irán bajando más y más, alargando el tamaño del contenedor.

Para efectos de esta aplicación, el flujo de contenido será fácilmente manejable en memoria, sin embargo, a medida que las aplicaciones crecen, este tipo de implementacioens requieren manejar la memoria de forma más eficiente, por ejemplo, eliminando publicaciones antiguas que ya no se visualizan, lo que resulta en la implementación de un sistema de _caché_. No pertenece al alcance del proyecto esto, pero les dejo la inquietud para ser conscientes de como las aplicaciones evolucionan para flujos más grandes de contenido. Algo parecido pasa con las conexiones a los websockets, ¿necesito tener a mi usuario conectado todo el tiempo?, ¿será mejor desconectarlo cuando no esté en la vista _Feed_?, lamentablemente para todas estas interrogantes la respuesta es _"depende"_, y serán ustedes quienes en base a la experiencia, la evidencia, el sistema que estén desarrollando y las herramientas que les brinda la ingeniería, tomen la mejor decisión.

**Requisito 2**
Cuando la amistad de un usuario evalúe una cerveza, se debe actualizar el _Feed_ en tiempo real, añadiendo una publicación que informe: la hora de la evaluación, la evaluación global de la cerveza, la evaluación que colocó la amistad, el nombre de la cerveza, el bar donde se sirve, el país del bar y la dirección. Además, se debe mostrar un botón que lleve directamente al usuario a la vista del bar en cuestión.

**Requisito 3**
Del proyecto 2.2, se implementó la publicación de fotos a los eventos, con descripciones y etiquetas opcionales. Ahora estas publicaciones deben mostrarse en el _Feed_ del usuario, añadiendo una publicación que informe: la hora de la publicación, la foto, la descripción, los _handles_ etiquetados, el nombre del evento, el bar asociado, el país y un botón que lleve directamente al usuario a la vista del evento en cuestión.

**Requisito 4**
Dado que pueden ocurrir muchas publicaciones, se debe implementar un sistema de filtrado que permita al usuario elegir entre filtrar por las publicaciones de una amistad específica, por un bar, un país o una cerveza. No es necesario poder filtrar por más de una opción a la vez, además, se debe poder eliminar cualquier filtro fácilmente. El filtro debe funcionar incluso con las nuevas publicaciones (si estoy filtrando por publicaciones relacionadas a Chile, y un amigo en Irlanda publica algo, la publicación no se debería ver en mi feed hasta que remueva el filtro).

**Requisito 5**
Los websockets por defecto son accesibles desde cualquier cliente compatible, y por lo mismo, la información que se transmite a través de sus canales, podría verse comprometida si no se autentifica a quienes establecen una conexión. Por lo tanto, cuando un cliente intente acceder al servidor de websockets, se debe verificar que el usuario esté autentificado, y en caso de no estarlo, se debe cerrar la conexión. Deben usar el token de autentificación para este fin.

## Sobre herramientas a utilizar

Tanto el servidor como el cliente de Websockets debe funcionar con Action Cable, según lo que vieron en un laboratorio previo.

## Evaluación

Cada requisito en cada una de las partes será evaluado en escala 1-5. Estos puntos se traducen a ponderadores:

- 1 -> 0.00: No entregado
- 2 -> 0.25: Esbozo de solución
- 3 -> 0.50: Logro intermedio
- 4 -> 0.75: Alto logro con deficiencias o errores menores
- 5 -> 1.00: Implementación completa y correcta

Los ponderadores aplican al puntaje máximo del ítem. La nota en escala 1-7 se calcula como la suma de puntajes parciales ponderados más el punto base.

## Forma y fecha de entrega

El código con la implementación de la aplicación debe ser entregado en este repositorio. Para la evaluación, se debe realizar un pull request que incluya al ayudante de proyecto asignado.
