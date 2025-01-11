/*
  Warnings:

  - You are about to drop the column `description` on the `Painting` table. All the data in the column will be lost.
  - Added the required column `price` to the `Painting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Painting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Painting" DROP COLUMN "description",
ADD COLUMN     "isFramed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medium" TEXT NOT NULL DEFAULT 'oil',
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL;
