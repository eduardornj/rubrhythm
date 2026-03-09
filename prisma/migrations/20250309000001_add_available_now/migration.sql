-- AlterTable
ALTER TABLE `Listing` ADD COLUMN `availableNow` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Listing` ADD COLUMN `availableUntil` DATETIME(3) NULL;
