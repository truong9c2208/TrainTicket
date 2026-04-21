const { PrismaClient, SeatType, TicketStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const stationNames = [
  { code: 'HNO', name: 'Ha Noi' },
  { code: 'NDI', name: 'Nam Dinh' },
  { code: 'THB', name: 'Thai Binh' },
  { code: 'NBI', name: 'Ninh Binh' },
  { code: 'THH', name: 'Thanh Hoa' },
  { code: 'VIN', name: 'Vinh' },
  { code: 'DNG', name: 'Da Nang' },
  { code: 'QNG', name: 'Quang Ngai' },
  { code: 'QNH', name: 'Quy Nhon' },
  { code: 'NTG', name: 'Nha Trang' },
  { code: 'PTN', name: 'Phan Thiet' },
  { code: 'SGN', name: 'Sai Gon' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSegment(maxOrder) {
  const fromOrder = randomInt(1, maxOrder - 1);
  const toOrder = randomInt(fromOrder + 1, maxOrder);
  return { fromOrder, toOrder };
}

async function resetData() {
  await prisma.ticket.deleteMany();
  await prisma.segmentPrice.deleteMany();
  await prisma.tripStation.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.train.deleteMany();
  await prisma.station.deleteMany();
}

async function main() {
  await resetData();

  const user = await prisma.user.upsert({
    where: { email: 'demo.user@train.local' },
    update: {},
    create: {
      email: 'demo.user@train.local',
      fullName: 'Demo User',
      passwordHash: '$2b$10$MCf6x9WceMjeA5xAAsbEV.SvHF6E53P7IvrQj6MKf5H8pxf3gDO/e',
    },
  });

  const stations = [];
  for (const station of stationNames) {
    const created = await prisma.station.create({ data: station });
    stations.push(created);
  }

  const train = await prisma.train.create({
    data: {
      code: 'SE-SEED-01',
      name: 'Vietnam North-South Express',
      coaches: {
        create: Array.from({ length: 5 }).map((_, coachIndex) => ({
          code: `C${coachIndex + 1}`,
          index: coachIndex + 1,
          seats: {
            create: Array.from({ length: 10 }).map((__, seatIndex) => ({
              number: `${coachIndex + 1}${String(seatIndex + 1).padStart(2, '0')}`,
              type: seatIndex < 7 ? SeatType.SEAT : SeatType.BED,
            })),
          },
        })),
      },
    },
    include: {
      coaches: {
        include: {
          seats: true,
        },
      },
    },
  });

  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 1);
  departureDate.setHours(6, 0, 0, 0);

  const trip = await prisma.trip.create({
    data: {
      trainId: train.id,
      code: 'TRIP-SEED-01',
      departureDate,
    },
  });

  for (let i = 0; i < stations.length; i++) {
    const stationTime = new Date(departureDate.getTime() + i * 1000 * 60 * 120);
    await prisma.tripStation.create({
      data: {
        tripId: trip.id,
        stationId: stations[i].id,
        stationOrder: i + 1,
        arrivalTime: i === 0 ? null : stationTime,
        departureTime: i === stations.length - 1 ? null : new Date(stationTime.getTime() + 1000 * 60 * 5),
      },
    });
  }

  for (let from = 0; from < stations.length - 1; from++) {
    for (let to = from + 1; to < stations.length; to++) {
      await prisma.segmentPrice.create({
        data: {
          tripId: trip.id,
          fromStationId: stations[from].id,
          toStationId: stations[to].id,
          priceCents: 50000 + (to - from) * 15000,
        },
      });
    }
  }

  const allSeats = train.coaches.flatMap((coach) => coach.seats);
  const seatCount = allSeats.length;
  const maxOrder = stations.length;

  for (let i = 0; i < seatCount; i++) {
    const seat = allSeats[i];

    if (Math.random() < 0.45) {
      continue;
    }

    const { fromOrder, toOrder } = pickSegment(maxOrder);
    const fromStation = stations[fromOrder - 1];
    const toStation = stations[toOrder - 1];

    const segmentPrice = await prisma.segmentPrice.findUnique({
      where: {
        tripId_fromStationId_toStationId: {
          tripId: trip.id,
          fromStationId: fromStation.id,
          toStationId: toStation.id,
        },
      },
      select: { priceCents: true },
    });

    await prisma.ticket.create({
      data: {
        userId: user.id,
        tripId: trip.id,
        seatId: seat.id,
        fromStationId: fromStation.id,
        toStationId: toStation.id,
        fromOrder,
        toOrder,
        status: TicketStatus.BOOKED,
        priceCents: segmentPrice?.priceCents ?? 50000,
      },
    });
  }

  console.log('Seed complete:');
  console.log(`- Stations: ${stations.length}`);
  console.log(`- Seats: ${seatCount}`);
  console.log('- Trip: 1');
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
