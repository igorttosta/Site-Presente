-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_album_id_fkey";

-- AlterTable
ALTER TABLE "albums" ADD COLUMN     "ordem" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
