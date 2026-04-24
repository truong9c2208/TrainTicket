import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function SearchTripScreen({ navigation }: Props) {
  const { commonStyles, colors, mode } = useAppTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const logout = useAuthStore((s) => s.logout);
  const [selectedFrom, setSelectedFrom] = useState<{ id: number; name: string } | null>(null);
  const [selectedTo, setSelectedTo] = useState<{ id: number; name: string } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [stationQuery, setStationQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [travelDate, setTravelDate] = useState(new Date());

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchForm>({
    defaultValues: {
      fromName: '',
      toName: '',
      date: toDateInputValue(new Date()),
    },
  });

  const dateValue = watch('date');

  const stationsQuery = useStations(stationQuery);

  const suggestions = useMemo(() => stationsQuery.data ?? [], [stationsQuery.data]);

  const openStationPicker = (target: Exclude<PickerTarget, null>) => {
    setPickerTarget(target);
    setStationQuery('');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    logout();
  };

  const handleSelectStation = (station: { id: number; name: string }) => {
    if (pickerTarget === 'from') {
      setSelectedFrom(station);
      setValue('fromName', station.name);
    }

    if (pickerTarget === 'to') {
      setSelectedTo(station);
      setValue('toName', station.name);
    }

    setPickerTarget(null);
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (!selectedDate) {
      return;
    }

    setTravelDate(selectedDate);
    setValue('date', toDateInputValue(selectedDate));
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={commonStyles.heading}>Find Train</Text>
        <Pressable style={[commonStyles.button, { paddingVertical: 8 }]} onPress={toggleTheme}>
          <Text style={commonStyles.buttonText}>{mode === 'light' ? 'Dark' : 'Light'}</Text>
        </Pressable>
      </View>

      <Text style={[commonStyles.bodyText, { marginBottom: 12 }]}>Search station by name, not ID.</Text>

      <View style={commonStyles.card}>
        <Controller
          control={control}
          name="fromName"
          rules={{ required: 'Origin station is required' }}
          render={({ field }) => (
            <View style={{ marginBottom: 12 }}>
              <Text style={commonStyles.label}>Origin</Text>
              <Pressable style={commonStyles.input} onPress={() => openStationPicker('from')}>
                <Text style={{ color: field.value ? colors.textPrimary : colors.textSecondary }}>
                  {field.value || 'Tap to select station'}
                </Text>
              </Pressable>
              {errors.fromName ? (
                <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.fromName.message}</Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="toName"
          rules={{ required: 'Destination station is required' }}
          render={({ field }) => (
            <View style={{ marginBottom: 12 }}>
              <Text style={commonStyles.label}>Destination</Text>
              <Pressable style={commonStyles.input} onPress={() => openStationPicker('to')}>
                <Text style={{ color: field.value ? colors.textPrimary : colors.textSecondary }}>
                  {field.value || 'Tap to select station'}
                </Text>
              </Pressable>
              {errors.toName ? (
                <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.toName.message}</Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          control={control}
          name="date"
          render={() => (
            <View style={{ marginBottom: 12 }}>
              <Text style={commonStyles.label}>Travel Date</Text>
              <Pressable style={commonStyles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: colors.textPrimary }}>{dateValue}</Text>
              </Pressable>
            </View>
          )}
        />

        {showDatePicker ? (
          <DateTimePicker value={travelDate} mode="date" display="default" onChange={onDateChange} />
        ) : null}

        <Pressable
          style={commonStyles.button}
          onPress={handleSubmit((form) => {
            if (!selectedFrom || !selectedTo) {
              Alert.alert('Missing stations', 'Please select both origin and destination stations.');
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
          <Text style={commonStyles.buttonText}>Search Trips</Text>
        </Pressable>

        <Pressable
          style={[commonStyles.button, { marginTop: 10 }]}
          onPress={() => navigation.navigate('MyTickets')}
        >
          <Text style={commonStyles.buttonText}>My Tickets</Text>
        </Pressable>

        <Pressable style={{ marginTop: 14 }} onPress={handleLogout}>
          <Text style={{ color: colors.danger, textAlign: 'center' }}>Logout</Text>
        </Pressable>
      </View>

      <Modal visible={pickerTarget !== null} transparent animationType="slide" onRequestClose={() => setPickerTarget(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              maxHeight: '70%',
              padding: 16,
            }}
          >
            <Text style={[commonStyles.heading, { fontSize: 20 }]}>Choose Station</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Type station name"
              placeholderTextColor={colors.textSecondary}
              value={stationQuery}
              onChangeText={setStationQuery}
            />

            <FlatList
              data={suggestions}
              keyExtractor={(item) => String(item.id)}
              style={{ marginTop: 12 }}
              renderItem={({ item }) => (
                <Pressable
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.cardBorder,
                  }}
                  onPress={() => handleSelectStation({ id: item.id, name: item.name })}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{item.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>{item.code}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={[commonStyles.bodyText, { paddingVertical: 18 }]}>
                  {stationsQuery.isLoading
                    ? 'Loading stations...'
                    : stationsQuery.isError
                      ? 'Unable to load stations. Please check your network and login.'
                      : 'No station found.'}
                </Text>
              }
            />

            <Pressable style={[commonStyles.buttonSecondary, { marginTop: 12 }]} onPress={() => setPickerTarget(null)}>
              <Text style={commonStyles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
