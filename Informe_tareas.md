# Informe de implementación del refactor Java–C#

## 1. Alcance y resultado final

La implementación se realizó sobre la rama:

`refactor/java-dotnet-event-bridge`

La rama parte de `feature/frontend-catalog-integration`, que a su vez contiene la línea de trabajo de `develop` y conserva el commit previo de integración del catálogo. Se respetó el historial existente y cada bloque funcional se registró en un commit separado.

El resultado arquitectónico es el siguiente:

```text
                    operación de negocio
Frontend ───────────────────────► Java :8080
   │                                  │
   │                                  ├─ WALLET
   │                                  ├─ BID
   │                                  ├─ TRANSACTION_LEDGER
   │                                  └─ OUTBOX_EVENT
   │                                             │
   │                         PostgreSQL NOTIFY ──┘
   │                                             │
   │                                      C# :5273
   │                                  consumidor/polling
   │                                             │
   └──── SignalR /hubs/auction ◄────────────────┘
             navegadores conectados
```

La analogía utilizada para entenderlo es la de una oficina con dos empleados. Java es el empleado que tiene autorización para modificar el dinero y registrar la operación. `OUTBOX_EVENT` es el libro de despacho: Java anota allí qué ocurrió dentro de la misma operación en la que modificó la wallet. C# no vuelve a decidir el importe; lee ese libro, transforma la anotación en una notificación y la entrega por SignalR a los navegadores.

Java queda como propietario de las operaciones financieras. C# queda como distribuidor de eventos hacia la interfaz y como lector de la información necesaria para hacerlo. `NOTIFY/LISTEN` funciona como un timbre: avisa que apareció una anotación, pero el libro sigue siendo la fuente confiable porque el timbre no conserva mensajes cuando un empleado está ausente.

## 2. Tareas realizadas

### Tarea 1 — Integración funcional del frontend

Commit: `cc26565 feat(frontend): integrate catalog and auction ux`

Esta tarea conserva los cambios existentes de frontend como un commit independiente antes de comenzar el refactor de backend.

Archivos bajo `./SubastaYA/`:

- `./SubastaYA/frontend/src/App.jsx`: coordina la aplicación, carga catálogo y wallet, crea subastas y envía pujas al endpoint Java mediante `/api`.
- `./SubastaYA/frontend/src/Hooks/useCountdown.js`: concentra el cálculo regresivo del tiempo restante de una subasta.
- `./SubastaYA/frontend/src/Services/AuctionHub.js`: crea la conexión SignalR, registra callbacks y se suscribe al grupo de una subasta.
- `./SubastaYA/frontend/src/components/Auction/AuctionCard.jsx`: muestra la información resumida y el tiempo restante de cada subasta.
- `./SubastaYA/frontend/src/components/Auction/AuctionCreationModal.jsx`: valida y envía el formulario de creación.
- `./SubastaYA/frontend/src/components/Auction/AuctionRoom.jsx`: muestra la sala, precio actual, historial y controles de puja.
- `./SubastaYA/frontend/src/components/Wallet/Wallet.jsx`: consulta y muestra el saldo por medio de Java.
- `./SubastaYA/frontend/vite.config.js`: mantiene el proxy `/api` hacia Java y `/hubs` hacia C#.

El punto importante es que Vite no ejecuta reglas de negocio. Solo actúa como un recepcionista que deriva `/api` a Java y `/hubs` a C#. La decisión financiera continúa en el backend Java.

### Tarea 2 — Persistencia de Outbox en Java

Commit: `c0682af feat(java): add outbox event persistence`

Archivos nuevos:

- `./SubastaYA/microservice-java/src/main/java/org/example/domain/entities/OutboxEvent.java`
  - Representa una fila de `OUTBOX_EVENT`.
  - Sus campos identifican tipo de evento, agregado relacionado, payload JSON, fechas, estado, cantidad de reintentos y último error.
  - Sus getters y setters permiten que JPA persista y reconstruya la fila.

- `./SubastaYA/microservice-java/src/main/java/org/example/domain/repositories/OutboxEventRepository.java`
  - Extiende el repositorio JPA.
  - `findByStatusOrderByCreatedAtUtcAsc(...)` permite consultar eventos pendientes ordenados por antigüedad.

- `./SubastaYA/microservice-java/src/main/java/org/example/service/OutboxEventService.java`
  - Define la operación `enqueue(...)`.
  - Esta abstracción evita que los servicios de wallet y subasta conozcan detalles de JPA o de serialización.

- `./SubastaYA/microservice-java/src/main/java/org/example/service/impl/OutboxEventServiceImpl.java`
  - Convierte el mapa de datos en JSON utilizando `ObjectMapper`.
  - Crea el evento en estado `PENDING` y con contador de reintentos cero.
  - `enqueue(...)` se ejecuta dentro de una transacción, por lo que el evento acompaña a la operación que lo originó.

Archivo modificado:

- `./SubastaYA/microservice-java/src/main/resources/schema.sql`
  - Crea la tabla `OUTBOX_EVENT`.
  - Agrega índice por estado y fecha para que el consumidor encuentre rápidamente los eventos pendientes.

El beneficio es equivalente a escribir primero una orden en el libro de despacho antes de cerrar la caja: si se confirma la operación financiera, también queda registrada la tarea de notificación.

### Tarea 3 — Eventos de cambios de wallet

Commit: `6fb491f feat(java): publish wallet deposit events`

Archivo modificado:

- `./SubastaYA/microservice-java/src/main/java/org/example/service/impl/WalletServiceImpl.java`
  - El constructor recibe `OutboxEventService`.
  - `depositFunds(...)` guarda el nuevo saldo y el movimiento del ledger.
  - Después registra `WalletBalanceChanged` con usuario, total, saldo bloqueado, saldo disponible y motivo `DEPOSIT`.
  - Si la transacción falla, el evento tampoco queda confirmado.

Esto resuelve el caso en el que Java cambia dinero pero C# necesita enterarse para informar a la interfaz.

### Tarea 4 — Eventos de puja, sobrepuja y anti-sniping

Commit: `33e797c feat(java): publish bidding domain events`

Archivos modificados:

- `./SubastaYA/microservice-java/src/main/java/org/example/service/impl/AuctionServiceImpl.java`
  - El constructor recibe `OutboxEventService`.
  - `placeBid(...)` conserva la validación de subasta activa, vencimiento, incremento mínimo y garantía de wallet.
  - `wasExtended` registra si la puja activó anti-sniping.
  - Luego de guardar la subasta, genera `AuctionBidPlaced` con subasta, pujador, importe, ganador anterior y fecha.
  - Si había ganador anterior, genera `OutbidNotification` con el usuario superado y el nuevo importe.
  - Si se extendió el cierre, genera `AuctionTimeExtended` con la nueva fecha y motivo.
  - Todos los eventos se crean dentro de la transacción de la puja.

- `./SubastaYA/microservice-java/src/main/java/org/example/service/impl/WalletServiceImpl.java`
  - `processBidGuarantee(...)` genera `WalletBalanceChanged` al devolver fondos al usuario superado.
  - Genera otro evento al bloquear fondos del nuevo líder.
  - Los motivos permiten diferenciar `OUTBID_REFUND` de `BID_LOCK` sin interpretar texto libre.

La puja funciona como una sola factura: modifica la subasta, mueve fondos, registra ledger y escribe sus avisos. Si una parte falla antes del commit, Java revierte el conjunto completo.

### Tarea 5 — Consumidor Outbox en C#

Commit: `43763b7 feat(dotnet): consume outbox events`

Archivos nuevos:

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventRecord.cs`
  - Es el modelo de lectura usado por C# para transportar una fila de Outbox.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/IOutboxEventHandler.cs`
  - Define `HandleAsync(...)`, separando lectura de evento y acción resultante.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventConsumer.cs`
  - Es un `BackgroundService` ejecutado por la API.
  - `ExecuteAsync(...)` mantiene el ciclo de consumo.
  - `ConsumeBatchAsync(...)` abre un ámbito de dependencias, obtiene la conexión EF y procesa lotes.
  - `ReadPendingEventsAsync(...)` lee eventos ordenados.
  - `TryStartProcessingAsync(...)` cambia atómicamente `PENDING` por `PROCESSING`; esto evita que dos consumidores tomen el mismo evento.
  - `MarkProcessedAsync(...)` establece `PROCESSED` y la fecha de procesamiento.
  - `MarkFailedAsync(...)` guarda el mensaje de error y aumenta el contador.
  - `AddParameter(...)` agrega parámetros sin concatenar valores en SQL.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventHandler.cs` fue utilizado inicialmente como manejador de validación/log y luego reemplazado por el publicador real en la tarea 6.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Program.cs`
  - Registra el consumidor como servicio hospedado.

En esta etapa C# ya puede leer y marcar eventos, aunque la acción final todavía estaba aislada detrás de la interfaz. Es como un empleado que retira una orden del libro y deja constancia de que la tomó.

### Tarea 6 — Traducción Outbox a SignalR

Commit: `ba21706 feat(events): publish outbox notifications through signalr`

Archivos modificados o nuevos:

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventPublisher.cs`
  - Deserializa el payload JSON.
  - Selecciona la acción según `EventType`.
  - Traduce `AuctionBidPlaced` a una notificación de nueva puja.
  - Traduce `AuctionTimeExtended` a extensión de cierre.
  - Traduce `OutbidNotification` a aviso de usuario superado.
  - Traduce `WalletBalanceChanged` a actualización de saldo.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionHubClient.cs`
  - Declara los mensajes que SignalR puede enviar a los navegadores.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionNotificationService.cs`
  - Declara las operaciones de publicación utilizadas por el publicador.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Hubs/AuctionNotificationService.cs`
  - Envía pujas y extensiones al grupo `Auction_{id}`.
  - Envía cambios de wallet al grupo `User_{id}`.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Hubs/AuctionHub.cs`
  - Conserva `JoinAuctionGroup` y `LeaveAuctionGroup`.
  - Agrega `JoinUserGroup` y `LeaveUserGroup`.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Program.cs`
  - Cambia el manejador registrado por `OutboxEventPublisher`.

- `./SubastaYA/frontend/src/Services/AuctionHub.js`
  - Registra callbacks para sobrepujas y cambios de wallet.
  - Reingresa al grupo de subasta y al grupo de usuario después de reconectar.

- `./SubastaYA/frontend/src/Hooks/useAuctionSocket.js`
  - Pasa el `currentUserId` a la conexión para que el navegador pueda unirse a su grupo.
  - Se corrigió la lista de dependencias del efecto para recrear la conexión si cambia el usuario.

### Tarea 7 — Reintentos y recuperación

Commit: `b298b48 feat(events): add outbox retry and lease recovery`

Archivos modificados:

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventConsumer.cs`
  - Define un máximo de cinco reintentos.
  - Lee estados `PENDING` y `FAILED` que todavía no agotaron el límite.
  - Guarda `PROCESSING_AT_UTC` al tomar un evento.
  - Reencola eventos que quedaron en `PROCESSING` más de cinco minutos, suponiendo que el proceso se cayó.
  - Marca como `FAILED` definitivo solo después del quinto intento.
  - La condición de actualización exige el estado esperado, lo que funciona como una barrera de idempotencia operativa.

- `./SubastaYA/microservice-java/src/main/java/org/example/domain/entities/OutboxEvent.java`
  - Agrega el campo `processingAtUtc` para que JPA conozca la nueva columna.

- `./SubastaYA/microservice-java/src/main/resources/schema.sql`
  - Agrega `PROCESSING_AT_UTC`.

Idempotencia significa que procesar dos veces el mismo identificador no debe volver a ejecutar una operación financiera. Java no vuelve a descontar dinero porque C# nunca llama a los servicios financieros: solo cambia el estado técnico del evento y publica. La notificación puede tener duplicación en el caso extremo de una caída justo después de enviar por SignalR y antes de marcar `PROCESSED`; por eso el diseño mantiene la operación financiera separada y reintentable.

### Tarea 8 — Eliminación de endpoints financieros duplicados

Commit: `4d3630c refactor(dotnet): remove duplicate financial endpoints`

Se eliminaron porque duplicaban responsabilidades de Java:

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Controllers/AuctionsController.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Controllers/BidsController.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Controllers/WalletsController.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IBidService.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IWalletService.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Infrastructure/Services/BidService.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Infrastructure/Services/WalletService.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Contracts/AuctionContracts.cs`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Contracts/WalletContracts.cs`

También se quitaron sus registros de `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Program.cs`.

Esto evita que existan dos caminos para `POST /auctions/{id}/bids`, depósitos o bloqueos. Los GET simulados también se eliminaron porque devolvían saldos vacíos o subastas ficticias, lo cual era más peligroso que no exponerlos: aparentaban ser datos reales.

### Tarea 9 — Roles de PostgreSQL

Commit: `6e811b6 feat(database): separate java and dotnet roles`

Archivos:

- `./SubastaYA/backend/SubastaYa/database/init/01-roles.sql`
  - Crea `subastaya_java` y `subastaya_dotnet` si no existen.
  - Java recibe permiso de conexión, uso y creación del esquema.
  - C# recibe uso del esquema y privilegios de lectura por defecto.

- `./SubastaYA/backend/SubastaYa/docker-compose.yml`
  - Monta el directorio de inicialización de roles dentro de PostgreSQL.

- `./SubastaYA/microservice-java/src/main/resources/application.properties`
  - Java conecta con `subastaya_java`.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/appsettings.json`
- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/appsettings.Development.json`
  - C# conecta con `subastaya_dotnet`.

- `./SubastaYA/microservice-java/src/main/resources/schema.sql`
  - Otorga lectura a C# sobre las tablas.
  - Otorga a C# actualización únicamente de `STATUS`, `PROCESSED_AT_UTC`, `PROCESSING_AT_UTC`, `RETRY_COUNT` y `LAST_ERROR` de `OUTBOX_EVENT`.

La separación es física: aunque alguien agregara accidentalmente un `UPDATE` financiero en C#, PostgreSQL debe rechazarlo por permisos. Para aplicar los scripts en una instalación ya existente es necesario inicializar el volumen de PostgreSQL nuevamente, porque los scripts de `/docker-entrypoint-initdb.d` se ejecutan solo al crear el volumen.

### Tarea 10 — NOTIFY/LISTEN como acelerador

Commit: `c7376de feat(events): add postgres notify wakeup`

Archivos:

- `./SubastaYA/microservice-java/src/main/java/org/example/service/impl/OutboxEventServiceImpl.java`
  - Después de guardar el evento, ejecuta `pg_notify('subastaya_outbox', eventId)` dentro de la transacción Java.
  - Si la transacción se revierte, PostgreSQL no entrega la notificación.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/SubastaYa.Api.csproj`
  - Agrega la dependencia directa `Npgsql` para poder abrir una conexión dedicada de escucha.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventSignalListener.cs`
  - Abre la conexión C#.
  - Ejecuta `LISTEN subastaya_outbox`.
  - Registra cada aviso recibido.
  - Mantiene la conexión esperando señales.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Program.cs`
  - Registra el listener como servicio hospedado.

`NOTIFY` no reemplaza al polling. Si C# estaba detenido cuando Java emitió el aviso, el aviso no queda almacenado. Por eso `OutboxEventConsumer` continúa consultando la tabla: el timbre acelera la reacción, pero el libro permite recuperar lo que no se escuchó.

### Tarea 11 — Revisión final de integración

Commit: `341cfed fix(signalr): preserve bidder identity in bid events`

Archivos modificados:

- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionHubClient.cs`
  - `ReceiveNewBid(...)` ahora transmite también `bidderId`.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionNotificationService.cs`
  - `NotifyNewBidAsync(...)` recibe el identificador numérico, en vez de tratarlo como si fuera un nombre.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Hubs/AuctionNotificationService.cs`
  - Envía el identificador como quinto argumento de SignalR.

- `./SubastaYA/backend/SubastaYa/SubastaYa.Api/Events/OutboxEventPublisher.cs`
  - Lee `bidderId` del JSON y lo conserva durante toda la traducción.

Esta revisión evita una comparación incorrecta en el frontend: un ID numérico no debe confundirse con un nombre de usuario textual. El callback JavaScript ya acepta ese quinto argumento y puede identificar correctamente si la puja pertenece al usuario conectado.

## 3. Verificaciones realizadas

- Compilación completa de las clases Java mediante `javac` con todas las dependencias Maven locales: aprobada.
- `npm run lint`: aprobado sin errores ni advertencias.
- `npm run build`: aprobado.
- `git diff --check`: aprobado en cada revisión previa a commit.
- `dotnet build`: no pudo completarse por el entorno local. El SDK disponible es `11.0.100-rc.3`, pero falta el runtime `Microsoft.NETCore.App` requerido para `net9.0`; el error es de instalación del entorno, no una falla de compilación reportada por el código fuente.

## 4. Secuencia operativa completa

```text
1. Usuario confirma una puja en el frontend.
2. Vite deriva /api/auctions/{id}/bids a Java.
3. Java valida subasta, saldo, monto e instante de cierre.
4. Java modifica AUCTION, WALLET y TRANSACTION_LEDGER.
5. Java agrega AuctionBidPlaced, OutbidNotification y eventos de wallet a OUTBOX_EVENT.
6. PostgreSQL confirma todo junto o revierte todo junto.
7. PostgreSQL emite NOTIFY después de la confirmación.
8. C# recibe la señal o encuentra el evento mediante polling.
9. C# cambia el evento a PROCESSING.
10. C# deserializa el JSON y llama a la operación SignalR correspondiente.
11. SignalR distribuye el evento al grupo de subasta o usuario.
12. C# marca PROCESSED; si falla, reintenta hasta cinco veces.
```

La regla central queda establecida: Java decide y confirma el negocio; C# comunica el resultado; el frontend visualiza el resultado y no ejecuta movimientos financieros.
