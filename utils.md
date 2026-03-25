# Utils

## Vision general

La carpeta utils contiene utilidades puntuales de soporte que no encajan naturalmente en core, shared o una feature concreta. En el estado actual del proyecto es una carpeta pequeña y especializada.

Ruta base:

-   src/app/utils

Contenido detectado:

-   baseUri

Eso significa que hoy utils no es una libreria generalista de helpers, sino un espacio muy concreto para resolver la base de despliegue de la aplicacion.

## Estructura actual

Subcarpeta identificada:

-   src/app/utils/baseUri

Archivos:

-   src/app/utils/baseUri/baseuri.factory.ts
-   src/app/utils/baseUri/baseuri.injection.token.ts
-   src/app/utils/baseUri/baseuri.factory.spec.ts
-   src/app/utils/baseUri/baseuri.injection.token.spec.ts

## Responsabilidad de utils en esta app

En el estado actual, utils resuelve una necesidad de infraestructura ligera:

1. calcular una base URI dependiente del host de entrada
2. exponer ese valor como dependencia inyectable

No contiene logica de negocio ni utilidades compartidas amplias como formateadores, mapeadores o validadores genericos.

## Base URI

### baseUriFactory

Archivo:

-   src/app/utils/baseUri/baseuri.factory.ts

Responsabilidad:

-   construir la URI base de la aplicacion a partir de window.location

Comportamiento real:

1. toma protocol desde window.location.protocol
2. toma hostname y host desde window.location
3. si el hostname es localhost, usa host completo con puerto
4. si no es localhost, concatena /ENOA al hostname
5. devuelve el resultado como protocol//host

Ejemplos conceptuales del comportamiento:

1. en localhost:4200 devuelve algo como http://localhost:4200
2. en un host remoto devuelve algo como https://mi-host/ENOA

Implicacion:

-   la utilidad diferencia explicitamente entorno local y despliegue remoto
-   el sufijo /ENOA forma parte de la convencion actual de despliegue de la app

### baseUriInjectionToken

Archivo:

-   src/app/utils/baseUri/baseuri.injection.token.ts

Responsabilidad:

-   exponer la base URI como InjectionToken<string>

Esto permite registrar el valor calculado por la factory dentro del sistema de inyeccion de Angular en lugar de acoplar a los consumidores directamente con window.location.

## Integracion real con AppModule

Archivo relacionado:

-   src/app/app.module.ts

La integracion detectada es esta:

1. AppModule importa baseUriFactory
2. AppModule importa baseUriInjectionToken
3. en providers registra:
    1. provide: baseUriInjectionToken
    2. useFactory: baseUriFactory

Eso significa que el valor queda disponible para inyeccion desde el arranque de la app.

## Estado actual de uso

En la revision de src/app se observa:

1. baseUriFactory se usa en AppModule
2. baseUriInjectionToken se registra en AppModule
3. no aparece consumo adicional del token dentro de src/app fuera de ese registro

Eso sugiere una de estas situaciones:

1. el token existe para integracion futura
2. el consumo ocurre fuera de src/app
3. la utilidad quedo parcialmente integrada y hoy su uso directo es limitado

Con la evidencia revisada en este workspace, lo verificable es que su uso visible actual dentro de la app se reduce al registro en AppModule.

## Relacion con el resto de la arquitectura

Utils queda en una posicion intermedia:

1. no pertenece a core porque no define comportamiento transversal amplio ni servicios singleton por si mismo
2. no pertenece a shared porque no expone UI reutilizable
3. no pertenece a features porque no implementa casos de uso

Por eso su ubicacion tiene sentido como utilidad de infraestructura puntual.

Representacion simplificada:

utils/baseUri -> AppModule providers -> InjectionToken disponible en DI

## Cobertura de pruebas

Hay pruebas unitarias para las dos piezas principales:

-   src/app/utils/baseUri/baseuri.factory.spec.ts
-   src/app/utils/baseUri/baseuri.injection.token.spec.ts

Que validan:

1. que la factory devuelve string
2. que respeta el protocolo actual
3. que usa host con puerto en localhost
4. que el token existe y es un InjectionToken valido

## Observaciones tecnicas

1. baseUriFactory depende directamente de window.location, por lo que su comportamiento queda ligado al entorno del navegador
2. la regla /ENOA esta hardcodeada y representa una convencion de despliegue especifica del proyecto
3. el token esta registrado, pero no se observa consumo adicional en src/app durante esta revision

## Resumen

La carpeta utils es actualmente muy reducida y cumple una funcion concreta: resolver e inyectar la base URI de la aplicacion segun el host de entrada. Su pieza central es baseUriFactory, acompañada por un InjectionToken para integracion con Angular DI. Es una utilidad de infraestructura puntual, no una capa funcional amplia del proyecto.
