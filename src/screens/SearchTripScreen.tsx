import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { FormTextInput } from '../components/FormTextInput';
import { useAuthStore } from '../store/auth.store';
import { commonStyles } from '../styles/common';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchTrip'>;

type SearchForm = {
  from: string;
  to: string;
  date: string;
};

export function SearchTripScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const { control, handleSubmit } = useForm<SearchForm>({
    defaultValues: {
      from: '',
      to: '',
      date: '',
    },
  });

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.heading}>Find Train</Text>

      <Controller
        control={control}
        name="from"
        render={({ field }) => (
          <FormTextInput
            label="Origin Station ID"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="station-id"
          />
        )}
      />

      <Controller
        control={control}
        name="to"
        render={({ field }) => (
          <FormTextInput
            label="Destination Station ID"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="station-id"
          />
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <FormTextInput
            label="Date (YYYY-MM-DD)"
            value={field.value}
            onChangeText={field.onChange}
            placeholder="2026-04-21"
          />
        )}
      />

      <Pressable
        style={commonStyles.button}
        onPress={handleSubmit((form) => navigation.navigate('TripList', form))}
      >
        <Text style={commonStyles.buttonText}>Search Trips</Text>
      </Pressable>

      <Pressable
        style={[commonStyles.buttonSecondary, { marginTop: 10 }]}
        onPress={() => navigation.navigate('MyTickets')}
      >
        <Text style={commonStyles.buttonText}>My Tickets</Text>
      </Pressable>

      <Pressable style={{ marginTop: 14 }} onPress={logout}>
        <Text style={{ color: '#7c2d12' }}>Logout</Text>
      </Pressable>
    </View>
  );
}
