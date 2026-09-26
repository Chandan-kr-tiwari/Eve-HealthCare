/*
  Warnings:

  - A unique constraint covering the columns `[centreId,testId,appointmentTime]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Booking_centreId_testId_appointmentTime_key" ON "Booking"("centreId", "testId", "appointmentTime");
