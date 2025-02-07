-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isLaunched" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "thumbnailPath" DROP NOT NULL;
