-- CreateTable
CREATE TABLE "spotify_token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "refresh_token" TEXT NOT NULL,
    "atualizado_em" DATETIME NOT NULL
);
