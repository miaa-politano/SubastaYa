# Deuda técnica - Fase 1 y relay C#

Fecha: 2026-11-06
Rama: `feature/csharp-signalr-relay`

## Estado resuelto

- `Auction.Version` y `Wallet.Version` conservan `uint` en el dominio.
- PostgreSQL usa `bigint` con `.HasConversion<long>()` y ambas propiedades son tokens de concurrencia.
- El snapshot de EF Core coincide con las configuraciones y no hay cambios de modelo pendientes.
- Se eliminó el endpoint mock duplicado de pujas.
- Se agregó el endpoint interno autenticado, relay idempotente y publicación SignalR por grupo.

## Pendientes técnicos

- La deduplicación actual usa `IEventDeduplicator` con una implementación en memoria por instancia. Evita un `HashSet` estático local y funciona para una única instancia, pero debe reemplazarse por Redis o una tabla con índice único antes de escalar horizontalmente.
- Java todavía debe enviar `eventId` y el header `X-Internal-Api-Key` al endpoint C#. El contrato C# acepta el UUID y rechaza eventos sin él; no se modificó Java para completar esa integración.
- Los saldos recibidos en eventos son informativos: C# los retransmite conceptualmente como parte del contrato, no los recalcula ni persiste. Java continúa siendo dueño de la lógica de negocio.
- El compose disponible en esta rama sólo define PostgreSQL. No se agregaron servicios ni redes adicionales porque el repositorio no contiene Dockerfiles para Java o C#; la comunicación de negocio se realiza mediante endpoints HTTP.
- El contrato SignalR conserva `ReceiveNewBid`, `AuctionTimeExtended` y `AuctionClosed` porque son los nombres consumidos por el frontend existente. La migración futura a nombres `ReceiveTimeExtended`/`ReceiveAuctionClosed` requiere coordinación con React y está fuera del alcance de Mateo.
- No hay proyectos de pruebas automatizadas en la solución. La compilación, `dotnet test` y la validación de migraciones fueron ejecutadas; las pruebas HTTP locales quedaron limitadas por la ausencia del certificado HTTPS de desarrollo y permisos del proveedor EventLog.

## Integración políglota pendiente

Antes de producción debe verificarse Java con `Long` para `VERSION`, Hibernate `ddl-auto=validate`, el esquema compartido y el envío de eventos después del commit. No se modificaron Java ni React en esta fase.
