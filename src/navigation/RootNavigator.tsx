import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { useAppTheme } from '../theme';
import { AuthScreen } from '../screens/AuthScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { MyTicketsScreen } from '../screens/MyTicketsScreen';
import { SeatSelectionScreen } from '../screens/SeatSelectionScreen';
import { SearchTripScreen } from '../screens/SearchTripScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { TripListScreen } from '../screens/TripListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  const { mode, colors } = useAppTheme();

  const navTheme = mode === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.cardBorder,
          primary: colors.accent,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.textPrimary,
          border: colors.cardBorder,
          primary: colors.accent,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!token ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login / Register' }} />
        ) : (
          <>
            <Stack.Screen name="SearchTrip" component={SearchTripScreen} options={{ title: 'Search Trips' }} />
            <Stack.Screen name="TripList" component={TripListScreen} options={{ title: 'Trip List' }} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Trip Detail' }} />
            <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Select Seat' }} />
            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
              options={{ title: 'Booking Confirmation' }}
            />
            <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{ title: 'My Tickets' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
