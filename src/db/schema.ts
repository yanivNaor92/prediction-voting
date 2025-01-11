import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  options: text('options').notNull(),
  votes: text('votes').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});