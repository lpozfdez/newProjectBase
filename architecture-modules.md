# Arquitectura de modulos

## Vision general

La aplicacion sigue una separacion clasica por responsabilidades:

-   core: infraestructura transversal de la aplicacion
-   shared: piezas reutilizables de UI y utilidades comunes
-   features: modulos funcionales o pantallas de negocio
-   utils: utilidades puntuales de infraestructura
-   styles: capa visual global y overrides compartidos

Esta separacion permite que la infraestructura global se defina una vez, los componentes compartidos se reutilicen sin duplicacion y cada feature encapsule su flujo de negocio.

Documentacion relacionada de utilidades:

-   docs/utils.md

Documentacion relacionada de estilos:

-   docs/styles.md

## CoreModule

Archivo principal:

-   src/app/core/core.module.ts

Responsabilidad:

-   registrar proveedores globales
-   configurar adaptadores y formatos de fecha
-   registrar el interceptor HTTP global
-   ejecutar inicializacion de iconos en el arranque

Elementos clave detectados en core:

-   ErrorInterceptor para errores HTTP globales
-   CustomDateAdapter y formatos de fecha propios
-   IconRegistryService via APP_INITIALIZER
-   servicios de infraestructura como ProtocolService y UserService
-   AuthGuard para proteger rutas autenticadas

Regla practica:

Todo lo que deba existir una sola vez y aplicar a toda la app debe vivir en core. En este proyecto el ejemplo mas claro es el interceptor de errores.

Documentacion relacionada:

-   docs/core.md

## SharedModule

Archivo principal:

-   src/app/shared/shared.module.ts

Responsabilidad:

-   agrupar componentes reutilizables
-   centralizar imports frecuentes de Angular Material
-   exportar piezas visuales compartidas entre features

Elementos compartidos destacados:

-   HeaderComponent
-   TableComponent
-   DetailTemplatesComponent
-   ProcessStepperComponent
-   LogsCommentsComponent
-   ConfirmationModalComponent
-   pipes como DurationDaysDisplayPipe y StatusDisplayPipe

Regla practica:

Shared no define comportamiento de negocio del dominio. Expone UI y utilidades que pueden ser consumidas por multiples features.

## Features

La carga de features se define en src/app/app-routing.module.ts mediante lazy loading bajo la ruta base WGTB.

Features identificadas:

-   home
-   dashboard
-   status
-   task-detail
-   opportunity-detail
-   slas-dashboard

Cada feature encapsula pantalla, routing y composicion de componentes especificos del caso de uso.

### HomeModule

Archivo:

-   src/app/features/home/home.module.ts

Funcion:

-   pantalla de entrada
-   compone SharedModule y TaskDetailModule

### DashboardTablesModule

Archivo:

-   src/app/features/dashboard-tables/dashboard-tables.module.ts

Funcion:

-   pantalla de tablas de tasks y opportunities
-   consume configuracion remota de tablas

### TaskDetailModule

Archivo:

-   src/app/features/task-detail/task-detail.module.ts

Funcion:

-   modulo mas denso del dominio
-   concentra flujo de asignacion de tareas, detalle, aprobaciones, comentarios y formularios complejos
-   declara varios componentes especializados por tipo de tarea

Documentacion relacionada:

-   docs/task-detail.md

### OpportunityDetailModule

Archivo:

-   src/app/features/opportunity-detail/opportunity-detail.module.ts

Funcion:

-   detalle de oportunidad con soporte de componentes compartidos

### SlasDashboardModule

Archivo:

-   src/app/features/slas-dashboard/slas-dashboard.module.ts

Funcion:

-   dashboard de SLAs con configuracion de tabla obtenida por API

### StatusPagesModule

Archivo:

-   src/app/features/status-pages/status-pages.module.ts

Funcion:

-   pantallas de estado como unauthorized e internal error

Documentacion relacionada:

-   docs/status-pages.md

## Como se conectan entre si

Flujo de dependencias observado:

1. AppModule importa CoreModule y modulos base.
2. CoreModule registra infraestructura global.
3. AppRoutingModule carga las features por ruta.
4. Cada feature importa SharedModule para reutilizar UI.
5. Los servicios de core y los SDKs generados de API son consumidos desde services y componentes de features.

Representacion simplificada:

AppModule -> CoreModule
AppModule -> AppRoutingModule -> FeatureModule
FeatureModule -> SharedModule
FeatureModule -> servicios de core y APIs generadas

## Impacto del interceptor global en esta arquitectura

Como ErrorInterceptor se registra en CoreModule, cualquier llamada que pase por HttpClient dentro de la app queda bajo su alcance.

Eso incluye:

-   llamadas directas con HttpClient
-   llamadas hechas a traves de ApibpmService
-   llamadas hechas a traves de ApitableService
-   llamadas hechas a traves de ApitemplatesService

En este proyecto esos tres servicios provienen de librerias generadas e internamente dependen de HttpClient, por lo que sus errores HTTP tambien recorren la cadena de interceptores.

## Ejemplos reales afectados por el interceptor

### Core

UserService en src/app/core/services/user.service.ts:

-   fetchUserAccess llama a apibpmService.getActualUser(...)
-   si la llamada falla, el interceptor muestra el toast global
-   despues UserService maneja localmente el error seteando usuario null y navegando a WGTB/status/unauthorized

ProtocolService en src/app/core/services/protocol.service.ts:

-   no hace peticiones por si mismo
-   prepara la configuracion Nova que luego usan ApibpmService, ApitableService y ApitemplatesService
-   por eso actua como dependencia transversal de muchas llamadas afectadas por el interceptor

### Feature task-detail

TaskDetailComponent en src/app/features/task-detail/task-detail.component.ts:

-   assignTask llama a apibpmService.assignTask(...)
-   getTaskDetails llama a apibpmService.getTask(...)
-   si cualquiera falla, el interceptor puede disparar el toast global antes del manejo local del componente

TaskStatusService en src/app/features/task-detail/services/task-status.service.ts:

-   completeTask llama a apibpmService.completeTask(...)
-   updateTask llama a apibpmService.updateTask(...)
-   setStatusTask llama a apibpmService.setTaskStatus(...)
-   este servicio transforma el error en false con catchError, pero eso ocurre despues de que el interceptor ya tuvo oportunidad de mostrar el toast global

MasterDataService en src/app/features/task-detail/services/masterData.service.ts:

-   getMasterData llama a apiTable.getSelectValues(...)
-   si falla la obtencion de catalogos, el interceptor tambien participa

SearchRDRService en src/app/features/task-detail/services/search-RDR.service.ts:

-   searchClients usa HttpClient directo en produccion
-   getAllClients usa HttpClient directo en produccion
-   createClient usa HttpClient directo en produccion
-   en desarrollo usa mocks, por lo que en ese modo no siempre pasa por el interceptor

StepperModalComponent en src/app/features/task-detail/components/stepper-modal/stepper-modal.component.ts:

-   getAllTemplate arma varias peticiones con forkJoin usando apiTemplateService.getTemplateById(...)
-   si falla una plantilla, el interceptor puede mostrar el toast del error HTTP antes de que el componente decida una reaccion adicional

PricingApprovalsComponent en src/app/features/task-detail/components/pricing-approvals/pricing-approvals.component.ts:

-   loadOpportunityDataDto llama a apiBpmService.getOpportunity(...)
-   un fallo en la carga de datos de oportunidad activa el interceptor global

NewOpportunityComponent en src/app/features/task-detail/components/new-opportunity/new-opportunity.component.ts:

-   sendOpportunityToAPI llama a apiBpmService.createOpportunity(...)
-   loadOpportunityDataDto llama a apiBpmService.getOpportunity(...)
-   ambos flujos quedan cubiertos por el interceptor global

### Features de dashboard

DashboardTablesComponent en src/app/features/dashboard-tables/dashboard-tables.component.ts:

-   getTableConfiguration llama a apitableService.getConfigurationById(...)
-   si la API falla, el interceptor muestra el toast y luego el componente aplica configuracion fallback local

SlasDashboardComponent en src/app/features/slas-dashboard/slas-dashboard.component.ts:

-   getTableConfiguration llama a apitableService.getConfigurationById(...)
-   si falla, ocurre el mismo patron: toast global y fallback local

## Casos que no quedan afectados

No todo en la app pasa por el interceptor. Quedan fuera:

-   componentes puramente visuales de SharedModule
-   pipes, enums y modelos
-   servicios sin trafico HTTP directo
-   flujos mockeados de SearchRDRService cuando environment.production es false

## Implicacion operativa

La arquitectura actual mezcla dos niveles de reaccion ante errores:

1. nivel global en CoreModule con ErrorInterceptor
2. nivel local en services y componentes de features

Ese diseño es valido, pero hay que vigilar duplicidad de mensajes. Si un componente muestra un toast propio tras capturar el error, el usuario puede ver dos notificaciones para el mismo fallo.

## Resumen

Core concentra infraestructura global y define el interceptor. Shared aporta UI reutilizable. Features encapsula casos de uso y es donde realmente se disparan la mayoria de llamadas HTTP. Por esa razon, aunque el interceptor viva en core, su efecto real se observa sobre todo en task-detail, dashboard-tables, slas-dashboard y servicios de acceso a datos como UserService, TaskStatusService, MasterDataService y SearchRDRService.
