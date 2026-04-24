export type AuthResponse = {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
};

export type Station = {
  id: number;
  code: string;
  name: string;
};

export type TripStation = {
  stationId: number;
  stationOrder: number;
  arrivalTime?: string | null;
  departureTime?: string | null;
  station: Station;
};

export type Trip = {
  id: number;
  code: string;
  departureDate: string;
  fromStationName?: string;
  toStationName?: string;
  train: {
    id: number;
    code: string;
    name: string;
  };
  stations: TripStation[];
};

export type SeatAvailability = {
  seatId: number;
  coachId: number;
  coachCode: string;
  coachIndex: number;
  seatNumber: string;
  seatType: 'SEAT' | 'BED';
  available: boolean;
};

export type AvailableSeatsResponse = {
  tripId: number;
  from: number;
  to: number;
  priceCents: number;
  seats: SeatAvailability[];
  availableSeats: SeatAvailability[];
};

export type Ticket = {
  id: number;
  tripId: number;
  seatId: number;
  fromStationId: number;
  toStationId: number;
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
