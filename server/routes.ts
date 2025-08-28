import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type SearchFilters, type ServiceProductFilters, type PhoneContactFilters } from "./storage";
import { insertUserSchema, insertSearchHistorySchema, insertReviewSchema, insertServiceSchema, insertProductSchema, insertPhoneContactSchema, insertContactReportSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  setupAuth(app);

  // Auth routes - using phone authentication
  app.get('/api/auth/user', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Enhanced search endpoint - searches both users and phone contacts
  app.get("/api/search", async (req, res) => {
    try {
      const { query, type, city, accountType, isVerified, isActive } = req.query;
      
      if (!query || !type) {
        return res.status(400).json({ message: "مطلوب استعلام ونوع البحث" });
      }

      const filters: SearchFilters = {};
      if (city) filters.city = city as string;
      if (accountType) filters.accountType = accountType as string;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      let result;
      if (type === "phone") {
        // For phone searches, get both registered users and phone contacts
        const users = await storage.searchUsersByPhone(query as string, filters);
        const phoneContacts = await storage.getPhoneContactsByNumber(query as string);
        
        result = {
          users,
          phoneContacts: phoneContacts.contacts,
          totalContacts: phoneContacts.contacts.length
        };
      } else if (type === "name") {
        const users = await storage.searchUsersByName(query as string, filters);
        const phoneSearchResults = await storage.searchPhoneByName(query as string);
        
        result = {
          users,
          phoneContacts: phoneSearchResults.flatMap(r => r.contacts),
          totalContacts: phoneSearchResults.reduce((sum, r) => sum + r.contacts.length, 0)
        };
      } else {
        return res.status(400).json({ message: "نوع بحث غير صحيح" });
      }
      
      // Add to search history
      await storage.addSearchHistory({
        query: query as string,
        searchType: type as string,
        results: JSON.stringify(result),
      });
      
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "خطأ في البحث" });
    }
  });

  // Add phone contact endpoint
  app.post("/api/phone-contacts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const validatedData = insertPhoneContactSchema.parse(req.body);
      const contact = await storage.addPhoneContact({
        ...validatedData,
        addedByUserId: req.user.id
      });
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Add contact error:", error);
      res.status(500).json({ message: "خطأ في إضافة جهة الاتصال" });
    }
  });

  // Get phone contacts by number
  app.get("/api/phone-contacts/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const result = await storage.getPhoneContactsByNumber(phoneNumber);
      res.json(result);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "خطأ في جلب جهات الاتصال" });
    }
  });

  // Search users by phone number (legacy endpoint)
  app.get("/api/search/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const users = await storage.searchUsersByPhone(phone);
      
      // Add to search history
      await storage.addSearchHistory({
        query: phone,
        searchType: "phone",
        results: JSON.stringify(users),
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن الرقم" });
    }
  });

  // Search users by name (legacy endpoint)
  app.get("/api/search/name/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const users = await storage.searchUsersByName(name);
      
      // Add to search history
      await storage.addSearchHistory({
        query: name,
        searchType: "name",
        results: JSON.stringify(users),
      });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن الاسم" });
    }
  });

  // Create new user profile
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if phone already exists
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "رقم الهاتف مسجل مسبقاً" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "خطأ في إنشاء الملف الشخصي" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  // Get user by phone
  app.get("/api/users/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const user = await storage.getUserByPhone(phone);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  // Get all users with optional filters
  app.get("/api/users", async (req, res) => {
    try {
      const { city, accountType, isVerified, isActive } = req.query;
      const filters: SearchFilters = {};
      if (city) filters.city = city as string;
      if (accountType) filters.accountType = accountType as string;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const users = await storage.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  // Get favorite users
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavoriteUsers();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المفضلة" });
    }
  });

  // Add user to favorites
  app.post("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.addToFavorites(userId);
      res.json({ message: "تم الإضافة للمفضلة" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في إضافة للمفضلة" });
    }
  });

  // Remove user from favorites
  app.delete("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.removeFromFavorites(userId);
      res.json({ message: "تم الحذف من المفضلة" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف من المفضلة" });
    }
  });

  // Get search history
  app.get("/api/search/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getRecentSearches(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب سجل البحث" });
    }
  });

  // Export users data
  app.get("/api/export", async (req, res) => {
    try {
      const format = req.query.format as string || "json";
      const users = await storage.getAllUsers();
      
      if (format === "csv") {
        // Convert to CSV format
        const csvHeader = "Name,Phone,City,Account Type,Verified,Active,Category\n";
        const csvData = users.map(user => 
          `"${user.name}","${user.phone}","${user.city || ''}","${user.accountType}","${user.isVerified}","${user.isActive}","${user.category || ''}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
        res.send(csvHeader + csvData);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts.json"');
        res.json(users);
      }
    } catch (error) {
      res.status(500).json({ message: "خطأ في تصدير البيانات" });
    }
  });

  // Import users data
  app.post("/api/import", async (req, res) => {
    try {
      const { users: importedUsers, format = "json" } = req.body;
      
      if (!importedUsers || !Array.isArray(importedUsers)) {
        return res.status(400).json({ message: "بيانات غير صحيحة للاستيراد" });
      }

      const results = {
        total: importedUsers.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const userData of importedUsers) {
        try {
          // Validate required fields
          if (!userData.name || !userData.phone) {
            results.failed++;
            results.errors.push(`مطلوب اسم ورقم هاتف للمستخدم`);
            continue;
          }

          // Check if phone already exists
          const existingUser = await storage.getUserByPhone(userData.phone);
          if (existingUser) {
            results.failed++;
            results.errors.push(`رقم الهاتف ${userData.phone} موجود مسبقاً`);
            continue;
          }

          // Create new user
          const validatedUser = insertUserSchema.parse({
            name: userData.name,
            phone: userData.phone,
            city: userData.city || null,
            accountType: userData.accountType || "personal",
            isVerified: userData.isVerified || false,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            category: userData.category || null
          });

          await storage.createUser(validatedUser);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`خطأ في إضافة ${userData.name || 'مستخدم'}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "خطأ في استيراد البيانات" });
    }
  });

  // Get reviews for a user
  app.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getReviewsForUser(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التقييمات" });
    }
  });

  // Get user rating summary
  app.get("/api/users/:userId/rating", async (req, res) => {
    try {
      const { userId } = req.params;
      const rating = await storage.getUserAverageRating(userId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التقييم" });
    }
  });

  // Add review for a user
  app.post("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviewData = { ...req.body, userId };
      
      const validatedReview = insertReviewSchema.parse(reviewData);
      const review = await storage.addReview(validatedReview);
      
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إضافة التقييم" });
    }
  });

  // Service endpoints
  
  // Get all services with optional filters
  app.get("/api/services", async (req, res) => {
    try {
      const { category, businessId, isActive } = req.query;
      const filters: ServiceProductFilters = {};
      if (category) filters.category = category as string;
      if (businessId) filters.businessId = businessId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const services = await storage.getAllServices(filters);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الخدمات" });
    }
  });
  
  // Search services
  app.get("/api/services/search", async (req, res) => {
    try {
      const { query, category, businessId, isActive } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "مطلوب نص البحث" });
      }

      const filters: ServiceProductFilters = {};
      if (category) filters.category = category as string;
      if (businessId) filters.businessId = businessId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const services = await storage.searchServices(query as string, filters);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن الخدمات" });
    }
  });
  
  // Get service by ID
  app.get("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(id);
      
      if (!service) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات الخدمة" });
    }
  });
  
  // Get services by business ID
  app.get("/api/businesses/:businessId/services", async (req, res) => {
    try {
      const { businessId } = req.params;
      const services = await storage.getServicesByBusiness(businessId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب خدمات المتجر" });
    }
  });

  // Create new service
  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "خطأ في إنشاء الخدمة" });
    }
  });

  // Update service
  app.put("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const service = await storage.updateService(id, updateData);
      if (!service) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث الخدمة" });
    }
  });

  // Delete service
  app.delete("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "الخدمة غير موجودة" });
      }
      
      res.json({ message: "تم حذف الخدمة بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف الخدمة" });
    }
  });

  // Product endpoints
  
  // Get all products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const { category, businessId, isActive } = req.query;
      const filters: ServiceProductFilters = {};
      if (category) filters.category = category as string;
      if (businessId) filters.businessId = businessId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const products = await storage.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المنتجات" });
    }
  });
  
  // Search products
  app.get("/api/products/search", async (req, res) => {
    try {
      const { query, category, businessId, isActive } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "مطلوب نص البحث" });
      }

      const filters: ServiceProductFilters = {};
      if (category) filters.category = category as string;
      if (businessId) filters.businessId = businessId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const products = await storage.searchProducts(query as string, filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن المنتجات" });
    }
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب بيانات المنتج" });
    }
  });
  
  // Get products by business ID
  app.get("/api/businesses/:businessId/products", async (req, res) => {
    try {
      const { businessId } = req.params;
      const products = await storage.getProductsByBusiness(businessId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب منتجات المتجر" });
    }
  });

  // Create new product
  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "خطأ في إنشاء المنتج" });
    }
  });

  // Update product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json({ message: "تم حذف المنتج بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المنتج" });
    }
  });

  // =======================
  // Phone Contacts API 
  // =======================

  // Enhanced phone number search with multiple names
  app.get("/api/phone/search/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const { userCity, userCountry, userRegion, isVerified } = req.query;
      
      const filters: PhoneContactFilters = {};
      if (userCity) filters.userCity = userCity as string;
      if (userCountry) filters.userCountry = userCountry as string;
      if (userRegion) filters.userRegion = userRegion as string;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';

      const result = await storage.getPhoneContactsByNumber(phoneNumber, filters);
      
      // Add to search history
      await storage.addSearchHistory({
        query: phoneNumber,
        searchType: "phone",
        results: JSON.stringify(result),
      });
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن الرقم" });
    }
  });

  // Search contacts by name
  app.get("/api/contacts/search", async (req, res) => {
    try {
      const { name, userCity, userCountry, userRegion, isVerified } = req.query;
      
      if (!name) {
        return res.status(400).json({ message: "مطلوب اسم للبحث" });
      }

      const filters: PhoneContactFilters = {};
      if (userCity) filters.userCity = userCity as string;
      if (userCountry) filters.userCountry = userCountry as string;
      if (userRegion) filters.userRegion = userRegion as string;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';

      const results = await storage.searchPhoneByName(name as string, filters);
      
      // Add to search history
      await storage.addSearchHistory({
        query: name as string,
        searchType: "name",
        results: JSON.stringify(results),
      });
      
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "خطأ في البحث عن الاسم" });
    }
  });

  // Add single phone contact
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertPhoneContactSchema.parse(req.body);
      const contact = await storage.addPhoneContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "خطأ في إضافة جهة الاتصال" });
    }
  });

  // Bulk add phone contacts (for contact sync)
  app.post("/api/contacts/bulk", async (req, res) => {
    try {
      const { contacts } = req.body;
      
      if (!Array.isArray(contacts)) {
        return res.status(400).json({ message: "مطلوب قائمة جهات الاتصال" });
      }

      // Validate each contact
      const validatedContacts = contacts.map(contact => 
        insertPhoneContactSchema.parse(contact)
      );

      const addedContacts = await storage.bulkAddPhoneContacts(validatedContacts);
      res.status(201).json({ 
        message: `تم إضافة ${addedContacts.length} جهة اتصال بنجاح`,
        contacts: addedContacts
      });
    } catch (error) {
      res.status(400).json({ message: "خطأ في إضافة جهات الاتصال" });
    }
  });

  // Get user's contacts
  app.get("/api/users/:userId/contacts", async (req, res) => {
    try {
      const { userId } = req.params;
      const contacts = await storage.getContactsByUser(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب جهات الاتصال" });
    }
  });

  // Update phone contact
  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const contact = await storage.updatePhoneContact(id, updateData);
      if (!contact) {
        return res.status(404).json({ message: "جهة الاتصال غير موجودة" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث جهة الاتصال" });
    }
  });

  // Delete phone contact
  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePhoneContact(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "جهة الاتصال غير موجودة" });
      }
      
      res.json({ message: "تم حذف جهة الاتصال بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف جهة الاتصال" });
    }
  });

  // Report contact (spam, incorrect info, etc.)
  app.post("/api/contacts/:id/report", async (req, res) => {
    try {
      const { id: phoneContactId } = req.params;
      const reportData = insertContactReportSchema.parse({
        ...req.body,
        phoneContactId
      });
      
      const report = await storage.reportContact(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "خطأ في الإبلاغ عن جهة الاتصال" });
    }
  });

  // Get contact reports
  app.get("/api/contacts/:id/reports", async (req, res) => {
    try {
      const { id } = req.params;
      const reports = await storage.getContactReports(id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب تقارير جهة الاتصال" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
