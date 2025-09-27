import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { P, Small, H4 } from '~/components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import axios from 'axios';

type UserProfileData = {
  age: number;
  income: number; // API expects "income" not "annual_income"
  savings: number; // API expects "savings" not "current_savings"
  dependents: number;
  risk_tolerance: number; // API expects integer 1-5, not string
  goal_type: 'retirement' | 'wealth_creation' | 'child_education' | 'other';
  time_horizon: number;
};

type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  onResult: (result: any) => void;
};

export default function UserProfilePortfolioForm({ bottomSheetRef, onResult }: Props) {
  const [formData, setFormData] = useState<UserProfileData>({
    age: 20,
    income: 800000,
    savings: 200000,
    dependents: 1,
    risk_tolerance: 3,
    goal_type: 'retirement',
    time_horizon: 20,
  });

  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => {
    return formData.age > 0 &&
      formData.income > 0 &&
      formData.savings >= 0 &&
      formData.dependents >= 0 &&
      formData.risk_tolerance >= 1 &&
      formData.risk_tolerance <= 5 &&
      formData.time_horizon > 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);

    try {
      console.log('Submitting user profile data:', formData);

      // API expects exact field names and integer risk_tolerance
      const apiData = {
        age: formData.age,
        income: formData.income, // Changed from annual_income to income
        savings: formData.savings, // Changed from current_savings to savings
        number_of_dependents: formData.dependents,
        risk_tolerance: formData.risk_tolerance, // Keep as integer 1-5
        investment_goal: formData.goal_type.value,
        investment_horizon_years: formData.time_horizon
      };

      console.log('API payload:', apiData);

      const result = await axios.post('https://fafe2d2eb319.ngrok-free.app/get_portfolio_allocation', apiData);

      console.log('Portfolio allocation result:', result.data);
      onResult(result.data.data);

    } catch (error: any) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
      bottomSheetRef.current?.dismiss();
    }
  }, [isValid, formData, onResult, bottomSheetRef, isLoading]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['90%']}
      backgroundStyle={{ backgroundColor: '#efffef' }}
    >
      <BottomSheetScrollView className="flex-1 px-4">
        <H4 className="mb-4">User Profile Based Portfolio</H4>

        <View className="gap-4">
          <View>
            <Label>Age</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const age = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, age }));
              }}
              placeholder="32"
            />
          </View>

          <View>
            <Label>Annual Income (₹)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const income = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, income }));
              }}
              placeholder="800000"
            />
            <Small className="text-muted-foreground mt-1">API field: income</Small>
          </View>

          <View>
            <Label>Current Savings (₹)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const savings = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, savings }));
              }}
              placeholder="200000"
            />
            <Small className="text-muted-foreground mt-1">API field: savings</Small>
          </View>

          <View>
            <Label>Number of Dependents</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const dependents = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, dependents }));
              }}
              placeholder="1"
            />
          </View>

          <View>
            <Label>Risk Tolerance (1-5)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const risk = Math.min(5, Math.max(1, parseInt(text) || 1));
                setFormData(prev => ({ ...prev, risk_tolerance: risk }));
              }}
              placeholder="3"
            />
            <Small className="text-muted-foreground mt-1">
              1 = Very Conservative, 5 = Very Aggressive (API expects integer)
            </Small>
          </View>

          <View>
            <Label>Goal Type</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value) =>
                setFormData(prev => ({
                  ...prev,
                  goal_type: value as 'retirement' | 'wealth_creation' | 'child_education' | 'other'
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retirement" label="Retirement">
                </SelectItem>
                <SelectItem value="wealth_creation" label="Wealth Creation">
                </SelectItem>
                <SelectItem value="child_education" label="Child Education">
                </SelectItem>
                <SelectItem value="other" label="Other">
                </SelectItem>
              </SelectContent>
            </Select>
          </View>

          <View>
            <Label>Time Horizon (Years)</Label>
            <Input
              keyboardType="numeric"
              onChangeText={(text) => {
                const horizon = parseInt(text) || 0;
                setFormData(prev => ({ ...prev, time_horizon: horizon }));
              }}
              placeholder="20"
            />
          </View>
        </View>


        <View className="mt-6 mb-8">
          <Button
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
            className="w-full"
          >
            <P className="text-primary-foreground">
              {isLoading ? 'Generating Portfolio...' : 'Generate Portfolio'}
            </P>
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

