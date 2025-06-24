import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const guestBook = pgTable("guestBook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const todos = pgTable("todos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: varchar("content", { length: 255 }).notNull(),
  completed: integer("completed").notNull().default(0),
  projectId: integer("projectId").notNull(),
});

// Exportamos los tipos de Project y Todo para usarlos en el frontend
// Esto permite tener tipado estricto y reutilizar los modelos de la base de datos
export type Project = typeof projects.$inferSelect;
export type Todo = typeof todos.$inferSelect;
