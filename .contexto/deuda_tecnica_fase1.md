# Deuda técnica - Fase 1

Fecha: 2026-11-06
Rama: `feature/csharp-signalr-relay`

## Estado de la fase

La configuración inicial de .NET, Entity Framework Core y concurrencia optimista quedó alineada a nivel de modelo:

- `Auction.Version` y `Wallet.Version` conservan el tipo de dominio `uint`.
- PostgreSQL utiliza `bigint` mediante conversión explícita.
- `Auction` y `Wallet` utilizan `IsConcurrencyToken()`.
- El snapshot de EF Core coincide con las configuraciones actuales.
- `has-pending-model-changes` finaliza correctamente.
- La solución compila sin errores.

## Pendientes técnicos

### 1. Duplicación de endpoints de pujas

Actualmente existen dos rutas equivalentes para registrar pujas:

- `AuctionsController`: endpoint mock `POST /api/auctions/{id}/bids`.
- `BidsController`: endpoint real `POST /api/auctions/{auctionId}/bids`.

Debe eliminarse el endpoint mock cuando el flujo de pujas pase definitivamente a Java.

### 2. Migración de reglas de negocio a Java

Al eliminar `ValidateBidEligibility` y `ApplyNewWinningBid`, el backend C# dejó de validar localmente:

- Estado de la subasta.
- Incremento mínimo.
- Autooferta del vendedor.
- Repetición de puja por parte del líder actual.

Estas reglas deben quedar implementadas y validadas en Java antes de retirar el flujo C# actual.

### 3. Respuesta HTTP de conflictos de billetera

`WalletService` captura `DbUpdateConcurrencyException` y la transforma en `InvalidOperationException`. Debe revisarse el mapeo para que las colisiones de concurrencia lleguen al cliente como `409 Conflict`, según la rúbrica.

### 4. Pruebas automatizadas

La solución no contiene proyectos de pruebas automatizadas. Deben agregarse pruebas para:

- Dos pujas concurrentes sobre la misma subasta.
- Dos modificaciones concurrentes de una billetera.
- Rollback completo ante conflictos.
- Incremento de `Version`.
- Rechazo de la segunda operación con `409 Conflict`.

### 5. Aplicación de migraciones

La migración `AlignVersionConcurrencyMapping` debe aplicarse y verificarse contra PostgreSQL en un entorno controlado. Es necesario confirmar el estado de `__EFMigrationsHistory` antes de ejecutar `Update-Database`.

### 6. Notificaciones posteriores al commit

Actualmente una notificación que falla después del commit puede propagarse como error HTTP aunque la operación contable ya haya sido confirmada. La Fase 3 debe desacoplar este flujo mediante el relay Java → C# → SignalR.

### 7. Validación de integración políglota

Antes de integrar Java, debe verificarse que:

- Java utilice `Long` para `@Version`.
- Hibernate mantenga `ddl-auto=validate` sin errores.
- Las tablas compartidas utilicen `bigint` para `VERSION`.
- EF Core y Hibernate puedan leer y actualizar el mismo esquema.

## Restricción de alcance

Estos pendientes no forman parte de la implementación actual de la Fase 1, salvo la preparación del mapeo de concurrencia. Deben resolverse en las fases posteriores indicadas por `Orden de proceso.pdf`.
