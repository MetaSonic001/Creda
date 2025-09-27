import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useCreateGoal } from '~/hooks/queries';

type Props = { visible: boolean; onClose: () => void };

export default function AddGoalForm({ visible, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const createGoal = useCreateGoal();

  const isValid = useMemo(() => {
    return title.trim() && amount && !isNaN(Number(amount)) && Number(amount) > 0;
  }, [title, amount]);

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
      setDeadline(cleaned);
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    try {
      await createGoal.mutateAsync({ 
        title: title.trim(), 
        target_amount: Number(amount), 
        deadline: deadline || null 
      });
      onClose();
      setTitle('');
      setAmount('');
      setDeadline('');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  }, [isValid, title, amount, deadline, createGoal, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setTitle('');
    setAmount('');
    setDeadline('');
  }, [onClose]);

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Goal</DialogTitle>
        </DialogHeader>
        <View className="gap-3">
          <View>
            <Label>Title</Label>
            <Input 
              value={title} 
              onChangeText={setTitle} 
              placeholder="New Laptop" 
              autoFocus
            />
          </View>
          <View>
            <Label>Target Amount</Label>
            <Input 
              keyboardType="numeric" 
              value={amount} 
              onChangeText={handleAmountChange} 
              placeholder="0" 
            />
          </View>
          <View>
            <Label>Deadline (optional)</Label>
            <Input 
              value={deadline} 
              onChangeText={handleDateChange} 
              placeholder="YYYY-MM-DD" 
            />
          </View>
        </View>
        <DialogFooter>
          <Button variant="secondary" onPress={handleClose}>Cancel</Button>
          <Button onPress={onSubmit} disabled={createGoal.isPending || !isValid}>
            {createGoal.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


