using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SubastaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AUDIT_LOG",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ACTION = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PERFORMED_BY = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    DETAILS = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    TIMESTAMP = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AUDIT_LOG", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "CATEGORY",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NAME = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CATEGORY", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "USER",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EMAIL = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    NAME = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PASSWORD_HASH = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_USER", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "AUCTION",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SELLER_ID = table.Column<int>(type: "integer", nullable: false),
                    CATEGORY_ID = table.Column<int>(type: "integer", nullable: false),
                    TITLE = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    STARTING_PRICE = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CURRENT_PRICE = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    START_DATE = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    END_DATE = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    STATUS = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    VERSION = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AUCTION", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AUCTION_CATEGORY_CATEGORY_ID",
                        column: x => x.CATEGORY_ID,
                        principalTable: "CATEGORY",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AUCTION_USER_SELLER_ID",
                        column: x => x.SELLER_ID,
                        principalTable: "USER",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WALLET",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    USER_ID = table.Column<int>(type: "integer", nullable: false),
                    TOTAL_BALANCE = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LOCKED_BALANCE = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AVAILABLE_BALANCE = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    VERSION = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WALLET", x => x.ID);
                    table.ForeignKey(
                        name: "FK_WALLET_USER_USER_ID",
                        column: x => x.USER_ID,
                        principalTable: "USER",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BID",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AUCTION_ID = table.Column<int>(type: "integer", nullable: false),
                    BIDDER_ID = table.Column<int>(type: "integer", nullable: false),
                    AMOUNT = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BID", x => x.ID);
                    table.ForeignKey(
                        name: "FK_BID_AUCTION_AUCTION_ID",
                        column: x => x.AUCTION_ID,
                        principalTable: "AUCTION",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BID_USER_BIDDER_ID",
                        column: x => x.BIDDER_ID,
                        principalTable: "USER",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TRANSACTION_LEDGER",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WALLET_ID = table.Column<int>(type: "integer", nullable: false),
                    AMOUNT = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TYPE = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DESCRIPTION = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CREATED_AT = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TRANSACTION_LEDGER", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TRANSACTION_LEDGER_WALLET_WALLET_ID",
                        column: x => x.WALLET_ID,
                        principalTable: "WALLET",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AUCTION_CATEGORY_ID",
                table: "AUCTION",
                column: "CATEGORY_ID");

            migrationBuilder.CreateIndex(
                name: "IX_AUCTION_SELLER_ID",
                table: "AUCTION",
                column: "SELLER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_BID_AUCTION_ID",
                table: "BID",
                column: "AUCTION_ID");

            migrationBuilder.CreateIndex(
                name: "IX_BID_BIDDER_ID",
                table: "BID",
                column: "BIDDER_ID");

            migrationBuilder.CreateIndex(
                name: "IX_TRANSACTION_LEDGER_WALLET_ID",
                table: "TRANSACTION_LEDGER",
                column: "WALLET_ID");

            migrationBuilder.CreateIndex(
                name: "IX_USER_EMAIL",
                table: "USER",
                column: "EMAIL",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WALLET_USER_ID",
                table: "WALLET",
                column: "USER_ID",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AUDIT_LOG");

            migrationBuilder.DropTable(
                name: "BID");

            migrationBuilder.DropTable(
                name: "TRANSACTION_LEDGER");

            migrationBuilder.DropTable(
                name: "AUCTION");

            migrationBuilder.DropTable(
                name: "WALLET");

            migrationBuilder.DropTable(
                name: "CATEGORY");

            migrationBuilder.DropTable(
                name: "USER");
        }
    }
}
