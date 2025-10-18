import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  phone: varchar("phone").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("resident"), // resident, admin
  apartmentId: varchar("apartment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  role: true,
  apartmentId: true 
}).extend({
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Apartments table
export const apartments = pgTable("apartments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number").notNull(),
  entrance: integer("entrance").notNull(),
  floor: integer("floor").notNull(),
  area: decimal("area", { precision: 10, scale: 2 }),
});

export const insertApartmentSchema = createInsertSchema(apartments).omit({ id: true });
export type InsertApartment = z.infer<typeof insertApartmentSchema>;
export type Apartment = typeof apartments.$inferSelect;

// Bills table
export const bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apartmentId: varchar("apartment_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("unpaid"), // paid, unpaid, overdue
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  details: jsonb("details"), // breakdown of charges
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true });
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

// Meter Readings table
export const meterReadings = pgTable("meter_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apartmentId: varchar("apartment_id").notNull(),
  meterType: text("meter_type").notNull(), // cold_water, hot_water, electricity, gas
  reading: decimal("reading", { precision: 10, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
  submittedBy: varchar("submitted_by").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
});

export const insertMeterReadingSchema = createInsertSchema(meterReadings).omit({ id: true, submittedAt: true });
export type InsertMeterReading = z.infer<typeof insertMeterReadingSchema>;
export type MeterReading = typeof meterReadings.$inferSelect;

// Service Requests table
export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apartmentId: varchar("apartment_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, rejected
  priority: text("priority").default("normal"), // low, normal, high, urgent
  photos: text("photos").array(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  adminNotes: text("admin_notes"),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;

// News table
export const news = pgTable("news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  authorId: varchar("author_id").notNull(),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNewsSchema = createInsertSchema(news).omit({ 
  id: true, 
  views: true, 
  createdAt: true,
  publishedAt: true 
});
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: text("category").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`now()`),
  isPublic: boolean("is_public").notNull().default(true),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  uploadedAt: true,
  uploadedBy: true,
  fileSize: true,
  isPublic: true
});
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Votings table
export const votings = pgTable("votings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  deadline: timestamp("deadline").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertVotingSchema = createInsertSchema(votings).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertVoting = z.infer<typeof insertVotingSchema>;
export type Voting = typeof votings.$inferSelect;

// Voting Options table
export const votingOptions = pgTable("voting_options", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  votingId: varchar("voting_id").notNull(),
  text: text("text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertVotingOptionSchema = createInsertSchema(votingOptions).omit({ id: true });
export type InsertVotingOption = z.infer<typeof insertVotingOptionSchema>;
export type VotingOption = typeof votingOptions.$inferSelect;

// Votes table
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  votingId: varchar("voting_id").notNull(),
  optionId: varchar("option_id").notNull(),
  userId: varchar("user_id").notNull(),
  apartmentId: varchar("apartment_id").notNull(),
  votedAt: timestamp("voted_at").notNull().default(sql`now()`),
});

export const insertVoteSchema = createInsertSchema(votes).omit({ 
  id: true, 
  votedAt: true 
});
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, success, error
  isRead: boolean("is_read").notNull().default(false),
  relatedId: varchar("related_id"),
  relatedType: text("related_type"), // bill, request, voting, news
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// API Response Types for Object Storage
export const uploadUrlResponseSchema = z.object({
  uploadURL: z.string().url(),
});
export type UploadUrlResponse = z.infer<typeof uploadUrlResponseSchema>;

export const documentUploadResponseSchema = z.object({
  objectPath: z.string(),
  message: z.string().optional(),
});
export type DocumentUploadResponse = z.infer<typeof documentUploadResponseSchema>;
