-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `status` ENUM('CANCELLED', 'PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED') NOT NULL DEFAULT 'CONFIRMED';
