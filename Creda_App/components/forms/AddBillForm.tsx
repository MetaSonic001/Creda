import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useCreateBill } from '~/hooks/queries';

type Props = { visible: boolean; onClose: () => void };

export default function AddBillForm({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const createBill = useCreateBill();

  const isValid = useMemo(() => {
    return name.trim() && amount && !isNaN(Number(amount)) && Number(amount) > 0;
  }, [name, amount]);

  const handleAmountChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setAmount(cleaned);
    }
  }, []);

  const handleDateChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length <= 10) {
      setDue(cleaned);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    try {
      await createBill.mutateAsync({ 
        name: name.trim(), 
        amount: Number(amount), 
        due_date: due 
      });
      onClose();
      setName('');
      setAmount('');
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  }, [isValid, name, amount, due, createBill, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setName('');
    setAmount('');
  }, [onClose]);

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bill</DialogTitle>
        </DialogHeader>
        <View className="gap-3">
          <View>
            <Label>Name</Label>
            <Input 
              value={name} 
              onChangeText={setName} 
              placeholder="Electricity" 
              autoFocus
            />
          </View>
          <View>
            <Label>Amount</Label>
            <Input 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={handleAmountChange} 
              placeholder="0" 
            />
          </View>
          <View>
            <Label>Due Date</Label>
            <Input 
              value={due} 
              onChangeText={handleDateChange} 
              placeholder="YYYY-MM-DD" 
            />
          </View>
        </View>
        <DialogFooter>
          <Button variant="secondary" onPress={handleClose}>Cancel</Button>
          <Button onPress={onSubmit} disabled={createBill.isPending || !isValid}>
            {createBill.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


