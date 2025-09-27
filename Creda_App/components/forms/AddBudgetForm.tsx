import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useCreateBudget } from '~/hooks/queries';

type Props = { visible: boolean; onClose: () => void };

export default function AddBudgetForm({ visible, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState('');
  const createBudget = useCreateBudget();

  const isValid = useMemo(() => {
    return amount && !isNaN(Number(amount)) && Number(amount) > 0;
  }, [amount]);

  const handleAmountChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setAmount(cleaned);
    }
  }, []);

  const handleDateChange = useCallback((text: string, field: 'start' | 'end') => {
    const cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length <= 10) {
      if (field === 'start') setStart(cleaned);
      else setEnd(cleaned);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    try {
      await createBudget.mutateAsync({ 
        amount: Number(amount), 
        start_date: start, 
        end_date: end || null 
      });
      onClose();
      setAmount('');
      setEnd('');
    } catch (error) {
      console.error('Error creating budget:', error);
    }
  }, [isValid, amount, start, end, createBudget, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setAmount('');
    setEnd('');
  }, [onClose]);

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <View className="gap-3">
          <View>
            <Label>Amount</Label>
            <Input 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={handleAmountChange} 
              placeholder="0" 
              autoFocus
            />
          </View>
          <View>
            <Label>Start</Label>
            <Input 
              value={start} 
              onChangeText={(text) => handleDateChange(text, 'start')} 
              placeholder="YYYY-MM-DD" 
            />
          </View>
          <View>
            <Label>End (optional)</Label>
            <Input 
              value={end} 
              onChangeText={(text) => handleDateChange(text, 'end')} 
              placeholder="YYYY-MM-DD" 
            />
          </View>
        </View>
        <DialogFooter>
          <Button variant="secondary" onPress={handleClose}>Cancel</Button>
          <Button onPress={onSubmit} disabled={createBudget.isPending || !isValid}>
            {createBudget.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


