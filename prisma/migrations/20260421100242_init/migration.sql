CREATE TYPE "SeatType" AS ENUM ('SEAT', 'BED');

CREATE TYPE "TicketStatus" AS ENUM ('BOOKED', 'CANCELED');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Train" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Train_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "SeatType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TripStation" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "stationOrder" INTEGER NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),

    CONSTRAINT "TripStation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SegmentPrice" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "fromStationId" TEXT NOT NULL,
    "toStationId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SegmentPrice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "fromStationId" TEXT NOT NULL,
    "toStationId" TEXT NOT NULL,
    "fromOrder" INTEGER NOT NULL,
    "toOrder" INTEGER NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'BOOKED',
    "priceCents" INTEGER NOT NULL,
    "refundCents" INTEGER,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "Station_code_key" ON "Station"("code");

CREATE UNIQUE INDEX "Train_code_key" ON "Train"("code");

CREATE INDEX "Coach_trainId_idx" ON "Coach"("trainId");

CREATE UNIQUE INDEX "Coach_trainId_code_key" ON "Coach"("trainId", "code");

CREATE UNIQUE INDEX "Coach_trainId_index_key" ON "Coach"("trainId", "index");

CREATE INDEX "Seat_coachId_idx" ON "Seat"("coachId");

CREATE UNIQUE INDEX "Seat_coachId_number_key" ON "Seat"("coachId", "number");

CREATE UNIQUE INDEX "Trip_code_key" ON "Trip"("code");

CREATE INDEX "Trip_trainId_departureDate_idx" ON "Trip"("trainId", "departureDate");

CREATE INDEX "TripStation_tripId_stationOrder_idx" ON "TripStation"("tripId", "stationOrder");

CREATE INDEX "TripStation_stationId_idx" ON "TripStation"("stationId");

CREATE UNIQUE INDEX "TripStation_tripId_stationOrder_key" ON "TripStation"("tripId", "stationOrder");

CREATE UNIQUE INDEX "TripStation_tripId_stationId_key" ON "TripStation"("tripId", "stationId");

CREATE INDEX "SegmentPrice_tripId_idx" ON "SegmentPrice"("tripId");

CREATE UNIQUE INDEX "SegmentPrice_tripId_fromStationId_toStationId_key" ON "SegmentPrice"("tripId", "fromStationId", "toStationId");

CREATE INDEX "Ticket_userId_status_idx" ON "Ticket"("userId", "status");

CREATE INDEX "Ticket_tripId_status_idx" ON "Ticket"("tripId", "status");

CREATE INDEX "Ticket_tripId_seatId_status_idx" ON "Ticket"("tripId", "seatId", "status");

CREATE INDEX "Ticket_tripId_fromOrder_toOrder_status_idx" ON "Ticket"("tripId", "fromOrder", "toOrder", "status");

ALTER TABLE "Coach" ADD CONSTRAINT "Coach_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Seat" ADD CONSTRAINT "Seat_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Trip" ADD CONSTRAINT "Trip_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TripStation" ADD CONSTRAINT "TripStation_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TripStation" ADD CONSTRAINT "TripStation_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SegmentPrice" ADD CONSTRAINT "SegmentPrice_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SegmentPrice" ADD CONSTRAINT "SegmentPrice_fromStationId_fkey" FOREIGN KEY ("fromStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SegmentPrice" ADD CONSTRAINT "SegmentPrice_toStationId_fkey" FOREIGN KEY ("toStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_fromStationId_fkey" FOREIGN KEY ("fromStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_toStationId_fkey" FOREIGN KEY ("toStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
