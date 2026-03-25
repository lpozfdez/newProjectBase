# Core

## Vision general

La carpeta core concentra la infraestructura transversal de la aplicacion. Es la capa que prepara comportamiento global, configuracion compartida y piezas singleton que despues consumen el resto de modulos.

Ruta base:

-   src/app/core

Subcarpetas detectadas:

-   adapters
-   directives
-   guards
-   interceptors
-   services

Archivo principal:

-   src/app/core/core.module.ts

## Responsabilidad de core

En este proyecto, core resuelve cinco problemas estructurales:

1. configuracion global del framework
2. manejo global de errores HTTP
3. inicializacion de recursos compartidos como iconos
4. control del contexto de usuario y acceso
5. utilidades base para fechas, directivas y configuracion de SDKs

En otras palabras, core no modela casos de negocio; modela las reglas comunes que permiten que la app arranque y funcione de forma coherente.

## CoreModule

Archivo:

-   src/app/core/core.module.ts

CoreModule no declara componentes visuales. Su papel es registrar providers globales.

Actualmente configura:

1. DateAdapter con CustomDateAdapter
2. MAT_DATE_FORMATS con MY_DATE_FORMATS
3. HTTP_INTERCEPTORS con ErrorInterceptor
4. APP_INITIALIZER para inicializar iconos con IconRegistryService

Eso convierte a CoreModule en la puerta de entrada de la infraestructura compartida.

## Flujo de arranque relacionado con core

El arranque real observado entre AppComponent y core es este:

1. AppComponent ejecuta protocolService.setAllConfigStores()
2. AppComponent ejecuta userService.fetchUserAccess()
3. CoreModule ya dejó activos el interceptor y la inicializacion de iconos
4. AuthGuard usa UserService para decidir si deja pasar o no a rutas protegidas

Representacion simplificada:

AppComponent -> ProtocolService -> SDKs API configurados
AppComponent -> UserService -> usuario cargado o null
CoreModule -> ErrorInterceptor -> errores HTTP globales
CoreModule -> IconRegistryService -> iconos registrados al inicio
AuthGuard -> UserService -> acceso permitido o unauthorized

## Adapters

### CustomDateAdapter

Archivo:

-   src/app/core/adapters/date-adapters.ts

Responsabilidad:

-   personalizar el parseo y formateo de fechas de Angular Material

Comportamiento real:

1. parsea cadenas en formato DD/MM/YYYY
2. valida que la fecha resultante exista realmente
3. devuelve null si el valor no es valido
4. formatea siempre en DD/MM/YYYY

Esto evita inconsistencias entre entrada y salida de fechas en componentes Material.

### MY_DATE_FORMATS

Archivo:

-   src/app/core/adapters/date-formats.ts

Responsabilidad:

-   definir el formato de parseo y de visualizacion usado por Angular Material

Formato configurado:

-   dd/MM/yyyy para input y accesibilidad de fecha
-   MMM yyyy y MMMM yyyy para etiquetas de mes y año

Relacion entre ambos adapters:

1. MY_DATE_FORMATS define como Angular Material espera y muestra la fecha
2. CustomDateAdapter define como convertir el valor

Los dos trabajan juntos y por eso ambos se registran en CoreModule.

## Interceptors

### ErrorInterceptor

Archivo:

-   src/app/core/interceptors/error.interceptor.ts

Responsabilidad:

-   capturar errores HTTP globales
-   mostrar un toast de error comun
-   propagar el error para manejo local posterior

Comportamiento observado:

1. deja pasar la request con next.handle(request)
2. captura errores con catchError
3. usa error.error.message o error.message si existen
4. muestra toast con ThinMatToastService
5. relanza el error con throwError

Implicacion:

-   centraliza la notificacion visual base
-   no sustituye el manejo local en servicios o componentes

Este interceptor ya esta documentado con mayor detalle en:

-   docs/README.md

## Services

### ProtocolService

Archivo:

-   src/app/core/services/protocol.service.ts

Responsabilidad:

-   construir la configuracion Nova comun
-   exponer NovaRequestConfig y NovaMetadata
-   fijar el release en los SDKs generados de API

Comportamiento real:

1. lee configuracion desde ConfigStore
2. crea NovaRequestConfig con el protocolo configurado
3. crea NovaMetadata con cabeceras implicitas
4. expone getAllNovaConfig() para reutilizarla en toda la app
5. aplica setNovaRelease en ApibpmService, ApitableService y ApitemplatesService

Importancia arquitectonica:

-   no hace llamadas HTTP directamente
-   pero es dependencia de casi todas las llamadas HTTP hechas via SDKs generados

Sin este servicio, los consumidores tendrian que reconstruir manualmente configuracion y metadatos en cada llamada.

### UserService

Archivo:

-   src/app/core/services/user.service.ts

Responsabilidad:

-   resolver el usuario actual
-   mantener el contexto de usuario en memoria
-   exponer acceso reactivo y sincrono al usuario

Comportamiento real:

1. mantiene un BehaviorSubject con tres estados: undefined, LoggedUserDto o null
2. undefined significa que todavia no se resolvio el usuario
3. fetchUserAccess llama a apibpmService.getActualUser(...)
4. si hay exito, guarda el usuario
5. si hay error, guarda null y navega a WGTB/status/unauthorized

Importancia arquitectonica:

-   es la fuente de verdad del acceso del usuario
-   conecta directamente con AuthGuard y con componentes que necesitan datos de usuario

Matiz importante:

-   en caso de error HTTP, el flujo puede pasar primero por ErrorInterceptor y despues terminar en unauthorized

### IconRegistryService

Archivo:

-   src/app/core/services/icon-registry.service.ts

Responsabilidad:

-   registrar iconos SVG personalizados para Angular Material

Comportamiento real:

1. registra iconos individuales
2. permite registrar varios iconos en lote
3. permite registrar icon sets por namespace
4. expone initializeIcons() para el arranque de la app
5. soporta registro on-demand de un icono concreto

Integracion real:

-   CoreModule lo ejecuta mediante APP_INITIALIZER
-   por eso los iconos quedan disponibles desde el inicio sin que cada componente tenga que registrarlos

Observacion:

-   la lista de iconos esta hardcodeada en getCustomIcons()
-   aparece el icono graphics dos veces, lo cual no rompe necesariamente la app, pero indica duplicacion en la configuracion actual

## Guards

### AuthGuard

Archivo:

-   src/app/core/guards/auth.guard.ts

Responsabilidad:

-   bloquear el acceso a rutas protegidas hasta tener un estado real de usuario

Comportamiento real:

1. escucha userService.getUserAsync()
2. ignora undefined para no redirigir antes de tiempo
3. toma la primera emision real con take(1)
4. si hay usuario, devuelve true
5. si el usuario es null, devuelve un UrlTree a WGTB/status/unauthorized

Importancia arquitectonica:

-   separa la validacion de acceso del routing declarativo
-   evita que las features protegidas implementen su propia comprobacion de usuario

Relacion con status-pages:

-   unauthorized es el destino comun cuando el guard detecta ausencia de usuario valido

## Directives

### TruncatedTooltipDirective

Archivo:

-   src/app/core/directives/truncated-tooltip.directive.ts

Responsabilidad:

-   detectar si un contenido visual esta truncado
-   emitir un booleano para que otro componente decida si mostrar tooltip u otra reaccion visual

Comportamiento real:

1. espera a que Angular estabilice la vista con ngZone.onStable
2. compara offsetWidth con scrollWidth
3. emite true si el contenido esta truncado
4. emite false si no lo esta

Observacion importante del estado actual:

-   en la revision del workspace no aparece uso productivo de appTruncatedTooltip en templates de la app
-   tampoco se observa declaracion de esta directiva dentro de CoreModule ni de otro modulo compartido
-   su presencia visible hoy esta limitada a su archivo y a su spec

Eso sugiere que actualmente la directiva existe y esta probada, pero no parece integrada en el arbol Angular de la aplicacion productiva.

## Como se conecta core con el resto de la app

### Con AppComponent

Archivo relacionado:

-   src/app/app.component.ts

AppComponent usa dos servicios de core durante ngOnInit:

1. ProtocolService para configurar los SDKs al arranque
2. UserService para resolver acceso del usuario

### Con routing

Archivos relacionados:

-   src/app/app-routing.module.ts
-   src/app/core/guards/auth.guard.ts

Las rutas protegidas delegan en AuthGuard. Eso hace que core controle el acceso sin acoplar la politica de autorizacion a cada feature.

### Con features y shared

Ejemplos de dependencia real:

1. Shared usa ProtocolService en table.component
2. Shared usa UserService en header.component
3. Features usan ProtocolService para preparar llamadas a APIs generadas
4. Todo el trafico HTTP queda atravesado por ErrorInterceptor cuando usa HttpClient o SDKs basados en HttpClient

## Cobertura de pruebas en core

Cada pieza principal de core tiene su spec:

-   src/app/core/adapters/date-adapters.spec.ts
-   src/app/core/adapters/date-formats.spec.ts
-   src/app/core/directives/truncated-tooltip.directive.spec.ts
-   src/app/core/guards/auth.guard.spec.ts
-   src/app/core/interceptors/error.interceptor.spec.ts
-   src/app/core/services/icon-registry.service.spec.ts
-   src/app/core/services/protocol.service.spec.ts
-   src/app/core/services/user.service.spec.ts

Eso indica que la carpeta core no solo contiene infraestructura, sino infraestructura con una base razonable de validacion unitaria.

## Resumen

La carpeta core es la base operativa de la aplicacion. Configura fechas, iconos, errores HTTP, acceso de usuario y politicas de navegacion protegida. ProtocolService estandariza la configuracion tecnica de las APIs. UserService y AuthGuard controlan el acceso. ErrorInterceptor centraliza errores HTTP. IconRegistryService prepara recursos visuales globales. La unica pieza que hoy parece desacoplada del uso productivo es TruncatedTooltipDirective, ya que no se observa integrada en modulos o templates fuera de sus tests.
