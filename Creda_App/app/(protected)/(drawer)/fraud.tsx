import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Container } from '~/components/Container';
import { Title, P } from '~/components/ui/typography';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';

export default function Fraud() {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  return (
    <Container>
      <Title>Security Alerts</Title>
      <View className="mt-6 p-4 rounded-xl" style={{ backgroundColor: theme.card }}>
        <P>No alerts.</P>
      </View>
    </Container>
  );
}


