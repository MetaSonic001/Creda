import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eq, sum } from 'drizzle-orm';
import { useDrizzle } from './db';
import { transactions, holdings, bills, budgets, goals, assets } from '~/store/schema';
import useAuthStore from '~/store/authStore';

export function useMonthlySpend() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['monthly-spend', currentUser.id],
    queryFn: async () => {
      const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
      const result = await db
        .select({ amount: sum(transactions.amount).as('total') })
        .from(transactions)
        .where(eq(transactions.user_id, currentUser.id));
      return result?.[0]?.amount ?? 0;
    },
  });
}

export function useBillsDueCount() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['bills-due', currentUser.id],
    queryFn: async () => {
      const all = await db.select().from(bills).where(eq(bills.user_id, currentUser.id));
      return all.length;
    },
  });
}

export function usePortfolioSummary() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['portfolio', currentUser.id],
    queryFn: async () => {
      const rows = await db.select().from(holdings).where(eq(holdings.user_id, currentUser.id));
      const invested = rows.reduce((s, r) => s + r.quantity * r.avg_price, 0);
      const value = invested; // placeholder until market prices are fetched
      const pnl = value - invested;
      const pct = invested ? (pnl / invested) * 100 : 0;
      return { invested, value, pnl, pct };
    },
  });
}

export function useHoldings() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['holdings', currentUser.id],
    queryFn: async () => await db.select().from(holdings).where(eq(holdings.user_id, currentUser.id)),
  });
}

export function useHoldingsWithAssets() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['holdings-with-assets', currentUser.id],
    queryFn: async () => {
      const result = await db
        .select({
          id: holdings.id,
          quantity: holdings.quantity,
          avg_price: holdings.avg_price,
          asset_id: holdings.asset_id,
          asset_name: assets.name,
          asset_symbol: assets.symbol,
          asset_type: assets.type,
        })
        .from(holdings)
        .leftJoin(assets, eq(holdings.asset_id, assets.id))
        .where(eq(holdings.user_id, currentUser.id));
      return result;
    },
  });
}

// ----------------------------
// Transactions (Expenses/Income)
// ----------------------------
export function useTransactions() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['transactions', currentUser.id],
    queryFn: async () => {
      return await db.select().from(transactions).where(eq(transactions.user_id, currentUser.id));
    },
  });
}

export function useCreateTransaction() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: {
      type: 'expense' | 'income';
      amount: number;
      category_id?: number | null;
      date: string;
      notes?: string | null;
      currency?: string;
      recurrence?: string;
    }) => {
      const res = await db.insert(transactions).values({
        user_id: currentUser.id,
        type: input.type,
        amount: input.amount,
        category_id: input.category_id ?? null,
        date: input.date,
        notes: input.notes ?? null,
        currency: input.currency ?? 'INR',
        recurrence: (input.recurrence as any) ?? 'none',
      });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['monthly-spend', currentUser.id] });
    },
  });
}

export function useDeleteTransaction() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.delete(transactions).where(eq(transactions.id, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['monthly-spend', currentUser.id] });
    },
  });
}

// ----------------------------
// Bills
// ----------------------------
export function useBills() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['bills', currentUser.id],
    queryFn: async () => await db.select().from(bills).where(eq(bills.user_id, currentUser.id)),
  });
}

export function useCreateBill() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      amount: number;
      due_date: string;
      status?: 'pending' | 'paid' | 'overdue';
      recurrence?: string;
    }) => {
      await db.insert(bills).values({
        user_id: currentUser.id,
        name: input.name,
        amount: input.amount,
        due_date: input.due_date,
        status: (input.status as any) ?? 'pending',
        recurrence: (input.recurrence as any) ?? 'monthly',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['bills-due', currentUser.id] });
    },
  });
}

export function useUpdateBillStatus() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: { id: number; status: 'pending' | 'paid' | 'overdue' }) => {
      await db.update(bills).set({ status: input.status }).where(eq(bills.id, input.id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['bills-due', currentUser.id] });
    },
  });
}

export function useDeleteBill() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.delete(bills).where(eq(bills.id, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills', currentUser.id] });
      qc.invalidateQueries({ queryKey: ['bills-due', currentUser.id] });
    },
  });
}

// ----------------------------
// Budgets
// ----------------------------
export function useBudgets() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['budgets', currentUser.id],
    queryFn: async () => await db.select().from(budgets).where(eq(budgets.user_id, currentUser.id)),
  });
}

export function useCreateBudget() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: {
      category_id?: number | null;
      amount: number;
      start_date?: string | null;
      end_date?: string | null;
      recurrence?: string;
    }) => {
      await db.insert(budgets).values({
        user_id: currentUser.id,
        category_id: input.category_id ?? null,
        amount: input.amount,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        recurrence: (input.recurrence as any) ?? 'monthly',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets', currentUser.id] });
    },
  });
}

export function useDeleteBudget() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.delete(budgets).where(eq(budgets.id, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets', currentUser.id] });
    },
  });
}

// ----------------------------
// Goals
// ----------------------------
export function useGoals() {
  const db = useDrizzle();
  const { currentUser } = useAuthStore();
  return useQuery({
    queryKey: ['goals', currentUser.id],
    queryFn: async () => await db.select().from(goals).where(eq(goals.user_id, currentUser.id)),
  });
}

export function useCreateGoal() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      target_amount: number;
      deadline?: string | null;
      status?: 'active' | 'completed' | 'failed';
    }) => {
      await db.insert(goals).values({
        user_id: currentUser.id,
        title: input.title,
        target_amount: input.target_amount,
        deadline: input.deadline ?? null,
        status: (input.status as any) ?? 'active',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', currentUser.id] });
    },
  });
}

export function useUpdateGoalStatus() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: { id: number; status: 'active' | 'completed' | 'failed' }) => {
      await db.update(goals).set({ status: input.status }).where(eq(goals.id, input.id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', currentUser.id] });
    },
  });
}

export function useDeleteGoal() {
  const db = useDrizzle();
  const qc = useQueryClient();
  const { currentUser } = useAuthStore();
  return useMutation({
    mutationFn: async (id: number) => {
      await db.delete(goals).where(eq(goals.id, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals', currentUser.id] });
    },
  });
}


