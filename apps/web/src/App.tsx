import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ACCESS_TOKEN_KEY,
  AUTH_VALIDATION,
  HttpError,
  validateEmail,
  validateFullName,
  validatePassword,
} from '@repo/shared/src';
import { login, register } from './lib/auth';
import { clearAuthToken } from './lib/client';
import { searchStations } from './lib/stations';
import { getMyTickets, bookTicket, cancelTicket } from './lib/tickets';
import { getTrips } from './lib/trips';
import { getAvailableSeats } from './lib/seats';
import type { Station, Ticket, Trip, SeatAvailability } from './lib/types';
import AdminDashboard from './AdminDashboard';
import './App.css';

type AuthMode = 'login' | 'register';

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(dateString: string) {
  const d = new Date(dateString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ACCESS_TOKEN_KEY));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('USER_ROLE'));
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  const [fromStationId, setFromStationId] = useState<number | ''>('');
  const [toStationId, setToStationId] = useState<number | ''>('');
  const [travelDate, setTravelDate] = useState(toDateInputValue(new Date()));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<SeatAvailability[]>([]);
  const [priceCents, setPriceCents] = useState<number>(0);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatsError, setSeatsError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SeatAvailability | null>(null);
  const [activeCoach, setActiveCoach] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const loadStations = async () => {
      setStationsLoading(true);
      setStationsError(null);
      try {
        const data = await searchStations('');
        setStations(data);
      } catch (error) {
        const httpError = error as HttpError;
        setStationsError(httpError.message || 'Unable to load stations');
      } finally {
        setStationsLoading(false);
      }
    };

    void loadStations();
  }, [token]);

  useEffect(() => {
    if (token) {
      void handleLoadTickets();
    }
  }, [token]);

  const selectedFrom = useMemo(() => stations.find((station) => station.id === fromStationId), [fromStationId, stations]);
  const selectedTo = useMemo(() => stations.find((station) => station.id === toStationId), [toStationId, stations]);

  const coaches = useMemo(() => {
    const map = new Map<number, { code: string; index: number }>();
    seats.forEach((s) => map.set(s.coachId, { code: s.coachCode, index: s.coachIndex }));
    return Array.from(map.entries())
      .map(([id, info]) => ({ id, ...info }))
      .sort((a, b) => a.index - b.index);
  }, [seats]);

  const seatsInActiveCoach = useMemo(() => {
    return seats
      .filter((s) => s.coachId === activeCoach)
      .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
  }, [seats, activeCoach]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const emailValidation = validateEmail(email);
    if (emailValidation !== true) return setAuthError(emailValidation);

    const passwordValidation = validatePassword(password);
    if (passwordValidation !== true) return setAuthError(passwordValidation);

    if (authMode === 'register') {
      const fullNameValidation = validateFullName(fullName);
      if (fullNameValidation !== true) return setAuthError(fullNameValidation);
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, fullName });
      }
      setToken(localStorage.getItem(ACCESS_TOKEN_KEY));
      setUserRole(localStorage.getItem('USER_ROLE'));
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error) {
      const httpError = error as HttpError;
      setAuthError(httpError.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSearchTrips = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTripError(null);
    if (!fromStationId || !toStationId) return setTripError('Please select both origin and destination stations.');
    if (fromStationId === toStationId) return setTripError('Origin and destination must be different.');

    setTripLoading(true);
    try {
      const data = await getTrips({ from: Number(fromStationId), to: Number(toStationId), date: travelDate });
      setTrips(data);
    } catch (error) {
      const httpError = error as HttpError;
      setTripError(httpError.message || 'Failed to search trips');
    } finally {
      setTripLoading(false);
    }
  };

  const handleLoadTickets = async () => {
    setTicketLoading(true);
    setTicketError(null);
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (error) {
      const httpError = error as HttpError;
      setTicketError(httpError.message || 'Failed to load tickets');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSelectTrip = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeat(null);
    setSeatsError(null);
    setSeatsLoading(true);

    try {
      const res = await getAvailableSeats({ tripId: trip.id, from: Number(fromStationId), to: Number(toStationId) });
      setSeats(res.seats);
      setPriceCents(res.priceCents);
      if (res.seats.length > 0) {
        setActiveCoach(res.seats[0].coachId);
      }
    } catch (error) {
      const httpError = error as HttpError;
      setSeatsError(httpError.message || 'Failed to load seats');
    } finally {
      setSeatsLoading(false);
    }
  };

  const handleBookTicket = async () => {
    if (!selectedTrip || !selectedSeat) return;
    setActionLoading(true);
    try {
      await bookTicket({
        tripId: selectedTrip.id,
        seatId: selectedSeat.seatId,
        fromStationId: Number(fromStationId),
        toStationId: Number(toStationId),
      });
      setSelectedTrip(null);
      setSelectedSeat(null);
      await handleLoadTickets();
    } catch (error) {
      const httpError = error as HttpError;
      alert(httpError.message || 'Failed to book ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId: number) => {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    setActionLoading(true);
    try {
      await cancelTicket({ ticketId });
      await handleLoadTickets();
    } catch (error) {
      const httpError = error as HttpError;
      alert(httpError.message || 'Failed to cancel ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem('USER_ROLE');
    setToken(null);
    setUserRole(null);
    setTrips([]);
    setTickets([]);
  };

  if (!token) {
    return (
      <main className="page auth-page">
        <section className="card auth-card">
          <h1>Train Ticket</h1>
          <p className="subtle">Shared Layer Web Client</p>

          <form onSubmit={handleAuth} className="stack">
            {authMode === 'register' && (
              <label className="field">
                Full name
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  minLength={AUTH_VALIDATION.fullNameMinLength}
                  placeholder="John Doe"
                  required
                />
              </label>
            )}
            <label className="field">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </label>
            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={AUTH_VALIDATION.passwordMinLength}
                required
              />
            </label>
            {authError && <p className="error">{authError}</p>}
            <button type="submit" className="btn" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <button type="button" className="btn ghost" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'No account? Register' : 'Already have account? Login'}
          </button>
        </section>
      </main>
    );
  }

  if (userRole === 'MANAGER') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (selectedTrip) {
    return (
      <main className="page app-page">
        <header className="topbar">
          <h1>Seat Selection</h1>
          <div className="topbar-actions">
            <button type="button" className="btn ghost" onClick={toggleTheme}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button type="button" className="btn ghost" onClick={() => setSelectedTrip(null)}>
              ← Back to Trips
            </button>
          </div>
        </header>

        <section className="card">
          <div className="header-actions">
            <div>
              <h2>{selectedTrip.train.name} ({selectedTrip.code})</h2>
              <p className="subtle">{selectedFrom?.name} to {selectedTo?.name} • {formatDateTime(selectedTrip.departureDate)}</p>
            </div>
          </div>

          {seatsLoading && <p className="subtle">Loading seats...</p>}
          {seatsError && <p className="error">{seatsError}</p>}

          {!seatsLoading && coaches.length > 0 && (
            <>
              <div className="coach-selector">
                {coaches.map((c) => (
                  <button
                    key={c.id}
                    className={`btn coach-btn ${activeCoach === c.id ? 'active' : ''}`}
                    onClick={() => setActiveCoach(c.id)}
                  >
                    Coach {c.code}
                  </button>
                ))}
              </div>

              <div className="seat-grid">
                {seatsInActiveCoach.map((seat) => (
                  <button
                    key={seat.seatId}
                    className={`btn seat-btn ${selectedSeat?.seatId === seat.seatId ? 'selected' : ''}`}
                    disabled={!seat.available}
                    onClick={() => setSelectedSeat(seat)}
                  >
                    {seat.seatNumber}
                    <br />
                    <small>{seat.seatType}</small>
                  </button>
                ))}
              </div>

              <div className="checkout-panel">
                <div>
                  {selectedSeat ? (
                    <>
                      <p className="subtle">Selected Seat</p>
                      <p><strong>Coach {selectedSeat.coachCode} - {selectedSeat.seatNumber} ({selectedSeat.seatType})</strong></p>
                      <p className="price">{(priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </>
                  ) : (
                    <p className="subtle">Please select a seat</p>
                  )}
                </div>
                <button className="btn" disabled={!selectedSeat || actionLoading} onClick={handleBookTicket}>
                  {actionLoading ? 'Processing...' : 'Confirm & Book'}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page app-page">
      <header className="topbar">
        <h1>Train Ticket Dashboard</h1>
        <div className="topbar-actions">
          <button type="button" className="btn ghost" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button type="button" className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="grid">
        <article className="card">
          <h2>Find Trips</h2>

          <form onSubmit={handleSearchTrips} className="stack">
            <label className="field">
              Origin
              <select value={fromStationId} onChange={(e) => setFromStationId(e.target.value ? Number(e.target.value) : '')} disabled={stationsLoading} required>
                <option value="">Select origin</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Destination
              <select value={toStationId} onChange={(e) => setToStationId(e.target.value ? Number(e.target.value) : '')} disabled={stationsLoading} required>
                <option value="">Select destination</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Travel Date
              <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required />
            </label>

            <button type="submit" className="btn" disabled={tripLoading || stationsLoading}>
              {tripLoading ? 'Searching...' : 'Search Trips'}
            </button>
          </form>

          {stationsLoading && <p className="subtle">Loading stations...</p>}
          {stationsError && <p className="error">{stationsError}</p>}
          {tripError && <p className="error">{tripError}</p>}

          <div className="result-list">
            {trips.length === 0 ? (
              <p className="subtle">No trips yet. Search above to view trips.</p>
            ) : (
              trips.map((trip) => (
                <div key={trip.id} className="result-item clickable" onClick={() => handleSelectTrip(trip)}>
                  <p>
                    <strong>{trip.code}</strong> - {trip.train.name}
                  </p>
                  <p>
                    {trip.fromStationName} to {trip.toStationName}
                  </p>
                  <p className="subtle">Departure: {formatDateTime(trip.departureDate)}</p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card">
          <h2>My Tickets</h2>

          {ticketLoading && <p className="subtle">Loading tickets...</p>}
          {ticketError && <p className="error">{ticketError}</p>}

          <div className="result-list scrollable-list">
            {tickets.length === 0 ? (
              <p className="subtle">No tickets found.</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="result-item">
                  <p>
                    <strong>{ticket.trip.code}</strong> - {ticket.fromStation.name} to {ticket.toStation.name}
                    <span className={`badge ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                  </p>
                  <p>
                    Coach {ticket.seat.coach.code} - Seat {ticket.seat.number} ({ticket.seat.type})
                  </p>
                  <p className="subtle">Booked at: {formatDateTime(ticket.bookedAt)}</p>
                  {ticket.status === 'BOOKED' && (
                    <button className="btn ghost" disabled={actionLoading} onClick={() => handleCancelTicket(ticket.id)}>
                      Cancel Ticket
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <footer className="subtle">
        Current route: {selectedFrom?.name ?? '-'} to {selectedTo?.name ?? '-'} on {travelDate}
      </footer>
    </main>
  );
}

export default App;
