import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const rooms = pgTable("rooms", {
  code: text("code").primaryKey(),
  title: text("title").notNull().default("Team Shuffle"),
  groupSize: integer("group_size").notNull(),
  status: text("status").notNull().default("open"),
  shuffleSeq: integer("shuffle_seq").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  roomCode: text("room_code").notNull(),
  name: text("name").notNull(),
  claimed: boolean("claimed").notNull().default(false),
  groupNumber: integer("group_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Room = typeof rooms.$inferSelect
export type Participant = typeof participants.$inferSelect
