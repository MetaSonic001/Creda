import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  unique,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ----------------------------
// ENUM TYPES
// ----------------------------
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type TransactionType = "expense" | "income";
export type AssetType = "stock" | "mutual_fund" | "bond" | "crypto" | "other";
export type GoalStatus = "active" | "completed" | "failed";
export type BillStatus = "pending" | "paid" | "overdue";
export type ClaimStatus = "draft" | "submitted" | "approved" | "rejected";

// ----------------------------
// USERS
// ----------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password"),
  preferred_language: text("preferred_language").default("en"),
  last_synced: text("last_synced"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  is_deleted: integer("is_deleted", { mode: "boolean" })
    .notNull()
    .default(sql`0`),
});

// ----------------------------
// EXPENSES & BUDGET
// ----------------------------
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  user_id: text("user_id").notNull().references(() => users.id),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  type: text("type").$type<TransactionType>().notNull(),
  category_id: integer("category_id").references(() => categories.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("INR"),
  date: text("date").notNull(),
  notes: text("notes"),
  recurrence: text("recurrence").$type<RecurrenceType>().default("none"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const budgets = sqliteTable("budgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  category_id: integer("category_id").references(() => categories.id),
  amount: real("amount").notNull(),
  start_date: text("start_date"),
  end_date: text("end_date"),
  recurrence: text("recurrence").$type<RecurrenceType>().default("monthly"),
});

// ----------------------------
// INVESTMENTS & PORTFOLIO
// ----------------------------
export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").$type<AssetType>().notNull(),
  symbol: text("symbol"), // e.g. NSE:INFY
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const holdings = sqliteTable("holdings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  asset_id: integer("asset_id").notNull().references(() => assets.id),
  quantity: real("quantity").notNull(),
  avg_price: real("avg_price").notNull(),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------------
// GOALS
// ----------------------------
export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  target_amount: real("target_amount").notNull(),
  deadline: text("deadline"),
  status: text("status").$type<GoalStatus>().default("active"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const goal_contributions = sqliteTable("goal_contributions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  goal_id: integer("goal_id").notNull().references(() => goals.id),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
});

// ----------------------------
// BILLS & PAYMENTS
// ----------------------------
export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  due_date: text("due_date").notNull(),
  status: text("status").$type<BillStatus>().default("pending"),
  recurrence: text("recurrence").$type<RecurrenceType>().default("monthly"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------------
// INSURANCE & CLAIMS
// ----------------------------
export const policies = sqliteTable("policies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(),
  policy_number: text("policy_number").notNull(),
  document_url: text("document_url"), // uploaded file reference
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const claims = sqliteTable("claims", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  policy_id: integer("policy_id").notNull().references(() => policies.id),
  description: text("description"),
  status: text("status").$type<ClaimStatus>().default("draft"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------------
// FRAUD ALERTS / SECURITY LOGS
// ----------------------------
export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  transaction_id: integer("transaction_id").references(() => transactions.id),
  resolved: integer("resolved", { mode: "boolean" }).default(sql`0`),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ----------------------------
// KNOWLEDGE BASE SOURCES
// ----------------------------
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  snippet: text("snippet").notNull(),
  source_url: text("source_url"),
  type: text("type"), // RBI, IRDAI, SEBI, etc.
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
