import React, { useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrizzle } from '~/hooks/db';
import { assets, holdings } from '~/store/schema';
import useAuthStore from '~/store/authStore';
import { eq } from 'drizzle-orm';

type Props = { visible: boolean; onClose: () => void };

export default function AddHoldingForm({ visible, onClose }: Props) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();

  const isValid = useMemo(() => {
    return name.trim() && 
           quantity && !isNaN(Number(quantity)) && Number(quantity) > 0 &&
           avgPrice && !isNaN(Number(avgPrice)) && Number(avgPrice) > 0;
  }, [name, quantity, avgPrice]);

  const handleNumericChange = useCallback((text: string, setter: (value: string) => void) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length <= 2) {
      setter(cleaned);
    }
  }, []);

  const createHolding = useMutation({
    mutationFn: async () => {
      if (!isValid) return;
      const inserted = await db.insert(assets).values({ 
        user_id: currentUser.id, 
        name: name.trim(), 
        type: 'stock', 
        symbol: symbol.trim() 
      }).returning({ id: assets.id });
      const assetId = inserted?.[0]?.id as number;
      await db.insert(holdings).values({ 
        user_id: currentUser.id, 
        asset_id: assetId, 
        quantity: Number(quantity), 
        avg_price: Number(avgPrice) 
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holdings', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['holdings-with-assets', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['portfolio', currentUser.id] });
    },
  });

  const onSubmit = useCallback(async () => {
    if (!isValid) return;
    try {
      await createHolding.mutateAsync();
      onClose();
      setName('');
      setSymbol('');
      setQuantity('');
      setAvgPrice('');
    } catch (error) {
      console.error('Error creating holding:', error);
    }
  }, [isValid, createHolding, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setName('');
    setSymbol('');
    setQuantity('');
    setAvgPrice('');
  }, [onClose]);

  return (
    <Dialog open={visible} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <View className="gap-3">
          <View>
            <Label>Name</Label>
            <Input 
              value={name} 
              onChangeText={setName} 
              placeholder="INFY" 
              autoFocus
            />
          </View>
          <View>
            <Label>Symbol</Label>
            <Input 
              value={symbol} 
              onChangeText={setSymbol} 
              placeholder="NSE:INFY" 
            />
          </View>
          <View>
            <Label>Quantity</Label>
            <Input 
              keyboardType="numeric" 
              value={quantity} 
              onChangeText={(text) => handleNumericChange(text, setQuantity)} 
              placeholder="0" 
            />
          </View>
          <View>
            <Label>Avg Price</Label>
            <Input 
              keyboardType="numeric" 
              value={avgPrice} 
              onChangeText={(text) => handleNumericChange(text, setAvgPrice)} 
              placeholder="0" 
            />
          </View>
        </View>
        <DialogFooter>
          <Button variant="secondary" onPress={handleClose}>Cancel</Button>
          <Button onPress={onSubmit} disabled={createHolding.isPending || !isValid}>
            {createHolding.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


