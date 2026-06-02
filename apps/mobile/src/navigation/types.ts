export type RootStackParamList = {
  Auth: undefined;
  SearchTrip: undefined;
  TripList: { from: number; to: number; fromName: string; toName: string; date?: string };
  TripDetail: { tripId: number; from: number; to: number; fromName: string; toName: string };
  SeatSelection: { tripId: number; from: number; to: number; fromName?: string; toName?: string };
  BookingConfirmation: {
    tripId: number;
    seatId: number;
    fromStationId: number;
    toStationId: number;
    tripCode?: string;
    coachCode?: string;
    seatNumber?: string;
    seatType?: string;
    fromName?: string;
    toName?: string;
    priceCents?: number;
  };
  MyTickets: undefined;
};
