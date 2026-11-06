# Relevamiento de tareas realizadas - Mateo

Fecha: 2026-11-06  
Rama: `feature/csharp-signalr-relay`

## Alcance respetado

- Se trabajó exclusivamente sobre backend C#, configuración permitida, Docker Compose y documentación.
- No se modificaron `microservice-java/` ni `frontend/`.
- No se modificaron componentes React, hooks React, clientes SignalR del frontend, `application.properties`, `Auction.java` ni `Wallet.java`.
- No se implementaron scheduler Java, Escrow, Anti-Sniping ni liquidación.
- No se realizaron commits.

## Infraestructura y concurrencia EF Core

Se verificó y conservó el mapeo existente:

- `Auction.Version` y `Wallet.Version` siguen siendo `uint`.
- Ambas propiedades mantienen `[ConcurrencyCheck]`.
- PostgreSQL utiliza `bigint`.
- EF Core utiliza `.HasConversion<long>()`.
- Ambas propiedades usan `.IsConcurrencyToken()`.
- No se utiliza `.IsRowVersion()` ni generación automática ficticia.
- El snapshot coincide con las configuraciones.
- `dotnet ef migrations has-pending-model-changes` informa que no hay cambios pendientes.
- Se mantuvo el incremento explícito de versión en pujas y operaciones de billetera.

## Limpieza del endpoint mock

Se eliminó de `AuctionsController` el endpoint mock:

```http
POST /api/auctions/{id}/bids
```

La respuesta fija con `status: "Accepted"` ya no existe. Se conserva únicamente el flujo real de `BidsController`, evitando dos endpoints con la misma ruta efectiva.

## Endpoint interno Java -> C#

Se agregaron:

- `AuctionEventRequest` como DTO fuertemente tipado.
- `InternalAuctionEventsController`.
- `IAuctionEventRelayService`.
- `AuctionEventRelayService`.
- `AuctionEventNotification`.

Ruta:

```http
POST /api/internal/auctions/notify-event
```

Características:

- Usa `CancellationToken`.
- Valida `eventId`, `auctionId`, `eventType` y `eventTimestampUtc`.
- Acepta únicamente `NewBid`, `Extended` y `Closed`.
- Rechaza payloads incompletos con `400 Bad Request`.
- Rechaza solicitudes sin API key con `401 Unauthorized`.
- Responde `202 Accepted`.
- Registra `eventId`, `auctionId` y `eventType` mediante logs estructurados.
- No consulta Java.
- No modifica saldos.
- No persiste datos financieros.
- No ejecuta reglas comerciales ni liquidaciones.

Header requerido:

```http
X-Internal-Api-Key: <valor de INTERNAL_API_KEY>
```

El secreto se obtiene desde configuración o desde la variable de entorno `INTERNAL_API_KEY`.

## Contrato JSON Java -> C#

Campos aceptados:

```json
{
  "eventId": "uuid",
  "auctionId": 1,
  "eventType": "NewBid",
  "newAmount": 150000.00,
  "bidderId": 2,
  "bidderUsername": "Comprador_1",
  "newEndDateUtc": "2026-11-06T18:30:00.000Z",
  "eventTimestampUtc": "2026-11-06T18:20:00.000Z",
  "availableBalance": 105000.00,
  "lockedBalance": 45000.00,
  "totalBalance": 150000.00,
  "auctionStatus": "ACTIVE",
  "winnerUsername": "Comprador_1"
}
```

Campos mínimos obligatorios:

- `eventId` como UUID no vacío.
- `auctionId` entero positivo.
- `eventType` válido.
- `eventTimestampUtc` con offset UTC `Z`.

Los campos financieros son informativos. C# los retransmite sin recalcularlos ni convertirse en dueño del negocio.

## Idempotencia

Se creó la abstracción `IEventDeduplicator` y la implementación `InMemoryEventDeduplicator`, basada en `ConcurrentDictionary` por instancia.

- Un evento repetido no vuelve a publicarse y responde `202` con `status: "Duplicate"`.
- No se utiliza un `HashSet` estático local.
- La implementación actual no es suficiente para múltiples réplicas; debe reemplazarse por Redis o una tabla con restricción única para escalamiento horizontal.

## Relay SignalR

`AuctionHub` permite:

- `JoinAuctionGroup`.
- `LeaveAuctionGroup`.

Valida que el identificador sea entero positivo y utiliza la convención:

```text
Auction_{auctionId}
```

La ruta configurada es:

```text
/hubs/auction
```

`AuctionNotificationService` publica exclusivamente al grupo correspondiente mediante:

```csharp
IHubContext<AuctionHub, IAuctionHubClient>
```

Eventos publicados hacia React, conservando los nombres existentes:

- `ReceiveNewBid`.
- `AuctionTimeExtended`.
- `AuctionClosed`.

No se publican eventos globales ni se mantienen subastas en memoria.

## Registro y configuración C#

En `Program.cs` se registraron:

- SignalR.
- `IAuctionNotificationService`.
- `IAuctionEventRelayService`.
- `IEventDeduplicator`.
- CORS para `http://localhost:5173` y `https://localhost:5173`.
- La ruta `/hubs/auction`.

No se usa `AllowAnyOrigin()` junto con credenciales.

## Docker Compose

`backend/SubastaYa/docker-compose.yml` no requiere cambios funcionales para esta fase y queda destinado únicamente a levantar PostgreSQL.

La comunicación entre Java y C# se realizará mediante endpoints HTTP. Si en el futuro ambos servicios se ejecutan dentro de Docker, deberá definirse entonces una red compartida y utilizar nombres de servicio en lugar de `localhost`.

## Archivos modificados

- `.contexto/deuda_tecnica_fase1.md`.
- `backend/SubastaYa/SubastaYa.Api/Controllers/AuctionsController.cs`.
- `backend/SubastaYa/SubastaYa.Api/Hubs/AuctionHub.cs`.
- `backend/SubastaYa/SubastaYa.Api/Hubs/AuctionNotificationService.cs`.
- `backend/SubastaYa/SubastaYa.Api/Program.cs`.
- `backend/SubastaYa/SubastaYa.Api/appsettings.json`.
- `backend/SubastaYa/SubastaYa.Api/appsettings.Development.json`.
- `backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionHubClient.cs`.
- `backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionNotificationService.cs`.

## Archivos creados

- `.contexto/Relevamiento_Tareas.md`.
- `backend/SubastaYa/SubastaYa.Api/Contracts/AuctionEventRequest.cs`.
- `backend/SubastaYa/SubastaYa.Api/Controllers/InternalAuctionEventsController.cs`.
- `backend/SubastaYa/SubastaYa.Domain/DTOs/AuctionEventNotification.cs`.
- `backend/SubastaYa/SubastaYa.Domain/Interfaces/IAuctionEventRelayService.cs`.
- `backend/SubastaYa/SubastaYa.Domain/Interfaces/IEventDeduplicator.cs`.
- `backend/SubastaYa/SubastaYa.Infrastructure/Services/AuctionEventRelayService.cs`.
- `backend/SubastaYa/SubastaYa.Infrastructure/Services/InMemoryEventDeduplicator.cs`.

## Validaciones ejecutadas

- `dotnet build backend/SubastaYa/SubastaYa.sln --no-restore`: correcto, 0 errores.
- `dotnet test backend/SubastaYa/SubastaYa.sln --no-restore`: finalizó correctamente; la solución no contiene proyectos de test automatizados.
- `dotnet ef migrations has-pending-model-changes ...`: sin cambios pendientes.
- `docker compose -f backend/SubastaYa/docker-compose.yml config`: correcto.
- `docker compose up --build`: no ejecutado porque Docker Desktop no tenía el daemon disponible.

## Problemas y deuda técnica

- Java aún debe enviar `eventId` y la API key según este contrato.
- La deduplicación debe migrarse a infraestructura distribuida antes de escalar horizontalmente.
- La prueba HTTP local quedó limitada por falta del certificado HTTPS de desarrollo y permisos del proveedor EventLog de Windows.
- La rama sólo dispone de Compose para PostgreSQL; faltan Dockerfiles de Java y C# para validar el entorno completo.
