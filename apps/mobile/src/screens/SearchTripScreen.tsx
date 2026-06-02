import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useStations } from '../hooks/useStations';
import { useAuthStore } from '../store/auth.store';
import { useThemeStore } from '../store/theme.store';
import { useAppTheme } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { ACCESS_TOKEN_KEY } from '@repo/shared/src/auth/session';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchTrip'>;

type SearchForm = {
  fromName: string;
  toName: string;
  date: string;
};

type PickerTarget = 'from' | 'to' | null;

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function SearchTripScreen({ navigation }: Props) {
  const { commonStyles, colors } = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const logout = useAuthStore((s) => s.logout);
  const [selectedFrom, setSelectedFrom] = useState<{ id: number; name: string } | null>(null);
  const [selectedTo, setSelectedTo] = useState<{ id: number; name: string } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [stationQuery, setStationQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [travelDate, setTravelDate] = useState(new Date());

  const { control, handleSubmit, setValue, watch } = useForm<SearchForm>({
    defaultValues: {
      fromName: '',
      toName: '',
      date: toDateInputValue(new Date()),
    },
  });

  const dateValue = watch('date');
  const fromName = watch('fromName');
  const toName = watch('toName');

  const stationsQuery = useStations(stationQuery);
  const suggestions = useMemo(() => stationsQuery.data ?? [], [stationsQuery.data]);

  const openStationPicker = (target: Exclude<PickerTarget, null>) => {
    setPickerTarget(target);
    setStationQuery('');
  };

  const handleSelectStation = (station: { id: number; name: string }) => {
    if (pickerTarget === 'from') {
      setSelectedFrom(station);
      setValue('fromName', station.name);
    } else if (pickerTarget === 'to') {
      setSelectedTo(station);
      setValue('toName', station.name);
    }
    setPickerTarget(null);
  };

  const handleSwapStations = () => {
    const tmpFrom = selectedFrom;
    const tmpTo = selectedTo;
    setSelectedFrom(tmpTo);
    setSelectedTo(tmpFrom);
    setValue('fromName', tmpTo?.name ?? '');
    setValue('toName', tmpFrom?.name ?? '');
  };

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (!selected) return;
    setTravelDate(selected);
    setValue('date', toDateInputValue(selected));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    logout();
  };

  return (
    <ScrollView
      style={commonStyles.container}
      contentContainerStyle={commonStyles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 28 }]}>
        <View>
          <Text style={commonStyles.heading}>Find your trip</Text>
          <Text style={commonStyles.bodyText}>Search and book train tickets</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            commonStyles.buttonSecondary,
            { paddingVertical: 9, paddingHorizontal: 14, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={toggleTheme}
        >
          <Text style={commonStyles.buttonTextSecondary}>Theme</Text>
        </Pressable>
      </View>

      {/* Search card */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          marginBottom: 16,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.07,
              shadowRadius: 16,
            },
            android: { elevation: 3 },
            default: {},
          }),
        }}
      >
        {/* Origin */}
        <Text style={commonStyles.label}>Origin</Text>
        <Controller
          control={control}
          name="fromName"
          rules={{ required: true }}
          render={() => (
            <Pressable
              style={({ pressed }) => [
                commonStyles.input,
                {
                  justifyContent: 'center',
                  borderColor: pressed ? colors.accent : colors.inputBorder,
                  marginBottom: 4,
                },
              ]}
              onPress={() => openStationPicker('from')}
            >
              <Text style={{ color: fromName ? colors.textPrimary : colors.textHint, fontSize: 15 }}>
                {fromName || 'Tap to select origin'}
              </Text>
            </Pressable>
          )}
        />

        {/* Swap button */}
        <View style={{ alignItems: 'center', marginVertical: 6 }}>
          <Pressable
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
            onPress={handleSwapStations}
          >
            <Text style={{ color: colors.accent, fontSize: 18, lineHeight: 22 }}>⇅</Text>
          </Pressable>
        </View>

        {/* Destination */}
        <Text style={commonStyles.label}>Destination</Text>
        <Controller
          control={control}
          name="toName"
          rules={{ required: true }}
          render={() => (
            <Pressable
              style={({ pressed }) => [
                commonStyles.input,
                {
                  justifyContent: 'center',
                  borderColor: pressed ? colors.accent : colors.inputBorder,
                  marginBottom: 16,
                },
              ]}
              onPress={() => openStationPicker('to')}
            >
              <Text style={{ color: toName ? colors.textPrimary : colors.textHint, fontSize: 15 }}>
                {toName || 'Tap to select destination'}
              </Text>
            </Pressable>
          )}
        />

        {/* Date */}
        <Text style={commonStyles.label}>Travel date</Text>
        <Pressable
          style={({ pressed }) => [
            commonStyles.input,
            {
              justifyContent: 'center',
              marginBottom: 20,
              borderColor: pressed ? colors.accent : colors.inputBorder,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{formatDisplayDate(dateValue)}</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker value={travelDate} mode="date" display="default" onChange={onDateChange} />
        )}

        <Pressable
          style={({ pressed }) => [commonStyles.button, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleSubmit((form) => {
            if (!selectedFrom || !selectedTo) {
              Alert.alert('Select stations', 'Please select both origin and destination.');
              return;
            }
            if (selectedFrom.id === selectedTo.id) {
              Alert.alert('Invalid route', 'Origin and destination must be different.');
              return;
            }
            navigation.navigate('TripList', {
              from: selectedFrom.id,
              to: selectedTo.id,
              fromName: selectedFrom.name,
              toName: selectedTo.name,
              date: form.date,
            });
          })}
        >
          <Text style={commonStyles.buttonText}>Search trips</Text>
        </Pressable>
      </View>

      {/* Secondary actions */}
      <Pressable
        style={({ pressed }) => [
          commonStyles.buttonSecondary,
          { marginBottom: 12, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => navigation.navigate('MyTickets')}
      >
        <Text style={commonStyles.buttonTextSecondary}>My Tickets</Text>
      </Pressable>

      <Pressable style={{ alignItems: 'center', paddingVertical: 12 }} onPress={handleLogout}>
        <Text style={{ color: colors.danger, fontSize: 14, fontWeight: '600' }}>Sign out</Text>
      </Pressable>

      {/* Station picker modal */}
      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              maxHeight: '75%',
              paddingTop: 8,
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.divider,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
              <Text style={[commonStyles.subheading, { marginBottom: 14 }]}>
                Select {pickerTarget === 'from' ? 'origin' : 'destination'}
              </Text>

              <TextInput
                style={[commonStyles.input, { marginBottom: 12 }]}
                placeholder="Search by station name..."
                placeholderTextColor={colors.textHint}
                value={stationQuery}
                onChangeText={setStationQuery}
                autoFocus
              />

              <FlatList
                data={suggestions}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 360 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => ({
                      paddingVertical: 14,
                      paddingHorizontal: 4,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: pressed ? 0.7 : 1,
                    })}
                    onPress={() => handleSelectStation({ id: item.id, name: item.name })}
                  >
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 15 }}>
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.textHint,
                        fontSize: 12,
                        fontWeight: '700',
                        backgroundColor: colors.surface,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        overflow: 'hidden',
                      }}
                    >
                      {item.code}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={[commonStyles.bodyText, { paddingVertical: 24, textAlign: 'center' }]}>
                    {stationsQuery.isLoading
                      ? 'Loading stations...'
                      : stationsQuery.isError
                        ? 'Unable to load stations'
                        : 'No station found'}
                  </Text>
                }
              />

              <Pressable
                style={({ pressed }) => [
                  commonStyles.buttonSecondary,
                  { marginTop: 12, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setPickerTarget(null)}
              >
                <Text style={commonStyles.buttonTextSecondary}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
