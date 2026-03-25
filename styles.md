# Styles

## Vision general

La carpeta styles concentra la capa visual global de la aplicacion. No pertenece a una feature concreta, sino que define tema, tipografias, reset, layout base y overrides compartidos para Angular Material y thin-components.

Ruta base:

-   src/styles

Archivos principales detectados:

-   src/styles/\_variables.scss
-   src/styles/app.scss
-   src/styles/fonts.scss
-   src/styles/material.scss
-   src/styles/reset.scss
-   src/styles/typography.scss
-   src/styles/thin.scss
-   src/styles/task.scss
-   src/styles/card.scss

Subcarpeta de overrides por componente:

-   src/styles/components

## Como entra styles en la aplicacion

La configuracion real en angular.json registra dos entrypoints globales de estilos:

1. src/styles.scss
2. src/styles/app.scss

Eso significa que el orden general es este:

1. primero se cargan estilos externos y base de thin-components desde src/styles.scss
2. despues se carga la capa visual propia del proyecto desde src/styles/app.scss

Este orden es importante porque permite que la app apoye su base en thin-components y luego sobreescriba o complemente el comportamiento visual con estilos propios.

## Entry points globales

### src/styles.scss

Archivo:

-   src/styles.scss

Responsabilidad:

-   importar estilos globales externos de thin-components
-   cargar el paquete de iconos asociado

Imports detectados:

1. bbva-thin-coronita desde thin-components
2. icons.css desde thin-components

Esto convierte a src/styles.scss en la puerta de entrada del sistema visual externo sobre el que luego trabaja la app.

### src/styles/app.scss

Archivo:

-   src/styles/app.scss

Responsabilidad:

-   componer la capa de estilos propia del proyecto

Imports detectados y ordenados:

1. \_variables.scss
2. material.scss
3. reset.scss
4. fonts.scss
5. card.scss
6. typography.scss
7. thin.scss
8. task.scss

Despues define estilos globales para body.

Observacion importante:

-   el body usa la familia BBVA Benton Sans
-   el fondo global se apoya en la variable $netural-9

## Variables visuales

Archivo:

-   src/styles/\_variables.scss

Responsabilidad:

-   centralizar la paleta y sombras usadas por la app

Contenido destacado:

1. escala primary
2. escala netural
3. escala secondary
4. escala terciary
5. sombras reutilizables como $shadow y $shadow2

Observaciones:

1. la paleta visual principal del proyecto es azul con neutros claros y oscuros
2. el archivo usa nombres netural y terciary, que parecen variantes ortograficas de neutral y tertiary, pero son consistentes dentro del proyecto
3. muchas hojas dependen de estas variables, por lo que actua como la fuente de verdad del sistema cromatico

## Tipografias

Archivo:

-   src/styles/fonts.scss

Responsabilidad:

-   registrar familias tipograficas corporativas via @font-face

Fuentes detectadas:

1. BBVA Benton Sans en varios pesos e italicas
2. BBVA Tiempos Headline para encabezados

Implicacion:

-   la app no depende solo de tipografias del sistema
-   el lenguaje visual se apoya en una identidad corporativa concreta cargada desde src/assets/fonts

## Tipografia global

Archivo:

-   src/styles/typography.scss

Responsabilidad:

-   definir el tratamiento tipografico base para headings y texto general

Comportamiento real:

1. h1 a h6 usan BBVA Tiempos Headline
2. h1 y h2 reciben color primary y tamaños corporativos
3. p y span usan un tamaño base de 0.9375rem
4. small usa 0.75rem

Esto refuerza la separacion visual entre titulares editoriales y texto operativo.

## Reset global

Archivo:

-   src/styles/reset.scss

Responsabilidad:

-   normalizar estilos base HTML antes de aplicar la capa visual del proyecto

Comportamiento real:

1. elimina márgenes y paddings por defecto
2. fija box-sizing: border-box en una gran cantidad de elementos
3. resetea listas, tablas y citas
4. define display block para elementos semanticos HTML5

Esta hoja actua como la capa de saneamiento sobre la que se construye el resto del sistema visual.

## Tema de Angular Material y overrides compartidos

Archivo:

-   src/styles/material.scss

Responsabilidad:

-   definir el tema base de Angular Material
-   importar overrides por componente
-   incorporar personalizaciones de thin-components

Comportamiento real:

1. usa @use '@angular/material' as mat
2. ejecuta mat.core()
3. define paletas primary, accent y warn con paletas base de Material
4. define tipografia Material con una familia Benton, Tiempos, Helvetica
5. crea un tema light y aplica mat.all-component-themes(...)

Despues importa overrides locales para:

1. table
2. tabs
3. button
4. field
5. select
6. paginator
7. checkbox
8. menu
9. icon
10. progress-bar
11. accordion
12. dialog
13. thin-toast

Observacion importante:

-   el tema base de Material usa paletas genericas indigo, pink y red
-   pero la app aplica despues una capa fuerte de overrides con la paleta BBVA definida en \_variables.scss
-   en la practica, la identidad final viene mas de los overrides que del tema Material base

## Overrides por componente

Carpeta:

-   src/styles/components

Responsabilidad:

-   concentrar personalizaciones globales de componentes Material y thin-components

Ejemplos reales:

### button.scss

Archivo:

-   src/styles/components/button.scss

Funcion:

-   redefine radios, anchos minimos, colores y variantes de botones Material

Patron visual:

-   botones redondeados
-   primario oscuro sobre fondo claro
-   variante stroked alineada con la paleta del proyecto

### table.scss

Archivo:

-   src/styles/components/table.scss

Funcion:

-   construye el look global de tablas con clase custom-table
-   ajusta encabezados, celdas, iconos, filtros y estados visuales

Patron visual:

-   tablas en contenedor blanco con bordes redondeados
-   acciones e iconos con color primary
-   celdas truncadas con ellipsis
-   clases de estado success, warning, error y default

### thin-toast.scss

Archivo:

-   src/styles/components/thin-toast.scss

Funcion:

-   ajustar el posicionamiento y la tarjeta visual del componente de toast de thin-components

Patron visual:

-   toast desplazado al borde inferior
-   tarjeta con padding, radio y sombra propia del proyecto

Conclusión de esta capa:

-   la app no estiliza solo sus componentes propios
-   tambien retema globalmente componentes de Angular Material y de thin-components

## Hojas de layout y dominio visual

### card.scss

Archivo:

-   src/styles/card.scss

Responsabilidad:

-   definir un contenedor visual reutilizable tipo card

Comportamiento real:

1. fondo blanco
2. sombra corporativa
3. radio grande
4. titulo interno y separador estilizado

### task.scss

Archivo:

-   src/styles/task.scss

Responsabilidad:

-   definir layout y espaciado transversal para vistas de tarea y formularios relacionados

Comportamiento real:

1. estructura contenedores task**container y task**section
2. usa grids para inputs y checklists
3. ajusta errores Material y slide toggles

Esto indica una capa de estilos pensada para las pantallas de task-detail y formularios asociados.

### thin.scss

Archivo:

-   src/styles/thin.scss

Responsabilidad:

-   añadir reglas de layout global sobre la clase thin-app

Comportamiento real:

1. agrega padding lateral de 3rem

Es una hoja pequeña, pero relevante porque actua directamente sobre el contenedor de aplicacion.

## Relacion con la arquitectura del proyecto

Styles vive fuera de core, shared y features porque es una capa horizontal de presentacion. Su relacion con el resto de la app es esta:

1. app.module y angular.json la cargan globalmente
2. shared y features heredan sus reglas tipograficas y de layout
3. Angular Material y thin-components quedan retocados desde esta capa global

Representacion simplificada:

angular.json -> src/styles.scss -> thin-components base
angular.json -> src/styles/app.scss -> tema visual propio
app.scss -> variables + reset + fonts + typography + Material overrides + layouts

## Cobertura de pruebas

No se observan specs para la carpeta styles, lo cual es normal en este tipo de capa. La validacion de styles en este proyecto depende principalmente de:

1. build de Angular
2. render visual de componentes
3. integracion efectiva con Angular Material y thin-components

## Observaciones tecnicas

1. angular.json define includePaths en src/styles, lo que permite imports SCSS mas simples
2. la app usa una mezcla de tema Material base y overrides corporativos intensos
3. styles/components actua como un nivel de design system pragmatico para controles globales
4. task.scss sugiere que parte del layout de negocio esta centralizado como estilo global y no solo en scss por componente

## Resumen

La carpeta styles es la capa visual global del proyecto. Parte de estilos base importados desde thin-components, define una identidad propia con variables y fuentes BBVA, aplica reset y tipografia global, construye un tema Material y después lo sobreescribe con reglas corporativas por componente. Tambien aporta layouts reutilizables como card, thin-app y task, por lo que su impacto se extiende a toda la aplicacion.
