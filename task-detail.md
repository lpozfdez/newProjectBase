# Task detail

## Vision general

La carpeta task-detail es la parte funcional más compleja del proyecto. No es solo una pantalla de detalle: actúa como un orquestador de múltiples subflujos de negocio, formularios heterogéneos, comentarios, plantillas de detalle y transiciones de estado BPM.

Ruta base:

-   src/app/features/task-detail

Piezas principales:

-   módulo y routing propios
-   un componente contenedor principal
-   varios componentes hijos especializados por tipo de tarea
-   servicios internos de apoyo para formularios, master data, búsqueda y agregación de estado
-   modelos locales de apoyo

## Que problema resuelve

Task-detail centraliza el trabajo sobre oportunidades y tareas BPM. En la práctica cubre escenarios como:

1. creación o enriquecimiento de oportunidad
2. prechecks
3. pricing approvals
4. revisiones NBC locales y globales
5. risk approval
6. negotiation and agreement
7. review language y legal
8. final review
9. formalization

No es una feature lineal. Es un contenedor que cambia de comportamiento según taskType e idStatus.

## Estructura interna

### Archivos base

-   src/app/features/task-detail/task-detail.module.ts
-   src/app/features/task-detail/task-detail-routing.module.ts
-   src/app/features/task-detail/task-detail.component.ts
-   src/app/features/task-detail/task-detail.component.html

### Servicios internos

-   src/app/features/task-detail/services/task-status.service.ts
-   src/app/features/task-detail/services/form.service.ts
-   src/app/features/task-detail/services/masterData.service.ts
-   src/app/features/task-detail/services/search-RDR.service.ts

### Modelos locales

-   src/app/features/task-detail/models/task-detail.model.ts
-   src/app/features/task-detail/models/client-RDR.model.ts

### Componentes funcionales

Subcarpetas detectadas:

-   prechecks
-   pricing-approvals
-   gtb-manager-price-review
-   nbc-process-and-approval
-   nbc-global
-   nbc-local
-   nbc-local-global
-   deal-risk-approval
-   negotiation-and-agreement
-   review-language-contract
-   review-legal-contract
-   final-review-opportunity
-   formalization-opportunity
-   new-opportunity
-   client-RDR-search-modal
-   pricing-notification-modal
-   stepper-modal

## TaskDetailModule

Archivo:

-   src/app/features/task-detail/task-detail.module.ts

Responsabilidad:

-   declarar el contenedor principal y todos los subcomponentes de tarea
-   importar Angular Material, ReactiveFormsModule y SharedModule

Observación importante:

-   task-detail concentra una gran cantidad de componentes en un solo módulo
-   esto refuerza la idea de que es una feature compuesta por muchos subflujos, no una pantalla simple

## Routing del módulo

Archivo:

-   src/app/features/task-detail/task-detail-routing.module.ts

Rutas detectadas:

1. ruta vacía hacia TaskDetailComponent
2. ruta parametrizada :taskName/:businessId/:taskId hacia TaskDetailComponent

Observación:

-   el routing interno es deliberadamente simple
-   toda la complejidad se mueve al propio contenedor y a los parámetros de navegación
-   aparecen comentarios de canActivate, pero no están activos en este routing local

## Pieza central: TaskDetailComponent

Archivo:

-   src/app/features/task-detail/task-detail.component.ts

Este componente es el orquestador principal del módulo.

Responsabilidades reales:

1. leer parámetros de ruta y query params
2. recuperar la tarea seleccionada almacenada en TaskStatusService
3. decidir si debe asignar la tarea o mostrar flujo de nueva oportunidad
4. cargar el detalle de la tarea BPM
5. mostrar el subcomponente correcto según taskType
6. centralizar comentarios y acciones globales
7. completar, guardar, liberar o enviar a revisión la tarea

### Fuentes de estado que combina

TaskDetailComponent no depende de una sola fuente. Orquesta varias a la vez:

1. activatedRoute.params
2. activatedRoute.queryParams
3. taskStatusService.getSelectedTask()
4. respuesta de apibpmService.getTask(...)
5. businessData cargado más tarde vía detail-templates

Este es uno de los motivos principales de su complejidad.

## Flujo de inicialización real

El flujo principal del contenedor es este:

1. ngOnInit llama a getUrlParams()
2. getUrlParams combina params, queryParams y selectedTask
3. extrae taskType, businessId, taskId y actualOwner
4. handleTaskLogic decide si entra en flujo new o si asigna la tarea
5. si no es new, assignTask() llama a apibpmService.assignTask(...)
6. después getTaskDetails() llama a apibpmService.getTask(...)
7. la respuesta se guarda como originalTaskDto
8. se construyen taskFieldIds en TaskStatusService
9. el template renderiza el componente hijo correspondiente

Representación simplificada:

Ruta + selectedTask -> TaskDetailComponent
TaskDetailComponent -> assignTask -> getTask
getTask -> originalTaskDto
originalTaskDto + taskType -> render del hijo correcto

## Selección dinámica del componente hijo

Archivo clave:

-   src/app/features/task-detail/task-detail.component.html

La plantilla usa múltiples bloques \*ngIf para decidir qué subcomponente renderizar.

Ejemplos reales:

1. PRECHECKS -> app-prechecks
2. PRICING_APPROVAL -> app-pricing-approvals
3. MANAGER_PRICE_REVIEW -> app-gtb-manager-price-review
4. NBC_PROCESS -> app-nbc-process-and-approval
5. NBC_LOCAL / NBC_GLOBAL / NBC_LOCAL_GLOBAL -> sus componentes específicos
6. DEAL_RISK_APP -> app-deal-risk-approval
7. NEGOTIATION_AGREEMENT -> app-negotiation-and-agreement
8. REVIEW_LANGUAGE_BEX / REVIEW_LANGUAGE_LEGAL -> componentes de revisión
9. FINAL_REVIEW_OPP -> app-final-review-opportunity
10. FORMALIZATION_OPP -> app-formalization-opportunity
11. estados new, draft o enrich -> app-new-opportunity

Esto convierte la plantilla del contenedor en un router funcional interno basado en TaskType.

## TaskType como eje del módulo

Archivo relacionado:

-   src/app/shared/enums/taskType.enum.ts

TaskType define:

1. los tipos de tarea BPM reconocidos por el módulo
2. nombres formateados
3. STEPPER_ORDER
4. ENTITY_ID para plantillas de detalle

Eso hace que task-detail dependa fuertemente de este enum como contrato de navegación, render y orden lógico del proceso.

## Patrón dominante de los componentes hijos

La mayoría de componentes hijos siguen este patrón:

1. reciben opportunityDataDto como Input
2. emiten componentTitleEvent al padre
3. construyen un FormGroup propio
4. cargan master data o datos previos si lo necesitan
5. escuchan valueChanges del formulario
6. llaman a taskStatusService.updateTaskData(...) con sus datos e isValid
7. escuchan validationTrigger$ para forzar visualización de errores

Este patrón aparece con claridad en:

1. src/app/features/task-detail/components/prechecks/prechecks.component.ts
2. src/app/features/task-detail/components/pricing-approvals/pricing-approvals.component.ts
3. src/app/features/task-detail/components/nbc-process-and-approval/nbc-process-and-approval.component.ts
4. src/app/features/task-detail/components/formalization-opportunity/formalization-opportunity.component.ts

## Servicio clave: TaskStatusService

Archivo:

-   src/app/features/task-detail/services/task-status.service.ts

Este servicio es la columna vertebral interna del módulo.

Responsabilidades reales:

1. guardar datos agregados de formularios por taskName
2. almacenar selectedTask en memoria y sessionStorage
3. almacenar businessData y tasks asociados
4. exponer streams reactivos para hijos y padre
5. validar si todos los formularios son válidos
6. disparar visualización de errores en todos los formularios
7. mapear estructuras complejas entre formularios y FieldDto

### Por qué es tan importante

Task-detail no envía directamente cada formulario hijo al backend. Primero centraliza todos los subformularios en TaskStatusService y luego el contenedor padre los transforma en payload BPM.

Eso hace que TaskStatusService funcione como:

1. store temporal del módulo
2. agregador de formularios
3. traductor entre estructuras Angular y DTOs BPM

### Mapeos complejos

La zona más compleja del servicio está en:

1. getAllTaskData()
2. mapToFieldDtos()
3. mapFieldsToFieldIds()
4. mapFieldsToPatch()
5. normalizePatchBooleans()

Estos métodos convierten entre:

1. formularios planos o anidados
2. arrays de productos o stakeholders
3. estructuras FieldDto, MidFieldDto y ChildFieldDto
4. datos string/boolean provenientes del backend

Esta capa de traducción es uno de los núcleos técnicos más delicados del módulo.

## Carga de businessData: una dependencia no obvia

Pieza relacionada:

-   src/app/shared/components/detail-templates/detail-templates.component.ts

Hay un acoplamiento importante que no es obvio a primera vista:

1. DetailTemplatesComponent vive en shared
2. pero llama a apiBpmService.getOpportunity(...)
3. y luego ejecuta taskStatus.setBusinessData(...)

Esto significa que parte del estado interno de task-detail se hidrata desde un componente compartido y no solo desde TaskDetailComponent.

Consecuencia práctica:

1. algunos hijos como pricing-approvals, gtb-manager-price-review o final-review-opportunity consumen getTasksOnBusinessData()
2. ese dato existe porque detail-templates ya lo inyectó en TaskStatusService

Este punto es clave para entender el módulo completo.

## Servicios auxiliares del módulo

### FormService

Archivo:

-   src/app/features/task-detail/services/form.service.ts

Responsabilidad:

-   centralizar mensajes de validación y utilidades de formularios

Funciones relevantes:

1. getFieldError
2. hasFieldErrorTouchedOrDirty
3. markAllFieldsAsTouched
4. sanitizeControlName
5. utilidades para grupos de selección y validación

Importancia:

-   evita duplicar mensajes y reglas de visualización en cada componente hijo

### MasterDataService

Archivo:

-   src/app/features/task-detail/services/masterData.service.ts

Responsabilidad:

-   resolver catálogos vía api-table

Uso típico:

-   prechecks, new-opportunity y otros componentes lo usan para poblar selects y valores parametrizados

### SearchRDRService

Archivo:

-   src/app/features/task-detail/services/search-RDR.service.ts

Responsabilidad:

-   buscar o crear clientes RDR

Comportamiento relevante:

1. en desarrollo usa mocks
2. en producción usa HttpClient real

Esto lo convierte en un servicio híbrido de UX y datos.

## Componentes representativos y su rol

### PrechecksComponent

Archivo:

-   src/app/features/task-detail/components/prechecks/prechecks.component.ts

Rol:

-   formulario de prechecks con master data y validaciones obligatorias

Patrón visible:

1. carga catálogos con forkJoin
2. rehidrata datos existentes
3. normaliza fecha para el formulario
4. publica el estado del formulario en TaskStatusService

### PricingApprovalsComponent

Archivo:

-   src/app/features/task-detail/components/pricing-approvals/pricing-approvals.component.ts

Rol:

-   uno de los componentes más complejos del módulo

Razones:

1. combina datos del task actual, tareas previas y businessData
2. maneja stakeholders dinámicos
3. controla threshold y aprobación local
4. emite eventos al padre como sendNotification y localApprover

### NewOpportunityComponent

Archivo:

-   src/app/features/task-detail/components/new-opportunity/new-opportunity.component.ts

Rol:

-   manejar creación, draft y enrich de oportunidad

Patrón visible:

1. trabaja con un formulario grande y un FormArray de products
2. carga master data
3. abre un modal para búsqueda de cliente RDR
4. convierte el formulario en FieldDto[] para enviar al backend
5. oculta el panel de detalle emitiendo viewDetail = false

### NbcProcessAndApprovalComponent

Archivo:

-   src/app/features/task-detail/components/nbc-process-and-approval/nbc-process-and-approval.component.ts

Rol:

-   manejar checklist NBC y validaciones relacionadas

Patrón visible:

1. usa validadores requeridos y requiredFalse en isProspect
2. lee businessData para completar parte de la vista
3. sincroniza cambios con TaskStatusService

### FormalizationOpportunityComponent

Archivo:

-   src/app/features/task-detail/components/formalization-opportunity/formalization-opportunity.component.ts

Rol:

-   formulario de cierre/finalización con checks obligatorios

Patrón visible:

1. validaciones simples pero estrictas
2. sincronización estándar con TaskStatusService
3. rehidratación de datos previos usando mapFieldsToPatch y normalizePatchBooleans

## Acciones centralizadas en el padre

Aunque los formularios están repartidos, las acciones finales viven en TaskDetailComponent.

Acciones principales:

1. releaseTask()
2. saveTask()
3. completeTask()
4. sendNotification()
5. sendToReview()
6. onCancel()
7. onNoAuthorize()
8. onLostOpportunity()
9. onCancelOpportunity()
10. onAuthorize()

Esto impone una arquitectura clara:

1. los hijos capturan y validan datos
2. el padre ejecuta las transiciones BPM finales

## Botonera y reglas de visibilidad

La visibilidad de acciones se resuelve con getters del contenedor:

1. showRejectButton
2. showAcceptButton
3. showLostOpportunityButton
4. showNegotiationFinishedButton
5. showSendToReviewButton
6. showCancelOpportunityButton
7. showConfirmButton

Estas reglas dependen de TaskType y de agrupaciones internas como NEGOTIATION_TASKS y SPECIAL_TASKS.

Eso evita replicar reglas de botones en cada componente hijo, pero concentra lógica de negocio en el contenedor.

## Flujo de comentarios

Task-detail maneja también comentarios a nivel de tarea y de businessData.

Flujo real:

1. el usuario agrega comentario desde app-comment-text-area
2. el padre crea un comentario temporal local
3. llama a addComment para la task
4. llama también a addBusinessDataComment para la oportunidad
5. si falla la primera llamada, revierte el comentario temporal

Este es otro ejemplo de lógica transversal que quedó centralizada en el contenedor.

## Relación con el interceptor global

Task-detail es uno de los principales consumidores del interceptor de errores porque dispara múltiples llamadas HTTP desde:

1. TaskDetailComponent
2. MasterDataService
3. SearchRDRService
4. componentes como pricing-approvals, stepper-modal o new-opportunity
5. detail-templates, que además inyecta businessData en TaskStatusService

Por eso la complejidad visible del módulo no es solo de formularios, sino también de coordinación de varios flujos HTTP.

## Por qué este módulo es complejo

La complejidad no viene de un único algoritmo, sino de la combinación de varios factores:

1. render dinámico por TaskType
2. múltiples formularios heterogéneos
3. agregación centralizada de estado en TaskStatusService
4. traducción entre formularios Angular y DTOs BPM
5. dependencia de route params, selectedTask, task detail y businessData
6. reglas de botones y transiciones BPM centralizadas en el padre
7. integración con shared a través de detail-templates

## Resumen

Task-detail es un micro-sistema dentro de la aplicación. TaskDetailComponent funciona como orquestador. Los componentes hijos se especializan por tipo de tarea y delegan estado en TaskStatusService. Ese servicio agrega formularios, conserva contexto y traduce estructuras al formato BPM. Además, parte del estado crítico se hidrata desde DetailTemplatesComponent, que vive en shared pero alimenta el flujo del módulo. Por eso task-detail es la zona con mayor densidad técnica y funcional del proyecto.
