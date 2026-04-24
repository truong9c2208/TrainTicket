export type RootStackParamList = {
  Auth: undefined;
  SearchTrip: undefined;
  TripList: { from: number; to: number; fromName: string; toName: string; date?: string };
  TripDetail: { tripId: number; from: number; to: number; fromName: string; toName: string };
  SeatSelection: { tripId: number; from: number; to: number };
  BookingConfirmation: {
    tripId: number;
    seatId: number;
    fromStationId: number;
    toStationId: number;
  };
  MyTickets: undefined;
};
