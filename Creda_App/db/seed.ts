import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import * as schema from '~/store/schema';
import { v7 as uuidv7 } from 'uuid';
import 'react-native-get-random-values';

// Import all your schema tables
const {
  users,
  categories,
  transactions,
  budgets,
  assets,
  holdings,
  goals,
  goal_contributions,
  bills,
  policies,
  claims,
  alerts,
  sources
} = schema;

export async function seedDatabase(expoDb: SQLiteDatabase) {
  const db = drizzle(expoDb, { schema });

  try {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, '123'));

    if (existingUser.length === 0) {
      // ----------------------------
      // SEED USER
      // ----------------------------
      await db.insert(users).values({
        id: '123',
        email: 'user123@example.com',
        name: 'John Doe',
        password: 'hashed_password_123',
        preferred_language: 'en',
        last_synced: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_deleted: false
      });
      console.log('✅ User seeded');
    } else {
      console.log('ℹ️ User already exists, skipping user creation');
    }

    // ----------------------------
    // SEED CATEGORIES
    // ----------------------------
    const categoriesData = [
      { name: 'Groceries', user_id: '123' },
      { name: 'Rent', user_id: '123' },
      { name: 'Utilities', user_id: '123' },
      { name: 'Entertainment', user_id: '123' },
      { name: 'Transportation', user_id: '123' },
      { name: 'Healthcare', user_id: '123' },
      { name: 'Salary', user_id: '123' },
      { name: 'Investment', user_id: '123' },
      { name: 'Dining Out', user_id: '123' },
      { name: 'Shopping', user_id: '123' }
    ];

    // Clear existing categories for this user and insert new ones
    await db.delete(categories).where(eq(categories.user_id, '123'));

    const insertedCategories = await db.insert(categories).values(categoriesData).returning();
    console.log('✅ Categories seeded');

    // ----------------------------
    // SEED TRANSACTIONS
    // ----------------------------
    const transactionsData = [
      {
        user_id: '123',
        type: 'expense' as const,
        category_id: insertedCategories[0].id, // Groceries
        amount: -2500.50,
        currency: 'INR',
        date: new Date('2024-01-15').toISOString(),
        notes: 'Monthly grocery shopping',
        recurrence: 'monthly' as const
      },
      {
        user_id: '123',
        type: 'expense' as const,
        category_id: insertedCategories[1].id, // Rent
        amount: -15000.00,
        currency: 'INR',
        date: new Date('2024-01-01').toISOString(),
        notes: 'Apartment rent',
        recurrence: 'monthly' as const
      },
      {
        user_id: '123',
        type: 'income' as const,
        category_id: insertedCategories[6].id, // Salary
        amount: 75000.00,
        currency: 'INR',
        date: new Date('2024-01-30').toISOString(),
        notes: 'Monthly salary',
        recurrence: 'monthly' as const
      },
      {
        user_id: '123',
        type: 'expense' as const,
        category_id: insertedCategories[4].id, // Transportation
        amount: -3500.75,
        currency: 'INR',
        date: new Date('2024-01-20').toISOString(),
        notes: 'Fuel and maintenance'
      }
    ];

    await db.delete(transactions).where(eq(transactions.user_id, '123'));
    await db.insert(transactions).values(transactionsData);
    console.log('✅ Transactions seeded');

    // ----------------------------
    // SEED BUDGETS
    // ----------------------------
    const budgetsData = [
      {
        user_id: '123',
        category_id: insertedCategories[0].id, // Groceries
        amount: 3000.00,
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-01-31').toISOString(),
        recurrence: 'monthly' as const
      },
      {
        user_id: '123',
        category_id: insertedCategories[3].id, // Entertainment
        amount: 5000.00,
        start_date: new Date('2024-01-01').toISOString(),
        end_date: new Date('2024-01-31').toISOString(),
        recurrence: 'monthly' as const
      }
    ];

    await db.delete(budgets).where(eq(budgets.user_id, '123'));
    await db.insert(budgets).values(budgetsData);
    console.log('✅ Budgets seeded');

    // ----------------------------
    // SEED ASSETS & HOLDINGS
    // ----------------------------
    const assetsData = [
      {
        user_id: '123',
        name: 'Reliance Industries',
        type: 'stock' as const,
        symbol: 'NSE:RELIANCE'
      },
      {
        user_id: '123',
        name: 'HDFC Mutual Fund',
        type: 'mutual_fund' as const,
        symbol: 'MF:HDFCTOP100'
      },
      {
        user_id: '123',
        name: 'Bitcoin',
        type: 'crypto' as const,
        symbol: 'BTC-USD'
      }
    ];

    await db.delete(holdings).where(eq(holdings.user_id, '123'));
    await db.delete(assets).where(eq(assets.user_id, '123'));

    const insertedAssets = await db.insert(assets).values(assetsData).returning();

    const holdingsData = [
      {
        user_id: '123',
        asset_id: insertedAssets[0].id,
        quantity: 10,
        avg_price: 2450.75
      },
      {
        user_id: '123',
        asset_id: insertedAssets[1].id,
        quantity: 150.25,
        avg_price: 125.50
      },
      {
        user_id: '123',
        asset_id: insertedAssets[2].id,
        quantity: 0.5,
        avg_price: 3200000.00
      }
    ];

    await db.insert(holdings).values(holdingsData);
    console.log('✅ Assets & Holdings seeded');

    // ----------------------------
    // SEED GOALS & CONTRIBUTIONS
    // ----------------------------
    const goalsData = [
      {
        user_id: '123',
        title: 'Emergency Fund',
        target_amount: 500000.00,
        deadline: new Date('2024-12-31').toISOString(),
        status: 'active' as const
      },
      {
        user_id: '123',
        title: 'New Car',
        target_amount: 1000000.00,
        deadline: new Date('2025-06-30').toISOString(),
        status: 'active' as const
      }
    ];

    await db.delete(goal_contributions).where(eq(goal_contributions.goal_id,
      db.select({ id: goals.id }).from(goals).where(eq(goals.user_id, '123'))
    ));
    await db.delete(goals).where(eq(goals.user_id, '123'));

    const insertedGoals = await db.insert(goals).values(goalsData).returning();

    const contributionsData = [
      {
        goal_id: insertedGoals[0].id,
        amount: 25000.00,
        date: new Date('2024-01-15').toISOString()
      },
      {
        goal_id: insertedGoals[1].id,
        amount: 15000.00,
        date: new Date('2024-01-20').toISOString()
      }
    ];

    await db.insert(goal_contributions).values(contributionsData);
    console.log('✅ Goals & Contributions seeded');

    // ----------------------------
    // SEED BILLS
    // ----------------------------
    const billsData = [
      {
        user_id: '123',
        name: 'Electricity Bill',
        amount: 2500.00,
        due_date: new Date('2024-02-05').toISOString(),
        status: 'pending' as const,
        recurrence: 'monthly' as const
      },
      {
        user_id: '123',
        name: 'Internet Bill',
        amount: 899.00,
        due_date: new Date('2024-02-10').toISOString(),
        status: 'pending' as const,
        recurrence: 'monthly' as const
      }
    ];

    await db.delete(bills).where(eq(bills.user_id, '123'));
    await db.insert(bills).values(billsData);
    console.log('✅ Bills seeded');

    // ----------------------------
    // SEED POLICIES & CLAIMS
    // ----------------------------
    const policiesData = [
      {
        user_id: '123',
        provider: 'LIC India',
        policy_number: 'LIC-789456123',
        document_url: 'https://example.com/docs/lic_policy.pdf'
      },
      {
        user_id: '123',
        provider: 'HDFC Ergo',
        policy_number: 'HDFC-456789123',
        document_url: 'https://example.com/docs/health_insurance.pdf'
      }
    ];

    await db.delete(claims).where(eq(claims.policy_id,
      db.select({ id: policies.id }).from(policies).where(eq(policies.user_id, '123'))
    ));
    await db.delete(policies).where(eq(policies.user_id, '123'));

    const insertedPolicies = await db.insert(policies).values(policiesData).returning();

    const claimsData = [
      {
        policy_id: insertedPolicies[1].id,
        description: 'Health checkup reimbursement',
        status: 'approved' as const
      }
    ];

    await db.insert(claims).values(claimsData);
    console.log('✅ Policies & Claims seeded');

    // ----------------------------
    // SEED ALERTS
    // ----------------------------
    const alertsData = [
      {
        user_id: '123',
        message: 'Unusual spending pattern detected in Entertainment category',
        resolved: false
      },
      {
        user_id: '123',
        message: 'Large transaction detected above usual threshold',
        resolved: true
      }
    ];

    await db.delete(alerts).where(eq(alerts.user_id, '123'));
    await db.insert(alerts).values(alertsData);
    console.log('✅ Alerts seeded');

    // ----------------------------
    // SEED KNOWLEDGE SOURCES
    // ----------------------------
    const sourcesData = [
      {
        title: 'RBI Guidelines on Personal Finance',
        snippet: 'Latest RBI guidelines for personal financial management and banking services',
        source_url: 'https://rbi.org.in',
        type: 'RBI'
      },
      {
        title: 'SEBI Investor Protection',
        snippet: 'SEBI guidelines for stock market investors and mutual fund investments',
        source_url: 'https://sebi.gov.in',
        type: 'SEBI'
      }
    ];

    // Sources are not user-specific, so we don't delete existing ones
    const existingSources = await db.select().from(sources);
    if (existingSources.length === 0) {
      await db.insert(sources).values(sourcesData);
      console.log('✅ Knowledge sources seeded');
    }

    console.log('🎉 Database seeding completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  }
}

// Helper function to check if seeding is needed
export async function needsSeeding(expoDb: SQLiteDatabase): Promise<boolean> {
  const db = drizzle(expoDb, { schema });

  try {
    const userCount = await db.select().from(users).where(eq(users.id, '123'));
    const categoriesCount = await db.select().from(categories).where(eq(categories.user_id, '123'));

    // If user exists but has no categories, consider it needs seeding
    return userCount.length === 0 || categoriesCount.length === 0;
  } catch (error) {
    console.error('Error checking seeding status:', error);
    return true;
  }
}


export async function initializeDatabase(expoDb: SQLiteDatabase) {
  try {
    const shouldSeed = await needsSeeding(expoDb);

    if (shouldSeed) {
      console.log('Starting database seeding...');
      await seedDatabase(expoDb);
    } else {
      console.log('Database already seeded, skipping...');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}
