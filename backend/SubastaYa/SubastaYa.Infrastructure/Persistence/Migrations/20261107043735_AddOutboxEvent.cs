using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubastaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxEvent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OUTBOX_EVENT",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EVENT_ID = table.Column<Guid>(type: "uuid", nullable: false),
                    EVENT_TYPE = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    AGGREGATE_ID = table.Column<long>(type: "bigint", nullable: false),
                    PAYLOAD_JSON = table.Column<string>(type: "text", nullable: false),
                    STATUS = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    ATTEMPTS = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    NEXT_ATTEMPT_AT = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CREATED_AT_UTC = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SENT_AT_UTC = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LAST_ERROR = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OUTBOX_EVENT", x => x.ID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OUTBOX_EVENT_EVENT_ID",
                table: "OUTBOX_EVENT",
                column: "EVENT_ID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OUTBOX_EVENT");
        }
    }
}
