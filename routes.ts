import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin, hashPassword } from "./auth";
import { sendServiceRequestWebhook } from "./webhook";
import passport from "passport";
import { 
  insertBillSchema,
  insertMeterReadingSchema,
  insertServiceRequestSchema,
  insertNotificationSchema,
  insertUserSchema,
  insertNewsSchema,
  insertDocumentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Registration schema
  const registerSchema = insertUserSchema.extend({
    password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  }).refine(data => data.phone || data.email, {
    message: "Необходимо указать телефон или email",
    path: ["phone"],
  });

  // Profile update schema
  const updateProfileSchema = z.object({
    firstName: z.string().min(1, "Введите имя").optional().or(z.literal("").transform(() => undefined)),
    lastName: z.string().min(1, "Введите фамилию").optional().or(z.literal("").transform(() => undefined)),
    phone: z.string().min(1).optional().or(z.literal("").transform(() => undefined)),
    email: z.string().email("Неверный формат email").optional().or(z.literal("").transform(() => undefined)),
  }).transform((data) => ({
    firstName: data.firstName?.trim() || undefined,
    lastName: data.lastName?.trim() || undefined,
    phone: data.phone?.trim() || undefined,
    email: data.email?.trim() || undefined,
  }));

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const { phone, email, password, firstName, lastName } = validation.data;

      // Check if user already exists
      if (phone) {
        const existingUser = await storage.getUserByPhone(phone);
        if (existingUser) {
          return res.status(400).json({ message: "Пользователь с таким телефоном уже существует" });
        }
      }
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(400).json({ message: "Пользователь с таким email уже существует" });
        }
      }

      // Create user
      const hashedPassword = hashPassword(password);
      const user = await storage.createUser({
        phone,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка при входе" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Ошибка при регистрации" });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    console.log('[LOGIN] Request body:', req.body);
    passport.authenticate('local', (err: any, user: any, info: any) => {
      console.log('[LOGIN] Passport result - err:', err, 'user:', user?.email, 'info:', info);
      if (err) {
        console.error('[LOGIN] Error:', err);
        return res.status(500).json({ message: "Ошибка сервера" });
      }
      if (!user) {
        console.log('[LOGIN] No user found');
        return res.status(401).json({ message: info?.message || "Неверный телефон/email или пароль" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('[LOGIN] req.login error:', err);
          return res.status(500).json({ message: "Ошибка при входе" });
        }
        console.log('[LOGIN] Success, returning user');
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе" });
      }
      res.json({ message: "Успешный выход" });
    });
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch('/api/user/apartment', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { apartmentId } = req.body;
      await storage.updateUserApartment(userId, apartmentId);
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error updating user apartment:", error);
      res.status(500).json({ message: "Failed to update apartment" });
    }
  });

  app.patch('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Validate input
      const validation = updateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const { firstName, lastName, phone, email } = validation.data;

      // Check if there's anything to update
      if (!firstName && !lastName && !phone && !email) {
        return res.status(400).json({ message: "Нет данных для обновления" });
      }

      // Check for uniqueness if email or phone is being updated
      if (phone) {
        const existingUser = await storage.getUserByPhone(phone);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Пользователь с таким телефоном уже существует" });
        }
      }
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Пользователь с таким email уже существует" });
        }
      }

      await storage.updateUserProfile(userId, { firstName, lastName, phone, email });
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Apartment routes
  app.get('/api/apartments', requireAuth, async (req, res) => {
    try {
      const apartments = await storage.getApartments();
      res.json(apartments);
    } catch (error) {
      console.error("Error fetching apartments:", error);
      res.status(500).json({ message: "Failed to fetch apartments" });
    }
  });

  // Bill routes
  app.get('/api/bills', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const bills = await storage.getBillsByApartment(user.apartmentId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get('/api/bills/:id', requireAuth, async (req: any, res) => {
    try {
      const bill = await storage.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post('/api/bills/:id/pay', requireAuth, async (req: any, res) => {
    try {
      const bill = await storage.getBill(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      await storage.updateBillStatus(req.params.id, "paid", new Date());
      const updatedBill = await storage.getBill(req.params.id);
      res.json(updatedBill);
    } catch (error) {
      console.error("Error paying bill:", error);
      res.status(500).json({ message: "Failed to pay bill" });
    }
  });

  // Meter Reading routes
  app.get('/api/meter-readings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const readings = await storage.getMeterReadingsByApartment(user.apartmentId);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching meter readings:", error);
      res.status(500).json({ message: "Failed to fetch meter readings" });
    }
  });

  app.get('/api/meter-readings/latest/:meterType', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const reading = await storage.getLatestMeterReading(user.apartmentId, req.params.meterType);
      res.json(reading || null);
    } catch (error) {
      console.error("Error fetching latest meter reading:", error);
      res.status(500).json({ message: "Failed to fetch latest meter reading" });
    }
  });

  app.post('/api/meter-readings', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const data = insertMeterReadingSchema.parse({
        ...req.body,
        apartmentId: user.apartmentId,
        submittedBy: userId,
      });

      const reading = await storage.createMeterReading(data);
      res.json(reading);
    } catch (error: any) {
      console.error("Error creating meter reading:", error);
      res.status(400).json({ message: error.message || "Failed to create meter reading" });
    }
  });

  // Service Request routes
  app.get('/api/service-requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      // Admin can see all requests
      const requests = user.role === "admin" 
        ? await storage.getAllServiceRequests()
        : await storage.getServiceRequestsByApartment(user.apartmentId);
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get('/api/service-requests/:id', requireAuth, async (req: any, res) => {
    try {
      const request = await storage.getServiceRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  app.post('/api/service-requests', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const data = insertServiceRequestSchema.parse({
        ...req.body,
        apartmentId: user.apartmentId,
        userId: userId,
      });

      const request = await storage.createServiceRequest(data);
      
      // Send webhook notification to n8n (fire-and-forget, don't block response)
      setImmediate(async () => {
        try {
          const apartment = await storage.getApartment(user.apartmentId!);
          if (apartment) {
            await sendServiceRequestWebhook({
              requestId: request.id,
              title: request.title,
              category: request.category,
              description: request.description,
              priority: request.priority,
              status: request.status,
              apartment: {
                number: apartment.number,
                entrance: apartment.entrance,
                floor: apartment.floor,
              },
              user: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email,
              },
              createdAt: request.createdAt.toISOString(),
              appUrl: process.env.REPLIT_DEV_DOMAIN 
                ? `https://${process.env.REPLIT_DEV_DOMAIN}/requests` 
                : undefined,
            });
          }
        } catch (error) {
          console.error('Failed to send webhook notification:', error);
        }
      });
      
      res.json(request);
    } catch (error: any) {
      console.error("Error creating service request:", error);
      res.status(400).json({ message: error.message || "Failed to create service request" });
    }
  });

  app.patch('/api/service-requests/:id/status', requireAuth, async (req: any, res) => {
    try {
      const { status, adminNotes } = req.body;
      await storage.updateServiceRequestStatus(req.params.id, status, adminNotes);
      const request = await storage.getServiceRequest(req.params.id);
      res.json(request);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const newsList = await storage.getAllNews();
      res.json(newsList);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get('/api/news/:id', async (req, res) => {
    try {
      const newsItem = await storage.getNews(req.params.id);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      
      await storage.incrementNewsViews(req.params.id);
      res.json(newsItem);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/news', requireAdmin, async (req: any, res) => {
    try {
      const validation = insertNewsSchema.safeParse({
        ...req.body,
        authorId: req.user.id,
      });

      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const newsItem = await storage.createNews(validation.data);
      res.json(newsItem);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  app.put('/api/news/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertNewsSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      const newsItem = await storage.updateNews(req.params.id, validation.data);
      if (!newsItem) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(newsItem);
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Failed to update news" });
    }
  });

  app.delete('/api/news/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteNews(req.params.id);
      res.json({ message: "News deleted successfully" });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // Document routes
  app.get('/api/documents', requireAuth, async (req, res) => {
    try {
      const documents = await storage.getPublicDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/documents/:id', requireAuth, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post('/api/documents', requireAdmin, async (req: any, res) => {
    try {
      const validation = insertDocumentSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      // Validate external URLs (not uploaded files)
      const fileUrl = validation.data.fileUrl;
      if (fileUrl && !fileUrl.startsWith('/objects/')) {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(fileUrl)) {
          return res.status(400).json({ 
            message: "External URL must start with http:// or https://" 
          });
        }
      }

      const documentData = {
        ...validation.data,
        uploadedBy: req.user.id,
        fileSize: 0, // Unknown size for external URLs
        isPublic: true,
      };
      const document = await storage.createDocument(documentData as any);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put('/api/documents/:id', requireAdmin, async (req, res) => {
    try {
      const validation = insertDocumentSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.errors[0].message });
      }

      // Validate external URLs (not uploaded files)
      const fileUrl = validation.data.fileUrl;
      if (fileUrl && !fileUrl.startsWith('/objects/')) {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(fileUrl)) {
          return res.status(400).json({ 
            message: "External URL must start with http:// or https://" 
          });
        }
      }

      const document = await storage.updateDocument(req.params.id, validation.data);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', requireAdmin, async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Voting routes
  app.get('/api/votings', requireAuth, async (req, res) => {
    try {
      const votings = await storage.getActiveVotings();
      res.json(votings);
    } catch (error) {
      console.error("Error fetching votings:", error);
      res.status(500).json({ message: "Failed to fetch votings" });
    }
  });

  app.get('/api/votings/:id', requireAuth, async (req: any, res) => {
    try {
      const voting = await storage.getVoting(req.params.id);
      if (!voting) {
        return res.status(404).json({ message: "Voting not found" });
      }

      const options = await storage.getVotingOptions(req.params.id);
      const userId = req.user.id;
      const userVote = await storage.getUserVote(req.params.id, userId);

      // Get vote counts for each option
      const optionsWithVotes = await Promise.all(
        options.map(async (option) => ({
          ...option,
          votes: await storage.getVotesCount(option.id),
        }))
      );

      res.json({
        ...voting,
        options: optionsWithVotes,
        hasVoted: !!userVote,
      });
    } catch (error) {
      console.error("Error fetching voting:", error);
      res.status(500).json({ message: "Failed to fetch voting" });
    }
  });

  app.post('/api/votings/:id/vote', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.apartmentId) {
        return res.status(400).json({ message: "No apartment assigned" });
      }

      const { optionId } = req.body;
      
      // Check if user already voted
      const existingVote = await storage.getUserVote(req.params.id, userId);
      if (existingVote) {
        return res.status(400).json({ message: "Already voted" });
      }

      const vote = await storage.createVote({
        votingId: req.params.id,
        optionId,
        userId,
        apartmentId: user.apartmentId,
      });

      res.json(vote);
    } catch (error) {
      console.error("Error creating vote:", error);
      res.status(500).json({ message: "Failed to create vote" });
    }
  });

  // Notification routes
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Object storage routes (Referenced from blueprint:javascript_object_storage)
  const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
  const { ObjectPermission } = await import("./objectAcl");

  // Download uploaded document
  app.get("/objects/:objectPath(*)", requireAuth, async (req: any, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for document
  app.post("/api/objects/upload", requireAdmin, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      console.log("[DEBUG] Getting upload URL...");
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("[DEBUG] Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("[ERROR] Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // NEW V2 endpoint to bypass browser cache issues
  app.post("/api/objects/get-upload-url", requireAdmin, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      console.log("[DEBUG V2] Getting upload URL...");
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("[DEBUG V2] Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("[ERROR V2] Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Save document metadata after upload
  app.put("/api/documents-upload", requireAdmin, async (req: any, res) => {
    if (!req.body.fileUrl) {
      return res.status(400).json({ error: "fileUrl is required" });
    }

    const userId = req.user.id;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.fileUrl,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting document ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
