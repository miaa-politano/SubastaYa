using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SubastaYa.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuctionSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "START_DATE",
                table: "AUCTION",
                newName: "START_DATE_UTC");

            migrationBuilder.RenameColumn(
                name: "END_DATE",
                table: "AUCTION",
                newName: "END_DATE_UTC");

            migrationBuilder.AddColumn<int>(
                name: "CURRENT_WINNER_ID",
                table: "AUCTION",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MIN_INCREMENT",
                table: "AUCTION",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 10m);

            migrationBuilder.AlterColumn<string>(
                name: "TITLE",
                table: "AUCTION",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "DESCRIPTION",
                table: "AUCTION",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000);

            // PostgreSQL requires explicit USING when casting from xid to bigint
            migrationBuilder.Sql("ALTER TABLE \"AUCTION\" ALTER COLUMN \"VERSION\" TYPE bigint USING \"VERSION\"::text::bigint;");
            migrationBuilder.Sql("ALTER TABLE \"AUCTION\" ALTER COLUMN \"VERSION\" SET DEFAULT 0;");

            migrationBuilder.Sql("ALTER TABLE \"WALLET\" ALTER COLUMN \"VERSION\" TYPE bigint USING \"VERSION\"::text::bigint;");
            migrationBuilder.Sql("ALTER TABLE \"WALLET\" ALTER COLUMN \"VERSION\" SET DEFAULT 0;");

            migrationBuilder.CreateIndex(
                name: "IX_AUCTION_CURRENT_WINNER_ID",
                table: "AUCTION",
                column: "CURRENT_WINNER_ID");

            migrationBuilder.AddForeignKey(
                name: "FK_AUCTION_USER_CURRENT_WINNER_ID",
                table: "AUCTION",
                column: "CURRENT_WINNER_ID",
                principalTable: "USER",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AUCTION_USER_CURRENT_WINNER_ID",
                table: "AUCTION");

            migrationBuilder.DropIndex(
                name: "IX_AUCTION_CURRENT_WINNER_ID",
                table: "AUCTION");

            migrationBuilder.DropColumn(
                name: "CURRENT_WINNER_ID",
                table: "AUCTION");

            migrationBuilder.DropColumn(
                name: "MIN_INCREMENT",
                table: "AUCTION");

            migrationBuilder.RenameColumn(
                name: "START_DATE_UTC",
                table: "AUCTION",
                newName: "START_DATE");

            migrationBuilder.RenameColumn(
                name: "END_DATE_UTC",
                table: "AUCTION",
                newName: "END_DATE");

            migrationBuilder.Sql("ALTER TABLE \"AUCTION\" ALTER COLUMN \"VERSION\" TYPE xid USING \"VERSION\"::text::xid;");
            migrationBuilder.Sql("ALTER TABLE \"WALLET\" ALTER COLUMN \"VERSION\" TYPE xid USING \"VERSION\"::text::xid;");
        }
    }
}
