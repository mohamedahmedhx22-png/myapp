import { type User, type InsertUser, type UpsertUser, type SearchHistory, type InsertSearchHistory, type Review, type InsertReview, type Service, type InsertService, type Product, type InsertProduct, type PhoneContact, type InsertPhoneContact, type ContactReport, type InsertContactReport, type PhoneNumberName, type InsertPhoneNumberName, type PhoneVerificationRequest, type InsertPhoneVerificationRequest, type BusinessCategory, type InsertBusinessCategory } from "@shared/schema";
import { db } from "./db";
import { users, searchHistory, reviews, services, products, phoneContacts, contactReports, phoneNumberNames, phoneVerificationRequests, businessCategories } from "@shared/schema";
import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface SearchFilters {
  city?: string;
  accountType?: string;
  isVerified?: boolean;
  isActive?: boolean;
  category?: string;
}

export interface ServiceProductFilters {
  category?: string;
  businessId?: string;
  isActive?: boolean;
  priceRange?: string;
}

export interface PhoneContactFilters {
  phoneNumber?: string;
  userCity?: string;
  userCountry?: string;
  userRegion?: string;
  addedByUserId?: string;
  isVerified?: boolean;
}

export interface PhoneSearchResult {
  phoneNumber: string;
  contacts: Array<{
    id: string;
    contactName: string;
    addedByUser: {
      id: string;
      name: string;
      city?: string;
      country?: string;
      region?: string;
    };
    isVerified: boolean;
    reportCount: number;
    createdAt: Date;
  }>;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  searchUsersByName(name: string, filters?: SearchFilters): Promise<User[]>;
  searchUsersByPhone(phone: string, filters?: SearchFilters): Promise<User[]>;
  getAllUsers(filters?: SearchFilters): Promise<User[]>;
  getFavoriteUsers(): Promise<User[]>;
  addToFavorites(userId: string): Promise<void>;
  removeFromFavorites(userId: string): Promise<void>;

  // Search history operations
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getRecentSearches(limit?: number): Promise<SearchHistory[]>;

  // Review operations
  addReview(review: InsertReview): Promise<Review>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  getUserAverageRating(userId: string): Promise<{ average: number; count: number }>;

  // Service operations
  createService(service: InsertService): Promise<Service>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByBusiness(businessId: string): Promise<Service[]>;
  getAllServices(filters?: ServiceProductFilters): Promise<Service[]>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  searchServices(query: string, filters?: ServiceProductFilters): Promise<Service[]>;

  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByBusiness(businessId: string): Promise<Product[]>;
  getAllProducts(filters?: ServiceProductFilters): Promise<Product[]>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string, filters?: ServiceProductFilters): Promise<Product[]>;

  // Phone Contact operations
  addPhoneContact(contact: InsertPhoneContact): Promise<PhoneContact>;
  getPhoneContactsByNumber(phoneNumber: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult>;
  searchPhoneByName(name: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult[]>;
  bulkAddPhoneContacts(contacts: InsertPhoneContact[]): Promise<PhoneContact[]>;
  updatePhoneContact(id: string, contact: Partial<InsertPhoneContact>): Promise<PhoneContact | undefined>;
  deletePhoneContact(id: string): Promise<boolean>;
  getContactsByUser(userId: string): Promise<PhoneContact[]>;

  // Contact Report operations
  reportContact(report: InsertContactReport): Promise<ContactReport>;
  getContactReports(phoneContactId: string): Promise<ContactReport[]>;
}

export class DbStorage implements IStorage {
  private favorites: Set<string> = new Set();

  constructor() {
    // Initialize with sample data if needed
    this.seedData().catch(console.error);
  }

  private async seedData() {
    try {
      // Skip seeding for phone authentication - users will register themselves
      return;
      
      // Check if data already exists
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return; // Data already exists
      }

      // Add sample data for demonstration
      const sampleUsers: InsertUser[] = [
        {
          name: "أحمد محمد علي",
          phone: "+966501234567",
          city: "الرياض",
          accountType: "personal",
          isVerified: true,
          isActive: true,
        },
        {
          name: "فاطمة أحمد",
          phone: "+966559876543",
          city: "جدة",
          accountType: "personal",
          isVerified: false,
          isActive: false,
        },
        {
          name: "شركة التقنية المتقدمة",
          phone: "+966112345678",
          city: "الرياض",
          accountType: "business",
          category: "تقنية المعلومات",
          isVerified: true,
          isActive: true,
        },
        {
          name: "محمد عبدالله",
          phone: "+966503456789",
          city: "الدمام",
          accountType: "personal",
          isVerified: true,
          isActive: true,
        },
        {
          name: "شركة الطب الحديث",
          phone: "+966114567890",
          city: "جدة",
          accountType: "business",
          category: "طب وصحة",
          isVerified: true,
          isActive: true,
        },
        {
          name: "سارة أحمد",
          phone: "+966555123456",
          city: "مكة المكرمة",
          accountType: "personal",
          isVerified: false,
          isActive: true,
        }
      ];

      const createdUsers = await db.insert(users).values(sampleUsers).returning();

      // Add sample reviews
      const sampleReviews: InsertReview[] = [
        {
          userId: createdUsers[0].id,
          reviewerName: "عبدالله محمد",
          rating: 5,
          comment: "خدمة ممتازة وسريعة الرد"
        },
        {
          userId: createdUsers[0].id,
          reviewerName: "نورا أحمد",
          rating: 4,
          comment: "تعامل جيد ومريح"
        },
        {
          userId: createdUsers[2].id,
          reviewerName: "خالد العلي",
          rating: 5,
          comment: "أفضل شركة تقنية تعاملت معها"
        }
      ];

      await db.insert(reviews).values(sampleReviews);

      // Add sample services
      const businessUsers = createdUsers.filter(u => u.accountType === 'business');
      if (businessUsers.length > 0) {
        const sampleServices: InsertService[] = [
          {
            businessId: businessUsers[0].id,
            title: "تطوير تطبيقات الويب",
            description: "تطوير تطبيقات ويب متجاوبة باستخدام أحدث التقنيات",
            price: "5000 - 15000 ريال",
            category: "برمجة وتطوير",
            isActive: true,
          },
          {
            businessId: businessUsers[0].id,
            title: "تصميم واجهات المستخدم",
            description: "تصميم واجهات مستخدم عصرية وسهلة الاستخدام",
            price: "2000 - 8000 ريال",
            category: "تصميم",
            isActive: true,
          }
        ];

        if (businessUsers.length > 1) {
          sampleServices.push({
            businessId: businessUsers[1].id,
            title: "استشارات طبية",
            description: "استشارات طبية متخصصة عن بُعد",
            price: "200 - 500 ريال",
            category: "طب وصحة",
            isActive: true,
          });
        }

        await db.insert(services).values(sampleServices);

        // Add sample products
        const sampleProducts: InsertProduct[] = [
          {
            businessId: businessUsers[0].id,
            name: "برنامج إدارة المخزون",
            description: "نظام شامل لإدارة المخزون والمبيعات",
            price: "12000 ريال",
            category: "برمجيات",
            stockQuantity: 5,
            isActive: true,
          }
        ];

        if (businessUsers.length > 1) {
          sampleProducts.push({
            businessId: businessUsers[1].id,
            name: "أجهزة طبية متخصصة",
            description: "أجهزة طبية عالية الجودة للعيادات",
            price: "حسب الطلب",
            category: "أجهزة طبية",
            stockQuantity: 3,
            isActive: true,
          });
        }

        await db.insert(products).values(sampleProducts);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      id: randomUUID(),
      city: insertUser.city ?? null,
      accountType: insertUser.accountType ?? "personal",
      isVerified: insertUser.isVerified ?? false,
      isActive: insertUser.isActive ?? true,
      category: insertUser.category ?? null,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  private buildUserFilters(filters?: SearchFilters) {
    if (!filters) return undefined;

    const conditions = [];
    if (filters.city) conditions.push(eq(users.city, filters.city));
    if (filters.accountType) conditions.push(eq(users.accountType, filters.accountType));
    if (filters.isVerified !== undefined) conditions.push(eq(users.isVerified, filters.isVerified));
    if (filters.isActive !== undefined) conditions.push(eq(users.isActive, filters.isActive));

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async searchUsersByName(name: string, filters?: SearchFilters): Promise<User[]> {
    if (!name.trim()) return [];

    const filterConditions = this.buildUserFilters(filters);
    const nameCondition = like(users.name, `%${name}%`);

    const whereCondition = filterConditions 
      ? and(nameCondition, filterConditions)
      : nameCondition;

    return await db.select().from(users).where(whereCondition);
  }

  async searchUsersByPhone(phone: string, filters?: SearchFilters): Promise<User[]> {
    // إزالة مفتاح الدولة إذا كان موجوداً للبحث بالرقم المحلي
    const phoneWithoutCountryCode = phone.replace(/^\+\d{1,4}/, '');
    
    // البحث بالرقم الكامل كما هو وبالرقم بدون مفتاح الدولة
    const phoneConditions = [
      like(users.phone, `%${phone}%`), // البحث بالرقم كما تم إدخاله
      like(users.phone, `%${phoneWithoutCountryCode}%`) // البحث بالرقم بدون مفتاح الدولة
    ];

    // إذا لم يحتو الرقم على مفتاح دولة، نبحث أيضاً بإضافة مفاتيح دول مختلفة
    if (!phone.startsWith('+')) {
      const commonCountryCodes = ['+966', '+2', '+971', '+965', '+974', '+973', '+968', '+962', '+961', '+963', '+964', '+967'];
      commonCountryCodes.forEach(countryCode => {
        phoneConditions.push(like(users.phone, `%${countryCode}${phone}%`));
      });
    }

    const whereConditions = [or(...phoneConditions)];

    if (filters?.city) whereConditions.push(eq(users.city, filters.city));
    if (filters?.accountType) whereConditions.push(eq(users.accountType, filters.accountType));
    if (filters?.isVerified !== undefined) whereConditions.push(eq(users.isVerified, filters.isVerified));
    if (filters?.isActive !== undefined) whereConditions.push(eq(users.isActive, filters.isActive));

    return await db.select().from(users).where(and(...whereConditions));
  }

  async getAllUsers(filters?: SearchFilters): Promise<User[]> {
    const whereCondition = this.buildUserFilters(filters);
    return await db.select().from(users).where(whereCondition);
  }

  async getFavoriteUsers(): Promise<User[]> {
    if (this.favorites.size === 0) return [];
    const favoriteIds = Array.from(this.favorites);
    return await db.select().from(users).where(sql`${users.id} = ANY(${favoriteIds})`);
  }

  async addToFavorites(userId: string): Promise<void> {
    this.favorites.add(userId);
  }

  async removeFromFavorites(userId: string): Promise<void> {
    this.favorites.delete(userId);
  }

  async addSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const result = await db.insert(searchHistory).values({
      ...insertHistory,
      id: randomUUID(),
      results: insertHistory.results ?? null,
      timestamp: new Date(),
    }).returning();
    return result[0];
  }

  async getRecentSearches(limit = 10): Promise<SearchHistory[]> {
    return await db.select().from(searchHistory)
      .orderBy(desc(searchHistory.timestamp))
      .limit(limit);
  }

  async addReview(insertReview: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values({
      ...insertReview,
      id: randomUUID(),
      comment: insertReview.comment ?? null,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const result = await db.select({
      average: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    }).from(reviews).where(eq(reviews.userId, userId));

    const data = result[0];
    return {
      average: data.average ? Math.round(data.average * 10) / 10 : 0,
      count: data.count || 0
    };
  }

  // Service operations
  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values({
      ...insertService,
      id: randomUUID(),
      description: insertService.description ?? null,
      price: insertService.price ?? null,
      isActive: insertService.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async getService(id: string): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    return await db.select().from(services)
      .where(eq(services.businessId, businessId))
      .orderBy(desc(services.updatedAt));
  }

  private buildServiceProductFilters<T extends typeof services | typeof products>(table: T, filters?: ServiceProductFilters) {
    if (!filters) return undefined;

    const conditions = [];
    if (filters.category) conditions.push(eq(table.category, filters.category));
    if (filters.businessId) conditions.push(eq(table.businessId, filters.businessId));
    if (filters.isActive !== undefined) conditions.push(eq(table.isActive, filters.isActive));

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async getAllServices(filters?: ServiceProductFilters): Promise<Service[]> {
    const whereCondition = this.buildServiceProductFilters(services, filters);
    return await db.select().from(services)
      .where(whereCondition)
      .orderBy(desc(services.updatedAt));
  }

  async updateService(id: string, updateData: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db.update(services)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return result[0];
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  async searchServices(query: string, filters?: ServiceProductFilters): Promise<Service[]> {
    if (!query.trim()) return [];

    const filterConditions = this.buildServiceProductFilters(services, filters);
    const searchConditions = [
      like(services.title, `%${query}%`),
      like(services.description, `%${query}%`),
      like(services.category, `%${query}%`)
    ];

    const searchCondition = sql`(${searchConditions.join(' OR ')})`;
    const whereCondition = filterConditions 
      ? and(searchCondition, filterConditions)
      : searchCondition;

    return await db.select().from(services).where(whereCondition);
  }

  // Product operations
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values({
      ...insertProduct,
      id: randomUUID(),
      description: insertProduct.description ?? null,
      price: insertProduct.price ?? null,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductsByBusiness(businessId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.businessId, businessId))
      .orderBy(desc(products.updatedAt));
  }

  async getAllProducts(filters?: ServiceProductFilters): Promise<Product[]> {
    const whereCondition = this.buildServiceProductFilters(products, filters);
    return await db.select().from(products)
      .where(whereCondition)
      .orderBy(desc(products.updatedAt));
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async searchProducts(query: string, filters?: ServiceProductFilters): Promise<Product[]> {
    if (!query.trim()) return [];

    const filterConditions = this.buildServiceProductFilters(products, filters);
    const searchConditions = [
      like(products.name, `%${query}%`),
      like(products.description, `%${query}%`),
      like(products.category, `%${query}%`)
    ];

    const searchCondition = sql`(${searchConditions.join(' OR ')})`;
    const whereCondition = filterConditions 
      ? and(searchCondition, filterConditions)
      : searchCondition;

    return await db.select().from(products).where(whereCondition);
  }

  // Phone Contact operations
  async addPhoneContact(contact: InsertPhoneContact): Promise<PhoneContact> {
    const result = await db.insert(phoneContacts).values({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async getPhoneContactsByNumber(phoneNumber: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult> {
    // إزالة مفتاح الدولة للبحث بالرقم المحلي أيضاً
    const phoneWithoutCountryCode = phoneNumber.replace(/^\+\d{1,4}/, '');
    
    // البحث بالرقم الكامل وبالرقم بدون مفتاح الدولة
    const phoneConditions = [
      eq(phoneContacts.phoneNumber, phoneNumber),
      like(phoneContacts.phoneNumber, `%${phoneWithoutCountryCode}%`)
    ];

    // إذا لم يحتو الرقم على مفتاح دولة، نبحث أيضاً بإضافة مفاتيح دول مختلفة
    if (!phoneNumber.startsWith('+')) {
      const commonCountryCodes = ['+966', '+2', '+971', '+965', '+974', '+973', '+968', '+962', '+961', '+963', '+964', '+967'];
      commonCountryCodes.forEach(countryCode => {
        phoneConditions.push(eq(phoneContacts.phoneNumber, `${countryCode}${phoneNumber}`));
      });
    }

    const whereConditions = [or(...phoneConditions)];

    if (filters?.userCity) whereConditions.push(eq(phoneContacts.userCity, filters.userCity));
    if (filters?.userCountry) whereConditions.push(eq(phoneContacts.userCountry, filters.userCountry));
    if (filters?.userRegion) whereConditions.push(eq(phoneContacts.userRegion, filters.userRegion));
    if (filters?.addedByUserId) whereConditions.push(eq(phoneContacts.addedByUserId, filters.addedByUserId));
    if (filters?.isVerified !== undefined) whereConditions.push(eq(phoneContacts.isVerified, filters.isVerified));

    const contacts = await db.select().from(phoneContacts)
      .where(and(...whereConditions))
      .orderBy(desc(phoneContacts.createdAt));

    // Get user info for each contact
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await this.getUser(contact.addedByUserId);
        return {
          id: contact.id,
          contactName: contact.contactName,
          addedByUser: {
            id: contact.addedByUserId,
            name: user?.name || "غير معروف",
            city: user?.city || undefined,
            country: user?.country || undefined,
            region: user?.region || undefined,
          },
          isVerified: contact.isVerified,
          reportCount: contact.reportCount,
          createdAt: contact.createdAt,
        };
      })
    );

    return {
      phoneNumber,
      contacts: contactsWithUsers,
    };
  }

  async searchPhoneByName(name: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult[]> {
    if (!name.trim()) return [];

    const whereConditions = [like(phoneContacts.contactName, `%${name}%`)];

    if (filters?.userCity) whereConditions.push(eq(phoneContacts.userCity, filters.userCity));
    if (filters?.userCountry) whereConditions.push(eq(phoneContacts.userCountry, filters.userCountry));
    if (filters?.userRegion) whereConditions.push(eq(phoneContacts.userRegion, filters.userRegion));
    if (filters?.addedByUserId) whereConditions.push(eq(phoneContacts.addedByUserId, filters.addedByUserId));
    if (filters?.isVerified !== undefined) whereConditions.push(eq(phoneContacts.isVerified, filters.isVerified));

    const contacts = await db.select().from(phoneContacts)
      .where(and(...whereConditions))
      .orderBy(desc(phoneContacts.createdAt));

    // Group by phone number
    const groupedByPhone = contacts.reduce((acc, contact) => {
      if (!acc[contact.phoneNumber]) {
        acc[contact.phoneNumber] = [];
      }
      acc[contact.phoneNumber].push(contact);
      return acc;
    }, {} as Record<string, typeof contacts>);

    // Convert to result format
    const results = await Promise.all(
      Object.entries(groupedByPhone).map(async ([phoneNumber, phoneContacts]) => {
        const contactsWithUsers = await Promise.all(
          phoneContacts.map(async (contact) => {
            const user = await this.getUser(contact.addedByUserId);
            return {
              id: contact.id,
              contactName: contact.contactName,
              addedByUser: {
                id: contact.addedByUserId,
                name: user?.name || "غير معروف",
                city: user?.city || undefined,
                country: user?.country || undefined,
                region: user?.region || undefined,
              },
              isVerified: contact.isVerified,
              reportCount: contact.reportCount,
              createdAt: contact.createdAt,
            };
          })
        );

        return {
          phoneNumber,
          contacts: contactsWithUsers,
        };
      })
    );

    return results;
  }

  async bulkAddPhoneContacts(contacts: InsertPhoneContact[]): Promise<PhoneContact[]> {
    const contactsWithIds = contacts.map(contact => ({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.insert(phoneContacts).values(contactsWithIds).returning();
    return result;
  }

  async updatePhoneContact(id: string, updateData: Partial<InsertPhoneContact>): Promise<PhoneContact | undefined> {
    const result = await db.update(phoneContacts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(phoneContacts.id, id))
      .returning();
    return result[0];
  }

  async deletePhoneContact(id: string): Promise<boolean> {
    const result = await db.delete(phoneContacts).where(eq(phoneContacts.id, id)).returning();
    return result.length > 0;
  }

  async getContactsByUser(userId: string): Promise<PhoneContact[]> {
    return await db.select().from(phoneContacts)
      .where(eq(phoneContacts.addedByUserId, userId))
      .orderBy(desc(phoneContacts.createdAt));
  }

  // Contact Report operations
  async reportContact(report: InsertContactReport): Promise<ContactReport> {
    const result = await db.insert(contactReports).values({
      ...report,
      id: randomUUID(),
      createdAt: new Date(),
    }).returning();

    // Increment report count on the phone contact
    await db.update(phoneContacts)
      .set({ 
        reportCount: sql`${phoneContacts.reportCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(phoneContacts.id, report.phoneContactId));

    return result[0];
  }

  async getContactReports(phoneContactId: string): Promise<ContactReport[]> {
    return await db.select().from(contactReports)
      .where(eq(contactReports.phoneContactId, phoneContactId))
      .orderBy(desc(contactReports.createdAt));
  }

  // Enhanced Phone Number Discovery System
  async addPhoneNumberName(nameData: InsertPhoneNumberName): Promise<PhoneNumberName> {
    const result = await db.insert(phoneNumberNames).values({
      ...nameData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return result[0];
  }

  async getPhoneNumberNames(phoneNumber: string): Promise<PhoneNumberName[]> {
    return await db.select().from(phoneNumberNames)
      .where(eq(phoneNumberNames.phoneNumber, phoneNumber))
      .where(eq(phoneNumberNames.isActive, true))
      .orderBy(desc(phoneNumberNames.isVerified), desc(phoneNumberNames.createdAt));
  }

  async searchPhoneNumbersByName(name: string): Promise<PhoneNumberName[]> {
    return await db.select().from(phoneNumberNames)
      .where(like(phoneNumberNames.name, `%${name}%`))
      .where(eq(phoneNumberNames.isActive, true))
      .orderBy(desc(phoneNumberNames.isVerified), desc(phoneNumberNames.createdAt));
  }

  async verifyPhoneNumberName(id: string, verificationMethod: string): Promise<PhoneNumberName | undefined> {
    const result = await db.update(phoneNumberNames)
      .set({ 
        isVerified: true,
        verificationMethod,
        verificationDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(phoneNumberNames.id, id))
      .returning();
    return result[0];
  }

  async createVerificationRequest(request: InsertPhoneVerificationRequest): Promise<PhoneVerificationRequest> {
    const result = await db.insert(phoneVerificationRequests).values({
      ...request,
      id: randomUUID(),
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async verifyPhoneNumber(phoneNumber: string, code: string): Promise<boolean> {
    const request = await db.select().from(phoneVerificationRequests)
      .where(and(
        eq(phoneVerificationRequests.phoneNumber, phoneNumber),
        eq(phoneVerificationRequests.verificationCode, code),
        eq(phoneVerificationRequests.isUsed, false),
        sql`${phoneVerificationRequests.expiresAt} > NOW()`
      ))
      .limit(1);

    if (request.length === 0) return false;

    // Mark as used
    await db.update(phoneVerificationRequests)
      .set({ isUsed: true })
      .where(eq(phoneVerificationRequests.id, request[0].id));

    return true;
  }

  // Business Categories
  async getAllBusinessCategories(): Promise<BusinessCategory[]> {
    return await db.select().from(businessCategories)
      .where(eq(businessCategories.isActive, true))
      .orderBy(businessCategories.name);
  }

  async getBusinessCategory(id: string): Promise<BusinessCategory | undefined> {
    const result = await db.select().from(businessCategories)
      .where(eq(businessCategories.id, id))
      .limit(1);
    return result[0];
  }

  // Enhanced search with business categories
  async searchServicesWithCategory(query: string, categoryId?: string, filters?: ServiceProductFilters): Promise<Service[]> {
    let whereConditions = [like(services.title, `%${query}%`)];
    
    if (categoryId) {
      whereConditions.push(eq(services.category, categoryId));
    }
    
    if (filters?.isActive !== undefined) {
      whereConditions.push(eq(services.isActive, filters.isActive));
    }

    return await db.select().from(services)
      .where(and(...whereConditions))
      .orderBy(desc(services.isFeatured), desc(services.createdAt));
  }

  async searchProductsWithCategory(query: string, categoryId?: string, filters?: ServiceProductFilters): Promise<Product[]> {
    let whereConditions = [like(products.name, `%${query}%`)];
    
    if (categoryId) {
      whereConditions.push(eq(products.category, categoryId));
    }
    
    if (filters?.isActive !== undefined) {
      whereConditions.push(eq(products.isActive, filters.isActive));
    }

    return await db.select().from(products)
      .where(and(...whereConditions))
      .orderBy(desc(products.isFeatured), desc(products.createdAt));
  }

  // Get services and products by business with enhanced info
  async getBusinessServicesAndProducts(businessId: string): Promise<{
    services: Service[];
    products: Product[];
    totalServices: number;
    totalProducts: number;
  }> {
    const [services, products] = await Promise.all([
      db.select().from(services).where(eq(services.businessId, businessId)),
      db.select().from(products).where(eq(products.businessId, businessId))
    ]);

    return {
      services,
      products,
      totalServices: services.length,
      totalProducts: products.length,
    };
  }
}

// In-memory storage for development when database is not available
export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private searchHistory: SearchHistory[] = [];
  private reviews: Review[] = [];
  private services: Service[] = [];
  private products: Product[] = [];
  private phoneContacts: PhoneContact[] = [];
  private contactReports: ContactReport[] = [];
  private phoneNumberNames: PhoneNumberName[] = [];
  private phoneVerificationRequests: PhoneVerificationRequest[] = [];
  private businessCategories: BusinessCategory[] = [];

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample business categories
    this.businessCategories = [
      {
        id: '1',
        name: 'restaurant',
        arabicName: 'مطعم',
        description: 'مطاعم ومقاهي',
        icon: '🍽️',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'retail',
        arabicName: 'بيع بالتجزئة',
        description: 'متاجر ومحلات',
        icon: '🛍️',
        isActive: true,
        createdAt: new Date()
      },
      {
        id: '3',
        name: 'healthcare',
        arabicName: 'رعاية صحية',
        description: 'مستشفيات وعيادات',
        icon: '🏥',
        isActive: true,
        createdAt: new Date()
      }
    ];

    // Sample users
    this.users = [
      {
        id: '1',
        phone: '+966501234567',
        password: 'hashed_password',
        name: 'أحمد محمد',
        accountType: 'business',
        category: 'restaurant',
        city: 'الرياض',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        phone: '+966502345678',
        password: 'hashed_password',
        name: 'فاطمة علي',
        accountType: 'personal',
        city: 'جدة',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample phone names
    this.phoneNumberNames = [
      {
        id: '1',
        phoneNumber: '+966501234567',
        name: 'مطعم الشرق',
        addedByUserId: '1',
        isVerified: true,
        verificationMethod: 'manual',
        verificationDate: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample services
    this.services = [
      {
        id: '1',
        businessId: '1',
        title: 'وجبة غداء',
        description: 'وجبة غداء شهية مع مشروب',
        price: '25 ريال',
        category: 'restaurant',
        duration: '30 دقيقة',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample products
    this.products = [
      {
        id: '1',
        businessId: '1',
        name: 'قهوة عربية',
        description: 'قهوة عربية تقليدية',
        price: '15 ريال',
        category: 'restaurant',
        stockQuantity: 100,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Implement all required methods with in-memory logic
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    const newUser: User = {
      ...user,
      id: user.id || randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...newUser, updatedAt: new Date() };
      return this.users[existingIndex];
    } else {
      this.users.push(newUser);
      return newUser;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return this.users.find(u => u.phone === phone);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    this.users.push(newUser);
    return newUser;
  }

  async searchUsersByName(name: string, filters?: SearchFilters): Promise<User[]> {
    let results = this.users.filter(u => 
      u.name.toLowerCase().includes(name.toLowerCase()) && u.isActive
    );
    
    if (filters?.city) {
      results = results.filter(u => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter(u => u.accountType === filters.accountType);
    }
    
    return results;
  }

  async searchUsersByPhone(phone: string, filters?: SearchFilters): Promise<User[]> {
    let results = this.users.filter(u => 
      u.phone.includes(phone) && u.isActive
    );
    
    if (filters?.city) {
      results = results.filter(u => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter(u => u.accountType === filters.accountType);
    }
    
    return results;
  }

  async getAllUsers(filters?: SearchFilters): Promise<User[]> {
    let results = this.users.filter(u => u.isActive);
    
    if (filters?.city) {
      results = results.filter(u => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter(u => u.accountType === filters.accountType);
    }
    
    return results;
  }

  async getFavoriteUsers(): Promise<User[]> {
    return []; // Simplified for demo
  }

  async addToFavorites(userId: string): Promise<void> {
    // Simplified for demo
  }

  async removeFromFavorites(userId: string): Promise<void> {
    // Simplified for demo
  }

  async addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory> {
    const newHistory: SearchHistory = {
      ...history,
      id: randomUUID(),
      timestamp: new Date()
    };
    this.searchHistory.push(newHistory);
    return newHistory;
  }

  async getRecentSearches(limit?: number): Promise<SearchHistory[]> {
    const sorted = this.searchHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // Phone number discovery methods
  async addPhoneNumberName(nameData: InsertPhoneNumberName): Promise<PhoneNumberName> {
    const newName: PhoneNumberName = {
      ...nameData,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.phoneNumberNames.push(newName);
    return newName;
  }

  async getPhoneNumberNames(phoneNumber: string): Promise<PhoneNumberName[]> {
    return this.phoneNumberNames.filter(n => 
      n.phoneNumber === phoneNumber && n.isActive
    ).sort((a, b) => {
      if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async searchPhoneNumbersByName(name: string): Promise<PhoneNumberName[]> {
    return this.phoneNumberNames.filter(n => 
      n.name.toLowerCase().includes(name.toLowerCase()) && n.isActive
    ).sort((a, b) => {
      if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async verifyPhoneNumberName(id: string, verificationMethod: string): Promise<PhoneNumberName | undefined> {
    const name = this.phoneNumberNames.find(n => n.id === id);
    if (name) {
      name.isVerified = true;
      name.verificationMethod = verificationMethod;
      name.verificationDate = new Date();
      name.updatedAt = new Date();
      return name;
    }
    return undefined;
  }

  async createVerificationRequest(request: InsertPhoneVerificationRequest): Promise<PhoneVerificationRequest> {
    const newRequest: PhoneVerificationRequest = {
      ...request,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.phoneVerificationRequests.push(newRequest);
    return newRequest;
  }

  async verifyPhoneNumber(phoneNumber: string, code: string): Promise<boolean> {
    const request = this.phoneVerificationRequests.find(r => 
      r.phoneNumber === phoneNumber && 
      r.verificationCode === code && 
      !r.isUsed && 
      new Date(r.expiresAt) > new Date()
    );
    
    if (request) {
      request.isUsed = true;
      return true;
    }
    return false;
  }

  // Business categories
  async getAllBusinessCategories(): Promise<BusinessCategory[]> {
    return this.businessCategories.filter(c => c.isActive);
  }

  async getBusinessCategory(id: string): Promise<BusinessCategory | undefined> {
    return this.businessCategories.find(c => c.id === id);
  }

  // Search methods
  async searchServicesWithCategory(query: string, categoryId?: string, filters?: ServiceProductFilters): Promise<Service[]> {
    let results = this.services.filter(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) && s.isActive
    );
    
    if (categoryId) {
      results = results.filter(s => s.category === categoryId);
    }
    
    if (filters?.isActive !== undefined) {
      results = results.filter(s => s.isActive === filters.isActive);
    }
    
    return results.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async searchProductsWithCategory(query: string, categoryId?: string, filters?: ServiceProductFilters): Promise<Product[]> {
    let results = this.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) && p.isActive
    );
    
    if (categoryId) {
      results = results.filter(p => p.category === categoryId);
    }
    
    if (filters?.isActive !== undefined) {
      results = results.filter(p => p.isActive === filters.isActive);
    }
    
    return results.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getBusinessServicesAndProducts(businessId: string): Promise<{
    services: Service[];
    products: Product[];
    totalServices: number;
    totalProducts: number;
  }> {
    const businessServices = this.services.filter(s => s.businessId === businessId);
    const businessProducts = this.products.filter(p => p.businessId === businessId);
    
    return {
      services: businessServices,
      products: businessProducts,
      totalServices: businessServices.length,
      totalProducts: businessProducts.length,
    };
  }

  // Implement other required methods with simplified logic
  async addReview(review: InsertReview): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.reviews.push(newReview);
    return newReview;
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.userId === userId);
  }

  async getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const userReviews = this.reviews.filter(r => r.userId === userId);
    if (userReviews.length === 0) return { average: 0, count: 0 };
    
    const total = userReviews.reduce((sum, r) => sum + r.rating, 0);
    return { average: total / userReviews.length, count: userReviews.length };
  }

  async createService(service: InsertService): Promise<Service> {
    const newService: Service = {
      ...service,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.services.push(newService);
    return newService;
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.find(s => s.id === id);
  }

  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    return this.services.filter(s => s.businessId === businessId);
  }

  async getAllServices(filters?: ServiceProductFilters): Promise<Service[]> {
    let results = this.services.filter(s => s.isActive);
    if (filters?.businessId) {
      results = results.filter(s => s.businessId === filters.businessId);
    }
    return results;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const index = this.services.findIndex(s => s.id === id);
    if (index >= 0) {
      this.services[index] = { ...this.services[index], ...service, updatedAt: new Date() };
      return this.services[index];
    }
    return undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index >= 0) {
      this.services.splice(index, 1);
      return true;
    }
    return false;
  }

  async searchServices(query: string, filters?: ServiceProductFilters): Promise<Service[]> {
    return this.searchServicesWithCategory(query, filters?.category, filters);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProductsByBusiness(businessId: string): Promise<Product[]> {
    return this.products.filter(p => p.businessId === businessId);
  }

  async getAllProducts(filters?: ServiceProductFilters): Promise<Product[]> {
    let results = this.products.filter(p => p.isActive);
    if (filters?.businessId) {
      results = results.filter(p => p.businessId === filters.businessId);
    }
    return results;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index >= 0) {
      this.products[index] = { ...this.products[index], ...product, updatedAt: new Date() };
      return this.products[index];
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index >= 0) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }

  async searchProducts(query: string, filters?: ServiceProductFilters): Promise<Product[]> {
    return this.searchProductsWithCategory(query, filters?.category, filters);
  }

  async addPhoneContact(contact: InsertPhoneContact): Promise<PhoneContact> {
    const newContact: PhoneContact = {
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.phoneContacts.push(newContact);
    return newContact;
  }

  async getPhoneContactsByNumber(phoneNumber: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult> {
    const contacts = this.phoneContacts.filter(c => c.phoneNumber === phoneNumber);
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await this.getUser(contact.addedByUserId);
        return {
          id: contact.id,
          contactName: contact.contactName,
          addedByUser: {
            id: contact.addedByUserId,
            name: user?.name || "غير معروف",
            city: user?.city,
            country: user?.country,
            region: user?.region,
          },
          isVerified: contact.isVerified,
          reportCount: contact.reportCount,
          createdAt: contact.createdAt,
        };
      })
    );

    return {
      phoneNumber,
      contacts: contactsWithUsers,
    };
  }

  async searchPhoneByName(name: string, filters?: PhoneContactFilters): Promise<PhoneSearchResult[]> {
    const contacts = this.phoneContacts.filter(c => 
      c.contactName.toLowerCase().includes(name.toLowerCase())
    );
    
    const groupedByPhone = contacts.reduce((acc, contact) => {
      if (!acc[contact.phoneNumber]) {
        acc[contact.phoneNumber] = [];
      }
      acc[contact.phoneNumber].push(contact);
      return acc;
    }, {} as Record<string, typeof contacts>);

    const results = await Promise.all(
      Object.entries(groupedByPhone).map(async ([phoneNumber, phoneContacts]) => {
        const contactsWithUsers = await Promise.all(
          phoneContacts.map(async (contact) => {
            const user = await this.getUser(contact.addedByUserId);
            return {
              id: contact.id,
              contactName: contact.contactName,
              addedByUser: {
                id: contact.addedByUserId,
                name: user?.name || "غير معروف",
                city: user?.city,
                country: user?.country,
                region: user?.region,
              },
              isVerified: contact.isVerified,
              reportCount: contact.reportCount,
              createdAt: contact.createdAt,
            };
          })
        );

        return {
          phoneNumber,
          contacts: contactsWithUsers,
        };
      })
    );

    return results;
  }

  async bulkAddPhoneContacts(contacts: InsertPhoneContact[]): Promise<PhoneContact[]> {
    const contactsWithIds = contacts.map(contact => ({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    this.phoneContacts.push(...contactsWithIds);
    return contactsWithIds;
  }

  async updatePhoneContact(id: string, updateData: Partial<InsertPhoneContact>): Promise<PhoneContact | undefined> {
    const index = this.phoneContacts.findIndex(c => c.id === id);
    if (index >= 0) {
      this.phoneContacts[index] = { ...this.phoneContacts[index], ...updateData, updatedAt: new Date() };
      return this.phoneContacts[index];
    }
    return undefined;
  }

  async deletePhoneContact(id: string): Promise<boolean> {
    const index = this.phoneContacts.findIndex(c => c.id === id);
    if (index >= 0) {
      this.phoneContacts.splice(index, 1);
      return true;
    }
    return false;
  }

  async getContactsByUser(userId: string): Promise<PhoneContact[]> {
    return this.phoneContacts
      .filter(c => c.addedByUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async reportContact(report: InsertContactReport): Promise<ContactReport> {
    const newReport: ContactReport = {
      ...report,
      id: randomUUID(),
      createdAt: new Date()
    };
    this.contactReports.push(newReport);

    // Increment report count
    const contact = this.phoneContacts.find(c => c.id === report.phoneContactId);
    if (contact) {
      contact.reportCount++;
      contact.updatedAt = new Date();
    }

    return newReport;
  }

  async getContactReports(phoneContactId: string): Promise<ContactReport[]> {
    return this.contactReports
      .filter(r => r.phoneContactId === phoneContactId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Use in-memory storage for development when database is not available
export const storage = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL 
  ? new InMemoryStorage() 
  : new DbStorage();