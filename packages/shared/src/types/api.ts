export type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

export type Station = {
  id: string;
  code: string;
  name: string;
};

export type TripStation = {
  stationId: string;
  stationOrder: number;
  arrivalTime?: string | null;
  departureTime?: string | null;
  station: Station;
};

export type Trip = {
  id: string;
  code: string;
  departureDate: string;
  fromStationName?: string;
  toStationName?: string;
  train: {
    id: string;
    code: string;
    name: string;
  };
  stations: TripStation[];
};

export type SeatAvailability = {
  seatId: string;
  coachId: string;
  coachCode: string;
  coachIndex: number;
  seatNumber: string;
  seatType: 'SEAT' | 'BED';
  available: boolean;
};

export type AvailableSeatsResponse = {
  tripId: string;
  from: string;
  to: string;
  priceCents: number;
  seats: SeatAvailability[];
  availableSeats: SeatAvailability[];
};

export type Ticket = {
  id: string;
  tripId: string;
  seatId: string;
  fromStationId: string;
  toStationId: string;
  status: 'BOOKED' | 'CANCELED';
  priceCents: number;
  refundCents?: number | null;
  bookedAt: string;
  canceledAt?: string | null;
  fromStation: Station;
  toStation: Station;
  seat: {
    number: string;
    type: 'SEAT' | 'BED';
    coach: {
      code: string;
    };
  };
  trip: {
    code: string;
    departureDate: string;
  };
};
