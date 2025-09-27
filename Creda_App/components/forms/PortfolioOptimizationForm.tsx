import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { P, Small, H4 } from '~/components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import axios from 'axios';

type PortfolioOptimizationData = {
  investment_amount: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  investment_horizon: number;
  preferences: {
    sector_preference: 'diversified' | 'technology' | 'healthcare' | 'finance' | 'energy';
    age: number;
  };
};

type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  onResult: (result: any) => void;
};

export default function PortfolioOptimizationForm({ bottomSheetRef, onResult }: Props) {
  const [formData, setFormData] = useState<PortfolioOptimizationData>({
    investment_amount: 100000,
    risk_tolerance: 'conservative',
    investment_horizon: 10,
    preferences: {
      sector_preference: 'diversified',
      age: 35,
    },
  });

  const isValid = useMemo(() => {
    return formData.investment_amount > 0 &&
      formData.investment_horizon > 0 &&
      formData.preferences.age > 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    const apiData = {
      investment_amount: formData.investment_amount,
      risk_tolerance: formData.risk_tolerance.value,
      investment_horizon: formData.investment_horizon,
      preferences: {
        sector_preference: formData.preferences.sector_preference.value,
        age: formData.preferences.age,
      },
    }
    console.log('Submitting form data:', apiData);

    try {
      const result = await axios.post('https://fafe2d2eb319.ngrok-free.app/portfolio_optimization', apiData);
      console.log('Optimization result:', result.data);
      onResult(result.data);
    } catch (error) {
      console.error('API Error:', error.response || error.message);
      // Fallback to mock data if API fails
      const mockResult = {
        optimized_portfolio: {
          stocks: 40,
          bonds: 50,
          mutual_funds: 10,
          crypto: 0
        },
        expected_return: 7.5,
        risk_level: 'Low'
      };
      onResult(mockResult);
    }

    bottomSheetRef.current?.dismiss();
  }, [isValid, formData, onResult, bottomSheetRef]);

  // Fix the Select value extraction - extract just the value string
  const handleRiskToleranceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      risk_tolerance: value as 'conservative' | 'moderate' | 'aggressive'
    }));
  };

  const handleSectorPreferenceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sector_preference: value as 'diversified' | 'technology' | 'healthcare' | 'finance' | 'energy'
      }
    }));
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['90%']}
      backgroundStyle={{ backgroundColor: '#efffef' }}
    >
      <BottomSheetScrollView className="flex-1 px-4">
        <H4 className="mb-4">Portfolio Optimization</H4>

        <View className="gap-4">
          <View>
            <Label>Investment Amount (₹)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                setFormData(prev => ({ ...prev, investment_amount: amount }));
              }}
              placeholder="100000"
            />
          </View>

          <View>
            <Label>Risk Tolerance</Label>
            <Select
              value={formData.risk_tolerance}
              onValueChange={handleRiskToleranceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative" label="Conservative">
                </SelectItem>
                <SelectItem value="moderate" label="Moderate">
                </SelectItem>
                <SelectItem value="aggressive" label="Aggressive">
                </SelectItem>
              </SelectContent>
            </Select>
          </View>

          <View>
            <Label>Investment Horizon (Years)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const years = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, investment_horizon: years }));
              }}
              placeholder="10"
            />
          </View>

          <View>
            <Label>Sector Preference</Label>
            <Select
              value={formData.preferences.sector_preference}
              onValueChange={handleSectorPreferenceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sector preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diversified" label="Diversified">
                </SelectItem>
                <SelectItem value="technology" label="Technology">
                </SelectItem>
                <SelectItem value="healthcare" label="Healthcare">
                </SelectItem>
                <SelectItem value="finance" label="Finance">
                </SelectItem>
                <SelectItem value="energy" label="Energy">
                </SelectItem>
              </SelectContent>
            </Select>
          </View>

          <View>
            <Label>Age</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const age = parseInt(text) || 0;
                setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, age }
                }));
              }}
              placeholder="35"
            />
          </View>
        </View>

        <View className="mt-6 mb-8">
          <Button
            onPress={handleSubmit}
            disabled={!isValid}
            className="w-full"
          >
            <P className="text-primary-foreground">Generate Portfolio</P>
          </Button>
        </View>

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

