# Status pages

## Vision general

El modulo status-pages agrupa las pantallas de estado de la aplicacion. En este proyecto no contiene logica de negocio compleja ni llamadas HTTP propias, pero cumple una funcion importante: recibir navegaciones de error o de acceso denegado desde otras capas de la app.

Archivo principal del modulo:

-   src/app/features/status-pages/status-pages.module.ts

Archivo de rutas del modulo:

-   src/app/features/status-pages/status-pages-routing.module.ts

## Responsabilidad del modulo

StatusPagesModule esta dedicado a mostrar estados terminales o informativos para el usuario cuando el flujo normal de la aplicacion no puede continuar.

En el estado actual del proyecto expone dos paginas:

-   internal-error
-   unauthorized

## Estructura interna

El modulo declara dos componentes:

-   ErrorComponent en src/app/features/status-pages/components/error/error.component.ts
-   UnauthorizedComponent en src/app/features/status-pages/components/unauthorized/unauthorized.component.ts

Ambos componentes son extremadamente livianos:

-   no inyectan servicios
-   no hacen llamadas HTTP
-   no contienen logica de navegacion propia en la clase
-   funcionan como contenedores de presentacion para sus templates y estilos

## Rutas del modulo

Las rutas definidas en src/app/features/status-pages/status-pages-routing.module.ts son:

1. WGTB/status/internal-error
2. WGTB/status/unauthorized

Estas rutas se cargan por lazy loading desde src/app/app-routing.module.ts a traves del segmento WGTB/status.

## Como entra el usuario a estas paginas

El valor real de este modulo no esta en su logica interna, sino en los flujos que redirigen hacia el.

### Unauthorized

Hay dos puntos reales detectados que llevan al usuario a unauthorized:

1. UserService en src/app/core/services/user.service.ts
2. AuthGuard en src/app/core/guards/auth.guard.ts

#### Caso 1: fallo al cargar el usuario

En UserService, el metodo fetchUserAccess llama a apibpmService.getActualUser(...).

Si la llamada falla:

1. UserService marca el usuario como null
2. navega a WGTB/status/unauthorized

Eso significa que unauthorized no representa solo un 401 tecnico. En la practica tambien funciona como pagina de fallo de validacion de acceso del usuario al iniciar la aplicacion.

#### Caso 2: guard de rutas protegidas

En AuthGuard, canActivate espera el valor real del usuario desde UserService.

Si el usuario es null:

1. el guard bloquea la ruta protegida
2. devuelve un UrlTree hacia WGTB/status/unauthorized

Eso hace que unauthorized sea la salida comun para pantallas que requieren autenticacion o contexto valido de usuario.

### Internal error

La ruta internal-error aparece como destino de fallback global en src/app/app-routing.module.ts.

El wildcard final hace redirect a:

-   WGTB/status/internal-error

En terminos practicos, esta pagina funciona como salida segura cuando la URL no coincide con ninguna ruta conocida de la aplicacion.

## Relacion con AppComponent

En src/app/app.component.ts, durante ngOnInit ocurren dos acciones que conectan indirectamente con status-pages:

1. protocolService.setAllConfigStores()
2. userService.fetchUserAccess()

La segunda es la relevante para este modulo, porque ese flujo puede terminar en la navegacion a unauthorized si no se puede resolver el usuario actual.

Por eso status-pages participa muy pronto en el ciclo de vida de la app, incluso antes de que el usuario entre a una feature de negocio.

## Relacion con el interceptor de errores

Status-pages no usa el interceptor de forma directa porque no hace llamadas HTTP. Sin embargo, puede ser alcanzado por flujos donde el interceptor ya actuó antes.

Ejemplo real:

1. AppComponent llama a userService.fetchUserAccess()
2. UserService llama a apibpmService.getActualUser(...)
3. si la llamada HTTP falla, ErrorInterceptor puede mostrar un toast global
4. despues UserService navega a WGTB/status/unauthorized

Ese detalle es importante porque explica por que el usuario puede ver primero una notificacion de error y despues terminar en unauthorized.

## Comportamiento funcional de cada componente

### ErrorComponent

Archivo:

-   src/app/features/status-pages/components/error/error.component.ts

Funcion:

-   representar visualmente el estado de error interno o de ruta no resuelta

Observacion:

-   la clase esta vacia; toda la experiencia depende del template y estilos

### UnauthorizedComponent

Archivo:

-   src/app/features/status-pages/components/unauthorized/unauthorized.component.ts

Funcion:

-   representar visualmente la falta de acceso o invalidez del contexto de usuario

Observacion:

-   la clase tambien esta vacia; el comportamiento de acceso lo deciden UserService y AuthGuard, no este componente

## Cobertura de pruebas

Los tests actuales en:

-   src/app/features/status-pages/components/error/error.component.spec.ts
-   src/app/features/status-pages/components/unauthorized/unauthorized.component.spec.ts

solo validan la creacion de los componentes.

Eso confirma que:

-   el modulo es muy liviano
-   la logica relevante esta fuera de los componentes
-   el comportamiento importante esta en routing, guardas y servicios de core

## Implicacion arquitectonica

Status-pages es un feature de soporte, no un feature de negocio. Su objetivo es desacoplar la presentacion de estados de error y acceso del resto de modulos.

Eso tiene ventajas claras:

1. Core decide cuando redirigir.
2. Routing decide como resolver errores de navegacion.
3. Status-pages solo se ocupa de renderizar la salida correspondiente.

Esta separacion es correcta porque evita meter templates de error dentro de componentes de negocio o guards.

## Resumen

StatusPagesModule es pequeño, pero estructuralmente importante. No emite trafico HTTP ni contiene logica propia compleja. Su valor esta en ser el destino comun de errores de acceso y errores de ruta. Unauthorized se usa desde UserService y AuthGuard. Internal-error se usa como fallback del routing global. Por eso es un modulo de soporte transversal dentro de features, aunque internamente sea simple.
