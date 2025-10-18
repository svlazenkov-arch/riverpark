import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import {
  users,
  apartments,
  bills,
  meterReadings,
  serviceRequests,
  news,
  documents,
  votings,
  votingOptions,
  votes,
  notifications,
  type User,
  type InsertUser,
  type Apartment,
  type InsertApartment,
  type Bill,
  type InsertBill,
  type MeterReading,
  type InsertMeterReading,
  type ServiceRequest,
  type InsertServiceRequest,
  type News,
  type InsertNews,
  type Document,
  type InsertDocument,
  type Voting,
  type InsertVoting,
  type VotingOption,
  type InsertVotingOption,
  type Vote,
  type InsertVote,
  type Notification,
  type InsertNotification,
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserApartment(userId: string, apartmentId: string): Promise<void>;
  updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; email?: string }): Promise<void>;

  // Apartment operations
  getApartment(id: string): Promise<Apartment | undefined>;
  getApartments(): Promise<Apartment[]>;
  createApartment(apartment: InsertApartment): Promise<Apartment>;

  // Bill operations
  getBillsByApartment(apartmentId: string): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBillStatus(id: string, status: string, paidAt?: Date): Promise<void>;

  // Meter Reading operations
  getMeterReadingsByApartment(apartmentId: string): Promise<MeterReading[]>;
  getLatestMeterReading(apartmentId: string, meterType: string): Promise<MeterReading | undefined>;
  createMeterReading(reading: InsertMeterReading): Promise<MeterReading>;

  // Service Request operations
  getServiceRequestsByApartment(apartmentId: string): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  getAllServiceRequests(): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: string, status: string, adminNotes?: string): Promise<void>;

  // News operations
  getAllNews(): Promise<News[]>;
  getNews(id: string): Promise<News | undefined>;
  createNews(newsItem: InsertNews): Promise<News>;
  updateNews(id: string, newsItem: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: string): Promise<void>;
  incrementNewsViews(id: string): Promise<void>;

  // Document operations
  getPublicDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<void>;

  // Voting operations
  getActiveVotings(): Promise<Voting[]>;
  getVoting(id: string): Promise<Voting | undefined>;
  getVotingOptions(votingId: string): Promise<VotingOption[]>;
  getUserVote(votingId: string, userId: string): Promise<Vote | undefined>;
  createVoting(voting: InsertVoting): Promise<Voting>;
  createVotingOption(option: InsertVotingOption): Promise<VotingOption>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesCount(optionId: string): Promise<number>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserApartment(userId: string, apartmentId: string): Promise<void> {
    await db.update(users).set({ apartmentId }).where(eq(users.id, userId));
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; email?: string }): Promise<void> {
    const updateData: any = {};
    if (data.firstName !== undefined && data.firstName.trim()) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined && data.lastName.trim()) updateData.lastName = data.lastName.trim();
    if (data.phone !== undefined && data.phone.trim()) updateData.phone = data.phone.trim();
    if (data.email !== undefined && data.email.trim()) updateData.email = data.email.trim();
    
    // Only update if there's data to update
    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, userId));
    }
  }

  // Apartment operations
  async getApartment(id: string): Promise<Apartment | undefined> {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    return apartment;
  }

  async getApartments(): Promise<Apartment[]> {
    return await db.select().from(apartments);
  }

  async createApartment(apartmentData: InsertApartment): Promise<Apartment> {
    const [apartment] = await db.insert(apartments).values(apartmentData).returning();
    return apartment;
  }

  // Bill operations
  async getBillsByApartment(apartmentId: string): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.apartmentId, apartmentId));
  }

  async getBill(id: string): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(billData: InsertBill): Promise<Bill> {
    const [bill] = await db.insert(bills).values(billData).returning();
    return bill;
  }

  async updateBillStatus(id: string, status: string, paidAt?: Date): Promise<void> {
    await db.update(bills).set({ status, paidAt }).where(eq(bills.id, id));
  }

  // Meter Reading operations
  async getMeterReadingsByApartment(apartmentId: string): Promise<MeterReading[]> {
    return await db.select().from(meterReadings).where(eq(meterReadings.apartmentId, apartmentId));
  }

  async getLatestMeterReading(apartmentId: string, meterType: string): Promise<MeterReading | undefined> {
    const readings = await db
      .select()
      .from(meterReadings)
      .where(eq(meterReadings.apartmentId, apartmentId))
      .orderBy(meterReadings.submittedAt);
    
    return readings.filter(r => r.meterType === meterType).pop();
  }

  async createMeterReading(readingData: InsertMeterReading): Promise<MeterReading> {
    const [reading] = await db.insert(meterReadings).values(readingData).returning();
    return reading;
  }

  // Service Request operations
  async getServiceRequestsByApartment(apartmentId: string): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.apartmentId, apartmentId));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const [request] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return request;
  }

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests);
  }

  async createServiceRequest(requestData: InsertServiceRequest): Promise<ServiceRequest> {
    const [request] = await db.insert(serviceRequests).values(requestData).returning();
    return request;
  }

  async updateServiceRequestStatus(id: string, status: string, adminNotes?: string): Promise<void> {
    await db.update(serviceRequests).set({ status, adminNotes, updatedAt: new Date() }).where(eq(serviceRequests.id, id));
  }

  // News operations
  async getAllNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(news.publishedAt);
  }

  async getNews(id: string): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem;
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [newsItem] = await db.insert(news).values(newsData).returning();
    return newsItem;
  }

  async incrementNewsViews(id: string): Promise<void> {
    const newsItem = await this.getNews(id);
    if (newsItem) {
      await db.update(news).set({ views: newsItem.views + 1 }).where(eq(news.id, id));
    }
  }

  async updateNews(id: string, newsData: Partial<InsertNews>): Promise<News | undefined> {
    const [updated] = await db.update(news).set(newsData).where(eq(news.id, id)).returning();
    return updated;
  }

  async deleteNews(id: string): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Document operations
  async getPublicDocuments(): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.isPublic, true));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async updateDocument(id: string, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db.update(documents).set(documentData).where(eq(documents.id, id)).returning();
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Voting operations
  async getActiveVotings(): Promise<Voting[]> {
    return await db.select().from(votings).where(eq(votings.status, "active"));
  }

  async getVoting(id: string): Promise<Voting | undefined> {
    const [voting] = await db.select().from(votings).where(eq(votings.id, id));
    return voting;
  }

  async getVotingOptions(votingId: string): Promise<VotingOption[]> {
    return await db.select().from(votingOptions).where(eq(votingOptions.votingId, votingId));
  }

  async getUserVote(votingId: string, userId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(
        eq(votes.votingId, votingId),
        eq(votes.userId, userId)
      ));
    return vote;
  }

  async createVoting(votingData: InsertVoting): Promise<Voting> {
    const [voting] = await db.insert(votings).values(votingData).returning();
    return voting;
  }

  async createVotingOption(optionData: InsertVotingOption): Promise<VotingOption> {
    const [option] = await db.insert(votingOptions).values(optionData).returning();
    return option;
  }

  async createVote(voteData: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(voteData).returning();
    return vote;
  }

  async getVotesCount(optionId: string): Promise<number> {
    const votesList = await db.select().from(votes).where(eq(votes.optionId, optionId));
    return votesList.length;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt);
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
