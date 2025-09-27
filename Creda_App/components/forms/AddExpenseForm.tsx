import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useCreateTransaction } from '~/hooks/queries';

type Props = { visible: boolean; onClose: () => void };

export default function AddExpenseForm({ visible, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const createTx = useCreateTransaction();

  const isValid = useMemo(() => {
    return amount && !isNaN(Number(amount)) && Number(amount) > 0;
  }, [amount]);

  const handleAmountChange = useCallback((text: string) => {
    // Only allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setAmount(cleaned);
    }
  }, []);

  const handleDateChange = useCallback((text: string) => {
    // Basic date format validation (YYYY-MM-DD)
    const cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length <= 10) {
      setDate(cleaned);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    try {
      await createTx.mutateAsync({
        type: 'expense',
        amount: Number(amount),
        date,
        notes: notes.trim(),
      });
      onClose();
      setAmount('');
      setNotes('');
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  }, [isValid, amount, date, notes, createTx, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setAmount('');
    setNotes('');
  }, [onClose]);

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
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
            <Label>Date (YYYY-MM-DD)</Label>
            <Input 
              value={date} 
              onChangeText={handleDateChange} 
              placeholder="YYYY-MM-DD" 
            />
          </View>
          <View>
            <Label>Notes</Label>
            <Input 
              value={notes} 
              onChangeText={setNotes} 
              placeholder="Optional" 
            />
          </View>
        </View>
        <DialogFooter>
          <Button variant="secondary" onPress={handleClose}>Cancel</Button>
          <Button onPress={onSubmit} disabled={createTx.isPending || !isValid}>
            {createTx.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


