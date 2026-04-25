import {
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const contractStatusEnum = pgEnum("contract_status", ["active", "pending", "completed", "at_risk"]);
export const revenueStatusEnum = pgEnum("revenue_status", ["projected", "realized"]);
export const expenseCategoryEnum = pgEnum("expense_category", [
  "labor",
  "materials",
  "equipment",
  "software",
  "logistics",
  "overhead"
]);

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: varchar("city", { length: 120 }).notNull(),
  agency: varchar("agency", { length: 180 }).notNull(),
  number: varchar("number", { length: 80 }).notNull().unique(),
  object: text("object").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: contractStatusEnum("status").notNull().default("pending"),
  totalValue: numeric("total_value", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const contractItems = pgTable(
  "contract_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .references(() => contracts.id, { onDelete: "cascade" })
      .notNull(),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    contractIdx: index("contract_items_contract_idx").on(table.contractId)
  })
);

export const capex = pgTable(
  "capex",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .references(() => contracts.id, { onDelete: "cascade" })
      .notNull(),
    month: varchar("month", { length: 7 }).notNull(),
    category: expenseCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    contractIdx: index("capex_contract_idx").on(table.contractId),
    monthIdx: index("capex_month_idx").on(table.month)
  })
);

export const opex = pgTable(
  "opex",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .references(() => contracts.id, { onDelete: "cascade" })
      .notNull(),
    month: varchar("month", { length: 7 }).notNull(),
    category: expenseCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    contractIdx: index("opex_contract_idx").on(table.contractId),
    monthIdx: index("opex_month_idx").on(table.month)
  })
);

export const revenue = pgTable(
  "revenue",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .references(() => contracts.id, { onDelete: "cascade" })
      .notNull(),
    month: varchar("month", { length: 7 }).notNull(),
    status: revenueStatusEnum("status").notNull().default("projected"),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    contractIdx: index("revenue_contract_idx").on(table.contractId),
    monthIdx: index("revenue_month_idx").on(table.month)
  })
);

export const contractsRelations = relations(contracts, ({ many }) => ({
  items: many(contractItems),
  capex: many(capex),
  opex: many(opex),
  revenue: many(revenue)
}));

export const contractItemsRelations = relations(contractItems, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractItems.contractId],
    references: [contracts.id]
  })
}));

export const capexRelations = relations(capex, ({ one }) => ({
  contract: one(contracts, {
    fields: [capex.contractId],
    references: [contracts.id]
  })
}));

export const opexRelations = relations(opex, ({ one }) => ({
  contract: one(contracts, {
    fields: [opex.contractId],
    references: [contracts.id]
  })
}));

export const revenueRelations = relations(revenue, ({ one }) => ({
  contract: one(contracts, {
    fields: [revenue.contractId],
    references: [contracts.id]
  })
}));

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image")
});

export const accounts = pgTable("accounts", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state")
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull()
});
