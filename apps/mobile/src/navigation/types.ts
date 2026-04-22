export type RootStackParamList = {
  Auth: undefined;
  SearchTrip: undefined;
  TripList: { from: string; to: string; fromName: string; toName: string; date?: string };
  TripDetail: { tripId: string; from: string; to: string; fromName: string; toName: string };
  SeatSelection: { tripId: string; from: string; to: string };
  BookingConfirmation: {
    tripId: string;
    seatId: string;
    fromStationId: string;
    toStationId: string;
  };
  MyTickets: undefined;
};
