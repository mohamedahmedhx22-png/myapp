import { type User, type InsertUser, type UpsertUser, type SearchHistory, type InsertSearchHistory, type Review, type InsertReview, type Service, type InsertService, type Product, type InsertProduct, type PhoneContact, type InsertPhoneContact, type ContactReport, type InsertContactReport } from "@shared/schema";
import { db } from "./db";
import { users, searchHistory, reviews, services, products, phoneContacts, contactReports } from "@shared/schema";
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
}

export const storage = new DbStorage();