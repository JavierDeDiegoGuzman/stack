import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

// Tabla de usuarios para autenticación
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // Hash de la contraseña
});

export const guestBook = pgTable("guestBook", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// Ahora cada proyecto pertenece a un usuario
export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: integer("userId").notNull(), // Referencia al usuario propietario
});

// Ahora cada todo pertenece a un usuario
export const todos = pgTable("todos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  content: varchar("content", { length: 255 }).notNull(),
  completed: integer("completed").notNull().default(0),
  projectId: integer("projectId").notNull(),
  userId: integer("userId").notNull(), // Referencia al usuario propietario
});

// Exportamos los tipos de Project, Todo y User para usarlos en el frontend
export type Project = typeof projects.$inferSelect;
export type Todo = typeof todos.$inferSelect;
export type User = typeof users.$inferSelect;
