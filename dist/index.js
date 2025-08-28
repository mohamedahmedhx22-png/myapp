var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  businessCategories: () => businessCategories,
  businessImages: () => businessImages,
  contactReports: () => contactReports,
  favorites: () => favorites,
  insertBusinessCategorySchema: () => insertBusinessCategorySchema,
  insertBusinessImageSchema: () => insertBusinessImageSchema,
  insertContactReportSchema: () => insertContactReportSchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertPhoneContactSchema: () => insertPhoneContactSchema,
  insertPhoneNumberNameSchema: () => insertPhoneNumberNameSchema,
  insertPhoneVerificationRequestSchema: () => insertPhoneVerificationRequestSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSearchHistorySchema: () => insertSearchHistorySchema,
  insertServiceSchema: () => insertServiceSchema,
  insertUserSchema: () => insertUserSchema,
  phoneContacts: () => phoneContacts,
  phoneNumberNames: () => phoneNumberNames,
  phoneVerificationRequests: () => phoneVerificationRequests,
  products: () => products,
  reviews: () => reviews,
  searchHistory: () => searchHistory,
  services: () => services,
  sessions: () => sessions,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Phone authentication fields
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  // Hashed password for phone auth
  name: text("name").notNull(),
  // Optional fields
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  city: text("city"),
  country: text("country"),
  // User's country
  region: text("region"),
  // User's region/state
  address: text("address"),
  // Full address for businesses
  accountType: text("account_type").notNull().default("personal"),
  // personal | business
  isVerified: boolean("is_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category"),
  // for business accounts
  description: text("description"),
  // Business description
  website: text("website"),
  // Business website
  logoUrl: text("logo_url"),
  // Business logo
  coverImageUrl: text("cover_image_url"),
  // Business cover image
  workingHours: text("working_hours"),
  // JSON string for business hours
  tags: text("tags").array(),
  // Business tags for better search
  lastContactsSync: timestamp("last_contacts_sync"),
  // When user last synced contacts
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  searchType: text("search_type").notNull(),
  // "name" | "phone"
  results: text("results"),
  // JSON string of search results
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price"),
  // Stored as text to support ranges like "100-200" or "حسب الطلب"
  category: text("category").notNull(),
  duration: text("duration"),
  // Service duration (e.g., "30 minutes", "2 hours")
  imageUrls: text("image_urls").array(),
  // Service images
  tags: text("tags").array(),
  // Service tags for better search
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"),
  // Stored as text to support ranges and custom pricing
  originalPrice: text("original_price"),
  // For showing discounts
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  imageUrls: text("image_urls").array(),
  // Product images
  specifications: text("specifications"),
  // JSON string for product specs
  tags: text("tags").array(),
  // Product tags for better search
  weight: text("weight"),
  // Product weight
  dimensions: text("dimensions"),
  // Product dimensions
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var phoneContacts = pgTable("phone_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  // The actual phone number
  contactName: text("contact_name").notNull().default("Unknown"),
  // Name saved by user
  addedByUserId: text("added_by_user_id").notNull(),
  // Who added this name
  userCity: text("user_city"),
  // City of user who added this contact
  userCountry: text("user_country"),
  // Country of user who added this contact
  userRegion: text("user_region"),
  // Region of user who added this contact
  isVerified: boolean("is_verified").notNull().default(false),
  // If this contact is verified
  reportCount: integer("report_count").notNull().default(0),
  // Number of reports against this contact
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  itemType: text("item_type").notNull(),
  // "product" | "service" | "business"
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var contactReports = pgTable("contact_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneContactId: text("phone_contact_id").notNull(),
  // ID of the phone contact being reported
  reportedByUserId: text("reported_by_user_id").notNull(),
  // Who reported this
  reportType: text("report_type").notNull(),
  // "spam" | "incorrect" | "inappropriate"
  reportReason: text("report_reason"),
  // Additional details
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var businessImages = pgTable("business_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var phoneNumberNames = pgTable("phone_number_names", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  name: text("name").notNull(),
  addedByUserId: text("added_by_user_id").notNull(),
  // Who added this name
  isVerified: boolean("is_verified").notNull().default(false),
  verificationMethod: text("verification_method"),
  // "sms", "call", "manual"
  verificationDate: timestamp("verification_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").defaultNow()
});
var phoneVerificationRequests = pgTable("phone_verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  requestedByUserId: text("requested_by_user_id").notNull(),
  verificationCode: text("verification_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var businessCategories = pgTable("business_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name"),
  description: text("description"),
  icon: text("icon"),
  // Icon name or URL
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true
});
var insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  timestamp: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});
var insertBusinessImageSchema = createInsertSchema(businessImages).omit({
  id: true,
  createdAt: true
});
var insertPhoneContactSchema = createInsertSchema(phoneContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertContactReportSchema = createInsertSchema(contactReports).omit({
  id: true,
  createdAt: true
});
var insertPhoneNumberNameSchema = createInsertSchema(phoneNumberNames).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPhoneVerificationRequestSchema = createInsertSchema(phoneVerificationRequests).omit({
  id: true,
  createdAt: true
});
var insertBusinessCategorySchema = createInsertSchema(businessCategories).omit({
  id: true,
  createdAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in production. Did you forget to provision a database?"
  );
}
var pool = null;
var db = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: schema_exports });
} else {
  db = {
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) })
  };
}

// server/storage.ts
import { eq, like, and, or, desc, sql as sql2 } from "drizzle-orm";
import { randomUUID } from "crypto";
var DbStorage = class {
  favorites = /* @__PURE__ */ new Set();
  constructor() {
    this.seedData().catch(console.error);
  }
  async seedData() {
    try {
      return;
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        return;
      }
      const sampleUsers = [
        {
          name: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F \u0639\u0644\u064A",
          phone: "+966501234567",
          city: "\u0627\u0644\u0631\u064A\u0627\u0636",
          accountType: "personal",
          isVerified: true,
          isActive: true
        },
        {
          name: "\u0641\u0627\u0637\u0645\u0629 \u0623\u062D\u0645\u062F",
          phone: "+966559876543",
          city: "\u062C\u062F\u0629",
          accountType: "personal",
          isVerified: false,
          isActive: false
        },
        {
          name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629",
          phone: "+966112345678",
          city: "\u0627\u0644\u0631\u064A\u0627\u0636",
          accountType: "business",
          category: "\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A",
          isVerified: true,
          isActive: true
        },
        {
          name: "\u0645\u062D\u0645\u062F \u0639\u0628\u062F\u0627\u0644\u0644\u0647",
          phone: "+966503456789",
          city: "\u0627\u0644\u062F\u0645\u0627\u0645",
          accountType: "personal",
          isVerified: true,
          isActive: true
        },
        {
          name: "\u0634\u0631\u0643\u0629 \u0627\u0644\u0637\u0628 \u0627\u0644\u062D\u062F\u064A\u062B",
          phone: "+966114567890",
          city: "\u062C\u062F\u0629",
          accountType: "business",
          category: "\u0637\u0628 \u0648\u0635\u062D\u0629",
          isVerified: true,
          isActive: true
        },
        {
          name: "\u0633\u0627\u0631\u0629 \u0623\u062D\u0645\u062F",
          phone: "+966555123456",
          city: "\u0645\u0643\u0629 \u0627\u0644\u0645\u0643\u0631\u0645\u0629",
          accountType: "personal",
          isVerified: false,
          isActive: true
        }
      ];
      const createdUsers = await db.insert(users).values(sampleUsers).returning();
      const sampleReviews = [
        {
          userId: createdUsers[0].id,
          reviewerName: "\u0639\u0628\u062F\u0627\u0644\u0644\u0647 \u0645\u062D\u0645\u062F",
          rating: 5,
          comment: "\u062E\u062F\u0645\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u0631\u062F"
        },
        {
          userId: createdUsers[0].id,
          reviewerName: "\u0646\u0648\u0631\u0627 \u0623\u062D\u0645\u062F",
          rating: 4,
          comment: "\u062A\u0639\u0627\u0645\u0644 \u062C\u064A\u062F \u0648\u0645\u0631\u064A\u062D"
        },
        {
          userId: createdUsers[2].id,
          reviewerName: "\u062E\u0627\u0644\u062F \u0627\u0644\u0639\u0644\u064A",
          rating: 5,
          comment: "\u0623\u0641\u0636\u0644 \u0634\u0631\u0643\u0629 \u062A\u0642\u0646\u064A\u0629 \u062A\u0639\u0627\u0645\u0644\u062A \u0645\u0639\u0647\u0627"
        }
      ];
      await db.insert(reviews).values(sampleReviews);
      const businessUsers = createdUsers.filter((u) => u.accountType === "business");
      if (businessUsers.length > 0) {
        const sampleServices = [
          {
            businessId: businessUsers[0].id,
            title: "\u062A\u0637\u0648\u064A\u0631 \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0648\u064A\u0628",
            description: "\u062A\u0637\u0648\u064A\u0631 \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0648\u064A\u0628 \u0645\u062A\u062C\u0627\u0648\u0628\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u062D\u062F\u062B \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A",
            price: "5000 - 15000 \u0631\u064A\u0627\u0644",
            category: "\u0628\u0631\u0645\u062C\u0629 \u0648\u062A\u0637\u0648\u064A\u0631",
            isActive: true
          },
          {
            businessId: businessUsers[0].id,
            title: "\u062A\u0635\u0645\u064A\u0645 \u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
            description: "\u062A\u0635\u0645\u064A\u0645 \u0648\u0627\u062C\u0647\u0627\u062A \u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0635\u0631\u064A\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
            price: "2000 - 8000 \u0631\u064A\u0627\u0644",
            category: "\u062A\u0635\u0645\u064A\u0645",
            isActive: true
          }
        ];
        if (businessUsers.length > 1) {
          sampleServices.push({
            businessId: businessUsers[1].id,
            title: "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0637\u0628\u064A\u0629",
            description: "\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0637\u0628\u064A\u0629 \u0645\u062A\u062E\u0635\u0635\u0629 \u0639\u0646 \u0628\u064F\u0639\u062F",
            price: "200 - 500 \u0631\u064A\u0627\u0644",
            category: "\u0637\u0628 \u0648\u0635\u062D\u0629",
            isActive: true
          });
        }
        await db.insert(services).values(sampleServices);
        const sampleProducts = [
          {
            businessId: businessUsers[0].id,
            name: "\u0628\u0631\u0646\u0627\u0645\u062C \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646",
            description: "\u0646\u0638\u0627\u0645 \u0634\u0627\u0645\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
            price: "12000 \u0631\u064A\u0627\u0644",
            category: "\u0628\u0631\u0645\u062C\u064A\u0627\u062A",
            stockQuantity: 5,
            isActive: true
          }
        ];
        if (businessUsers.length > 1) {
          sampleProducts.push({
            businessId: businessUsers[1].id,
            name: "\u0623\u062C\u0647\u0632\u0629 \u0637\u0628\u064A\u0629 \u0645\u062A\u062E\u0635\u0635\u0629",
            description: "\u0623\u062C\u0647\u0632\u0629 \u0637\u0628\u064A\u0629 \u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 \u0644\u0644\u0639\u064A\u0627\u062F\u0627\u062A",
            price: "\u062D\u0633\u0628 \u0627\u0644\u0637\u0644\u0628",
            category: "\u0623\u062C\u0647\u0632\u0629 \u0637\u0628\u064A\u0629",
            stockQuantity: 3,
            isActive: true
          });
        }
        await db.insert(products).values(sampleProducts);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByPhone(phone) {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }
  async upsertUser(userData) {
    const result = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values({
      ...insertUser,
      id: randomUUID(),
      city: insertUser.city ?? null,
      accountType: insertUser.accountType ?? "personal",
      isVerified: insertUser.isVerified ?? false,
      isActive: insertUser.isActive ?? true,
      category: insertUser.category ?? null,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  buildUserFilters(filters) {
    if (!filters) return void 0;
    const conditions = [];
    if (filters.city) conditions.push(eq(users.city, filters.city));
    if (filters.accountType) conditions.push(eq(users.accountType, filters.accountType));
    if (filters.isVerified !== void 0) conditions.push(eq(users.isVerified, filters.isVerified));
    if (filters.isActive !== void 0) conditions.push(eq(users.isActive, filters.isActive));
    return conditions.length > 0 ? and(...conditions) : void 0;
  }
  async searchUsersByName(name, filters) {
    if (!name.trim()) return [];
    const filterConditions = this.buildUserFilters(filters);
    const nameCondition = like(users.name, `%${name}%`);
    const whereCondition = filterConditions ? and(nameCondition, filterConditions) : nameCondition;
    return await db.select().from(users).where(whereCondition);
  }
  async searchUsersByPhone(phone, filters) {
    const phoneWithoutCountryCode = phone.replace(/^\+\d{1,4}/, "");
    const phoneConditions = [
      like(users.phone, `%${phone}%`),
      // البحث بالرقم كما تم إدخاله
      like(users.phone, `%${phoneWithoutCountryCode}%`)
      // البحث بالرقم بدون مفتاح الدولة
    ];
    if (!phone.startsWith("+")) {
      const commonCountryCodes = ["+966", "+2", "+971", "+965", "+974", "+973", "+968", "+962", "+961", "+963", "+964", "+967"];
      commonCountryCodes.forEach((countryCode) => {
        phoneConditions.push(like(users.phone, `%${countryCode}${phone}%`));
      });
    }
    const whereConditions = [or(...phoneConditions)];
    if (filters?.city) whereConditions.push(eq(users.city, filters.city));
    if (filters?.accountType) whereConditions.push(eq(users.accountType, filters.accountType));
    if (filters?.isVerified !== void 0) whereConditions.push(eq(users.isVerified, filters.isVerified));
    if (filters?.isActive !== void 0) whereConditions.push(eq(users.isActive, filters.isActive));
    return await db.select().from(users).where(and(...whereConditions));
  }
  async getAllUsers(filters) {
    const whereCondition = this.buildUserFilters(filters);
    return await db.select().from(users).where(whereCondition);
  }
  async getFavoriteUsers() {
    if (this.favorites.size === 0) return [];
    const favoriteIds = Array.from(this.favorites);
    return await db.select().from(users).where(sql2`${users.id} = ANY(${favoriteIds})`);
  }
  async addToFavorites(userId) {
    this.favorites.add(userId);
  }
  async removeFromFavorites(userId) {
    this.favorites.delete(userId);
  }
  async addSearchHistory(insertHistory) {
    const result = await db.insert(searchHistory).values({
      ...insertHistory,
      id: randomUUID(),
      results: insertHistory.results ?? null,
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getRecentSearches(limit = 10) {
    return await db.select().from(searchHistory).orderBy(desc(searchHistory.timestamp)).limit(limit);
  }
  async addReview(insertReview) {
    const result = await db.insert(reviews).values({
      ...insertReview,
      id: randomUUID(),
      comment: insertReview.comment ?? null,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getReviewsForUser(userId) {
    return await db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }
  async getUserAverageRating(userId) {
    const result = await db.select({
      average: sql2`AVG(${reviews.rating})`,
      count: sql2`COUNT(*)`
    }).from(reviews).where(eq(reviews.userId, userId));
    const data = result[0];
    return {
      average: data.average ? Math.round(data.average * 10) / 10 : 0,
      count: data.count || 0
    };
  }
  // Service operations
  async createService(insertService) {
    const result = await db.insert(services).values({
      ...insertService,
      id: randomUUID(),
      description: insertService.description ?? null,
      price: insertService.price ?? null,
      isActive: insertService.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getService(id) {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }
  async getServicesByBusiness(businessId) {
    return await db.select().from(services).where(eq(services.businessId, businessId)).orderBy(desc(services.updatedAt));
  }
  buildServiceProductFilters(table, filters) {
    if (!filters) return void 0;
    const conditions = [];
    if (filters.category) conditions.push(eq(table.category, filters.category));
    if (filters.businessId) conditions.push(eq(table.businessId, filters.businessId));
    if (filters.isActive !== void 0) conditions.push(eq(table.isActive, filters.isActive));
    return conditions.length > 0 ? and(...conditions) : void 0;
  }
  async getAllServices(filters) {
    const whereCondition = this.buildServiceProductFilters(services, filters);
    return await db.select().from(services).where(whereCondition).orderBy(desc(services.updatedAt));
  }
  async updateService(id, updateData) {
    const result = await db.update(services).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(services.id, id)).returning();
    return result[0];
  }
  async deleteService(id) {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }
  async searchServices(query, filters) {
    if (!query.trim()) return [];
    const filterConditions = this.buildServiceProductFilters(services, filters);
    const searchConditions = [
      like(services.title, `%${query}%`),
      like(services.description, `%${query}%`),
      like(services.category, `%${query}%`)
    ];
    const searchCondition = sql2`(${searchConditions.join(" OR ")})`;
    const whereCondition = filterConditions ? and(searchCondition, filterConditions) : searchCondition;
    return await db.select().from(services).where(whereCondition);
  }
  // Product operations
  async createProduct(insertProduct) {
    const result = await db.insert(products).values({
      ...insertProduct,
      id: randomUUID(),
      description: insertProduct.description ?? null,
      price: insertProduct.price ?? null,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      isActive: insertProduct.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getProduct(id) {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }
  async getProductsByBusiness(businessId) {
    return await db.select().from(products).where(eq(products.businessId, businessId)).orderBy(desc(products.updatedAt));
  }
  async getAllProducts(filters) {
    const whereCondition = this.buildServiceProductFilters(products, filters);
    return await db.select().from(products).where(whereCondition).orderBy(desc(products.updatedAt));
  }
  async updateProduct(id, updateData) {
    const result = await db.update(products).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }
  async searchProducts(query, filters) {
    if (!query.trim()) return [];
    const filterConditions = this.buildServiceProductFilters(products, filters);
    const searchConditions = [
      like(products.name, `%${query}%`),
      like(products.description, `%${query}%`),
      like(products.category, `%${query}%`)
    ];
    const searchCondition = sql2`(${searchConditions.join(" OR ")})`;
    const whereCondition = filterConditions ? and(searchCondition, filterConditions) : searchCondition;
    return await db.select().from(products).where(whereCondition);
  }
  // Phone Contact operations
  async addPhoneContact(contact) {
    const result = await db.insert(phoneContacts).values({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getPhoneContactsByNumber(phoneNumber, filters) {
    const phoneWithoutCountryCode = phoneNumber.replace(/^\+\d{1,4}/, "");
    const phoneConditions = [
      eq(phoneContacts.phoneNumber, phoneNumber),
      like(phoneContacts.phoneNumber, `%${phoneWithoutCountryCode}%`)
    ];
    if (!phoneNumber.startsWith("+")) {
      const commonCountryCodes = ["+966", "+2", "+971", "+965", "+974", "+973", "+968", "+962", "+961", "+963", "+964", "+967"];
      commonCountryCodes.forEach((countryCode) => {
        phoneConditions.push(eq(phoneContacts.phoneNumber, `${countryCode}${phoneNumber}`));
      });
    }
    const whereConditions = [or(...phoneConditions)];
    if (filters?.userCity) whereConditions.push(eq(phoneContacts.userCity, filters.userCity));
    if (filters?.userCountry) whereConditions.push(eq(phoneContacts.userCountry, filters.userCountry));
    if (filters?.userRegion) whereConditions.push(eq(phoneContacts.userRegion, filters.userRegion));
    if (filters?.addedByUserId) whereConditions.push(eq(phoneContacts.addedByUserId, filters.addedByUserId));
    if (filters?.isVerified !== void 0) whereConditions.push(eq(phoneContacts.isVerified, filters.isVerified));
    const contacts = await db.select().from(phoneContacts).where(and(...whereConditions)).orderBy(desc(phoneContacts.createdAt));
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await this.getUser(contact.addedByUserId);
        return {
          id: contact.id,
          contactName: contact.contactName,
          addedByUser: {
            id: contact.addedByUserId,
            name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
            city: user?.city || void 0,
            country: user?.country || void 0,
            region: user?.region || void 0
          },
          isVerified: contact.isVerified,
          reportCount: contact.reportCount,
          createdAt: contact.createdAt
        };
      })
    );
    return {
      phoneNumber,
      contacts: contactsWithUsers
    };
  }
  async searchPhoneByName(name, filters) {
    if (!name.trim()) return [];
    const whereConditions = [like(phoneContacts.contactName, `%${name}%`)];
    if (filters?.userCity) whereConditions.push(eq(phoneContacts.userCity, filters.userCity));
    if (filters?.userCountry) whereConditions.push(eq(phoneContacts.userCountry, filters.userCountry));
    if (filters?.userRegion) whereConditions.push(eq(phoneContacts.userRegion, filters.userRegion));
    if (filters?.addedByUserId) whereConditions.push(eq(phoneContacts.addedByUserId, filters.addedByUserId));
    if (filters?.isVerified !== void 0) whereConditions.push(eq(phoneContacts.isVerified, filters.isVerified));
    const contacts = await db.select().from(phoneContacts).where(and(...whereConditions)).orderBy(desc(phoneContacts.createdAt));
    const groupedByPhone = contacts.reduce((acc, contact) => {
      if (!acc[contact.phoneNumber]) {
        acc[contact.phoneNumber] = [];
      }
      acc[contact.phoneNumber].push(contact);
      return acc;
    }, {});
    const results = await Promise.all(
      Object.entries(groupedByPhone).map(async ([phoneNumber, phoneContacts2]) => {
        const contactsWithUsers = await Promise.all(
          phoneContacts2.map(async (contact) => {
            const user = await this.getUser(contact.addedByUserId);
            return {
              id: contact.id,
              contactName: contact.contactName,
              addedByUser: {
                id: contact.addedByUserId,
                name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
                city: user?.city || void 0,
                country: user?.country || void 0,
                region: user?.region || void 0
              },
              isVerified: contact.isVerified,
              reportCount: contact.reportCount,
              createdAt: contact.createdAt
            };
          })
        );
        return {
          phoneNumber,
          contacts: contactsWithUsers
        };
      })
    );
    return results;
  }
  async bulkAddPhoneContacts(contacts) {
    const contactsWithIds = contacts.map((contact) => ({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }));
    const result = await db.insert(phoneContacts).values(contactsWithIds).returning();
    return result;
  }
  async updatePhoneContact(id, updateData) {
    const result = await db.update(phoneContacts).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(phoneContacts.id, id)).returning();
    return result[0];
  }
  async deletePhoneContact(id) {
    const result = await db.delete(phoneContacts).where(eq(phoneContacts.id, id)).returning();
    return result.length > 0;
  }
  async getContactsByUser(userId) {
    return await db.select().from(phoneContacts).where(eq(phoneContacts.addedByUserId, userId)).orderBy(desc(phoneContacts.createdAt));
  }
  // Contact Report operations
  async reportContact(report) {
    const result = await db.insert(contactReports).values({
      ...report,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    await db.update(phoneContacts).set({
      reportCount: sql2`${phoneContacts.reportCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(phoneContacts.id, report.phoneContactId));
    return result[0];
  }
  async getContactReports(phoneContactId) {
    return await db.select().from(contactReports).where(eq(contactReports.phoneContactId, phoneContactId)).orderBy(desc(contactReports.createdAt));
  }
  // Enhanced Phone Number Discovery System
  async addPhoneNumberName(nameData) {
    const result = await db.insert(phoneNumberNames).values({
      ...nameData,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async getPhoneNumberNames(phoneNumber) {
    return await db.select().from(phoneNumberNames).where(eq(phoneNumberNames.phoneNumber, phoneNumber)).where(eq(phoneNumberNames.isActive, true)).orderBy(desc(phoneNumberNames.isVerified), desc(phoneNumberNames.createdAt));
  }
  async searchPhoneNumbersByName(name) {
    return await db.select().from(phoneNumberNames).where(like(phoneNumberNames.name, `%${name}%`)).where(eq(phoneNumberNames.isActive, true)).orderBy(desc(phoneNumberNames.isVerified), desc(phoneNumberNames.createdAt));
  }
  async verifyPhoneNumberName(id, verificationMethod) {
    const result = await db.update(phoneNumberNames).set({
      isVerified: true,
      verificationMethod,
      verificationDate: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(phoneNumberNames.id, id)).returning();
    return result[0];
  }
  async createVerificationRequest(request) {
    const result = await db.insert(phoneVerificationRequests).values({
      ...request,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async verifyPhoneNumber(phoneNumber, code) {
    const request = await db.select().from(phoneVerificationRequests).where(and(
      eq(phoneVerificationRequests.phoneNumber, phoneNumber),
      eq(phoneVerificationRequests.verificationCode, code),
      eq(phoneVerificationRequests.isUsed, false),
      sql2`${phoneVerificationRequests.expiresAt} > NOW()`
    )).limit(1);
    if (request.length === 0) return false;
    await db.update(phoneVerificationRequests).set({ isUsed: true }).where(eq(phoneVerificationRequests.id, request[0].id));
    return true;
  }
  // Business Categories
  async getAllBusinessCategories() {
    return await db.select().from(businessCategories).where(eq(businessCategories.isActive, true)).orderBy(businessCategories.name);
  }
  async getBusinessCategory(id) {
    const result = await db.select().from(businessCategories).where(eq(businessCategories.id, id)).limit(1);
    return result[0];
  }
  // Enhanced search with business categories
  async searchServicesWithCategory(query, categoryId, filters) {
    let whereConditions = [like(services.title, `%${query}%`)];
    if (categoryId) {
      whereConditions.push(eq(services.category, categoryId));
    }
    if (filters?.isActive !== void 0) {
      whereConditions.push(eq(services.isActive, filters.isActive));
    }
    return await db.select().from(services).where(and(...whereConditions)).orderBy(desc(services.isFeatured), desc(services.createdAt));
  }
  async searchProductsWithCategory(query, categoryId, filters) {
    let whereConditions = [like(products.name, `%${query}%`)];
    if (categoryId) {
      whereConditions.push(eq(products.category, categoryId));
    }
    if (filters?.isActive !== void 0) {
      whereConditions.push(eq(products.isActive, filters.isActive));
    }
    return await db.select().from(products).where(and(...whereConditions)).orderBy(desc(products.isFeatured), desc(products.createdAt));
  }
  // Get services and products by business with enhanced info
  async getBusinessServicesAndProducts(businessId) {
    const [services2, products2] = await Promise.all([
      db.select().from(services2).where(eq(services2.businessId, businessId)),
      db.select().from(products2).where(eq(products2.businessId, businessId))
    ]);
    return {
      services: services2,
      products: products2,
      totalServices: services2.length,
      totalProducts: products2.length
    };
  }
};
var InMemoryStorage = class {
  users = [];
  searchHistory = [];
  reviews = [];
  services = [];
  products = [];
  phoneContacts = [];
  contactReports = [];
  phoneNumberNames = [];
  phoneVerificationRequests = [];
  businessCategories = [];
  constructor() {
    this.initializeSampleData();
  }
  initializeSampleData() {
    this.businessCategories = [
      {
        id: "1",
        name: "restaurant",
        arabicName: "\u0645\u0637\u0639\u0645",
        description: "\u0645\u0637\u0627\u0639\u0645 \u0648\u0645\u0642\u0627\u0647\u064A",
        icon: "\u{1F37D}\uFE0F",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "2",
        name: "retail",
        arabicName: "\u0628\u064A\u0639 \u0628\u0627\u0644\u062A\u062C\u0632\u0626\u0629",
        description: "\u0645\u062A\u0627\u062C\u0631 \u0648\u0645\u062D\u0644\u0627\u062A",
        icon: "\u{1F6CD}\uFE0F",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      },
      {
        id: "3",
        name: "healthcare",
        arabicName: "\u0631\u0639\u0627\u064A\u0629 \u0635\u062D\u064A\u0629",
        description: "\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A \u0648\u0639\u064A\u0627\u062F\u0627\u062A",
        icon: "\u{1F3E5}",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      }
    ];
    this.users = [
      {
        id: "1",
        phone: "+966501234567",
        password: "hashed_password",
        name: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F",
        accountType: "business",
        category: "restaurant",
        city: "\u0627\u0644\u0631\u064A\u0627\u0636",
        isVerified: true,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "2",
        phone: "+966502345678",
        password: "hashed_password",
        name: "\u0641\u0627\u0637\u0645\u0629 \u0639\u0644\u064A",
        accountType: "personal",
        city: "\u062C\u062F\u0629",
        isVerified: true,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    this.phoneNumberNames = [
      {
        id: "1",
        phoneNumber: "+966501234567",
        name: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0634\u0631\u0642",
        addedByUserId: "1",
        isVerified: true,
        verificationMethod: "manual",
        verificationDate: /* @__PURE__ */ new Date(),
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    this.services = [
      {
        id: "1",
        businessId: "1",
        title: "\u0648\u062C\u0628\u0629 \u063A\u062F\u0627\u0621",
        description: "\u0648\u062C\u0628\u0629 \u063A\u062F\u0627\u0621 \u0634\u0647\u064A\u0629 \u0645\u0639 \u0645\u0634\u0631\u0648\u0628",
        price: "25 \u0631\u064A\u0627\u0644",
        category: "restaurant",
        duration: "30 \u062F\u0642\u064A\u0642\u0629",
        isActive: true,
        isFeatured: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    this.products = [
      {
        id: "1",
        businessId: "1",
        name: "\u0642\u0647\u0648\u0629 \u0639\u0631\u0628\u064A\u0629",
        description: "\u0642\u0647\u0648\u0629 \u0639\u0631\u0628\u064A\u0629 \u062A\u0642\u0644\u064A\u062F\u064A\u0629",
        price: "15 \u0631\u064A\u0627\u0644",
        category: "restaurant",
        stockQuantity: 100,
        isActive: true,
        isFeatured: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
  }
  // Implement all required methods with in-memory logic
  async getUser(id) {
    return this.users.find((u) => u.id === id);
  }
  async upsertUser(user) {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    const newUser = {
      ...user,
      id: user.id || randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...newUser, updatedAt: /* @__PURE__ */ new Date() };
      return this.users[existingIndex];
    } else {
      this.users.push(newUser);
      return newUser;
    }
  }
  async getUserById(id) {
    return this.users.find((u) => u.id === id);
  }
  async getUserByPhone(phone) {
    return this.users.find((u) => u.phone === phone);
  }
  async createUser(user) {
    const newUser = {
      ...user,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
  async searchUsersByName(name, filters) {
    let results = this.users.filter(
      (u) => u.name.toLowerCase().includes(name.toLowerCase()) && u.isActive
    );
    if (filters?.city) {
      results = results.filter((u) => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter((u) => u.accountType === filters.accountType);
    }
    return results;
  }
  async searchUsersByPhone(phone, filters) {
    let results = this.users.filter(
      (u) => u.phone.includes(phone) && u.isActive
    );
    if (filters?.city) {
      results = results.filter((u) => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter((u) => u.accountType === filters.accountType);
    }
    return results;
  }
  async getAllUsers(filters) {
    let results = this.users.filter((u) => u.isActive);
    if (filters?.city) {
      results = results.filter((u) => u.city === filters.city);
    }
    if (filters?.accountType) {
      results = results.filter((u) => u.accountType === filters.accountType);
    }
    return results;
  }
  async getFavoriteUsers() {
    return [];
  }
  async addToFavorites(userId) {
  }
  async removeFromFavorites(userId) {
  }
  async addSearchHistory(history) {
    const newHistory = {
      ...history,
      id: randomUUID(),
      timestamp: /* @__PURE__ */ new Date()
    };
    this.searchHistory.push(newHistory);
    return newHistory;
  }
  async getRecentSearches(limit) {
    const sorted = this.searchHistory.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }
  // Phone number discovery methods
  async addPhoneNumberName(nameData) {
    const newName = {
      ...nameData,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.phoneNumberNames.push(newName);
    return newName;
  }
  async getPhoneNumberNames(phoneNumber) {
    return this.phoneNumberNames.filter(
      (n) => n.phoneNumber === phoneNumber && n.isActive
    ).sort((a, b) => {
      if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async searchPhoneNumbersByName(name) {
    return this.phoneNumberNames.filter(
      (n) => n.name.toLowerCase().includes(name.toLowerCase()) && n.isActive
    ).sort((a, b) => {
      if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async verifyPhoneNumberName(id, verificationMethod) {
    const name = this.phoneNumberNames.find((n) => n.id === id);
    if (name) {
      name.isVerified = true;
      name.verificationMethod = verificationMethod;
      name.verificationDate = /* @__PURE__ */ new Date();
      name.updatedAt = /* @__PURE__ */ new Date();
      return name;
    }
    return void 0;
  }
  async createVerificationRequest(request) {
    const newRequest = {
      ...request,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.phoneVerificationRequests.push(newRequest);
    return newRequest;
  }
  async verifyPhoneNumber(phoneNumber, code) {
    const request = this.phoneVerificationRequests.find(
      (r) => r.phoneNumber === phoneNumber && r.verificationCode === code && !r.isUsed && new Date(r.expiresAt) > /* @__PURE__ */ new Date()
    );
    if (request) {
      request.isUsed = true;
      return true;
    }
    return false;
  }
  // Business categories
  async getAllBusinessCategories() {
    return this.businessCategories.filter((c) => c.isActive);
  }
  async getBusinessCategory(id) {
    return this.businessCategories.find((c) => c.id === id);
  }
  // Search methods
  async searchServicesWithCategory(query, categoryId, filters) {
    let results = this.services.filter(
      (s) => s.title.toLowerCase().includes(query.toLowerCase()) && s.isActive
    );
    if (categoryId) {
      results = results.filter((s) => s.category === categoryId);
    }
    if (filters?.isActive !== void 0) {
      results = results.filter((s) => s.isActive === filters.isActive);
    }
    return results.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async searchProductsWithCategory(query, categoryId, filters) {
    let results = this.products.filter(
      (p) => p.name.toLowerCase().includes(query.toLowerCase()) && p.isActive
    );
    if (categoryId) {
      results = results.filter((p) => p.category === categoryId);
    }
    if (filters?.isActive !== void 0) {
      results = results.filter((p) => p.isActive === filters.isActive);
    }
    return results.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  async getBusinessServicesAndProducts(businessId) {
    const businessServices = this.services.filter((s) => s.businessId === businessId);
    const businessProducts = this.products.filter((p) => p.businessId === businessId);
    return {
      services: businessServices,
      products: businessProducts,
      totalServices: businessServices.length,
      totalProducts: businessProducts.length
    };
  }
  // Implement other required methods with simplified logic
  async addReview(review) {
    const newReview = {
      ...review,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.reviews.push(newReview);
    return newReview;
  }
  async getReviewsForUser(userId) {
    return this.reviews.filter((r) => r.userId === userId);
  }
  async getUserAverageRating(userId) {
    const userReviews = this.reviews.filter((r) => r.userId === userId);
    if (userReviews.length === 0) return { average: 0, count: 0 };
    const total = userReviews.reduce((sum, r) => sum + r.rating, 0);
    return { average: total / userReviews.length, count: userReviews.length };
  }
  async createService(service) {
    const newService = {
      ...service,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.services.push(newService);
    return newService;
  }
  async getService(id) {
    return this.services.find((s) => s.id === id);
  }
  async getServicesByBusiness(businessId) {
    return this.services.filter((s) => s.businessId === businessId);
  }
  async getAllServices(filters) {
    let results = this.services.filter((s) => s.isActive);
    if (filters?.businessId) {
      results = results.filter((s) => s.businessId === filters.businessId);
    }
    return results;
  }
  async updateService(id, service) {
    const index2 = this.services.findIndex((s) => s.id === id);
    if (index2 >= 0) {
      this.services[index2] = { ...this.services[index2], ...service, updatedAt: /* @__PURE__ */ new Date() };
      return this.services[index2];
    }
    return void 0;
  }
  async deleteService(id) {
    const index2 = this.services.findIndex((s) => s.id === id);
    if (index2 >= 0) {
      this.services.splice(index2, 1);
      return true;
    }
    return false;
  }
  async searchServices(query, filters) {
    return this.searchServicesWithCategory(query, filters?.category, filters);
  }
  async createProduct(product) {
    const newProduct = {
      ...product,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }
  async getProduct(id) {
    return this.products.find((p) => p.id === id);
  }
  async getProductsByBusiness(businessId) {
    return this.products.filter((p) => p.businessId === businessId);
  }
  async getAllProducts(filters) {
    let results = this.products.filter((p) => p.isActive);
    if (filters?.businessId) {
      results = results.filter((p) => p.businessId === filters.businessId);
    }
    return results;
  }
  async updateProduct(id, product) {
    const index2 = this.products.findIndex((p) => p.id === id);
    if (index2 >= 0) {
      this.products[index2] = { ...this.products[index2], ...product, updatedAt: /* @__PURE__ */ new Date() };
      return this.products[index2];
    }
    return void 0;
  }
  async deleteProduct(id) {
    const index2 = this.products.findIndex((p) => p.id === id);
    if (index2 >= 0) {
      this.products.splice(index2, 1);
      return true;
    }
    return false;
  }
  async searchProducts(query, filters) {
    return this.searchProductsWithCategory(query, filters?.category, filters);
  }
  async addPhoneContact(contact) {
    const newContact = {
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.phoneContacts.push(newContact);
    return newContact;
  }
  async getPhoneContactsByNumber(phoneNumber, filters) {
    const contacts = this.phoneContacts.filter((c) => c.phoneNumber === phoneNumber);
    const contactsWithUsers = await Promise.all(
      contacts.map(async (contact) => {
        const user = await this.getUser(contact.addedByUserId);
        return {
          id: contact.id,
          contactName: contact.contactName,
          addedByUser: {
            id: contact.addedByUserId,
            name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
            city: user?.city,
            country: user?.country,
            region: user?.region
          },
          isVerified: contact.isVerified,
          reportCount: contact.reportCount,
          createdAt: contact.createdAt
        };
      })
    );
    return {
      phoneNumber,
      contacts: contactsWithUsers
    };
  }
  async searchPhoneByName(name, filters) {
    const contacts = this.phoneContacts.filter(
      (c) => c.contactName.toLowerCase().includes(name.toLowerCase())
    );
    const groupedByPhone = contacts.reduce((acc, contact) => {
      if (!acc[contact.phoneNumber]) {
        acc[contact.phoneNumber] = [];
      }
      acc[contact.phoneNumber].push(contact);
      return acc;
    }, {});
    const results = await Promise.all(
      Object.entries(groupedByPhone).map(async ([phoneNumber, phoneContacts2]) => {
        const contactsWithUsers = await Promise.all(
          phoneContacts2.map(async (contact) => {
            const user = await this.getUser(contact.addedByUserId);
            return {
              id: contact.id,
              contactName: contact.contactName,
              addedByUser: {
                id: contact.addedByUserId,
                name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
                city: user?.city,
                country: user?.country,
                region: user?.region
              },
              isVerified: contact.isVerified,
              reportCount: contact.reportCount,
              createdAt: contact.createdAt
            };
          })
        );
        return {
          phoneNumber,
          contacts: contactsWithUsers
        };
      })
    );
    return results;
  }
  async bulkAddPhoneContacts(contacts) {
    const contactsWithIds = contacts.map((contact) => ({
      ...contact,
      id: randomUUID(),
      isVerified: contact.isVerified ?? false,
      reportCount: 0,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }));
    this.phoneContacts.push(...contactsWithIds);
    return contactsWithIds;
  }
  async updatePhoneContact(id, updateData) {
    const index2 = this.phoneContacts.findIndex((c) => c.id === id);
    if (index2 >= 0) {
      this.phoneContacts[index2] = { ...this.phoneContacts[index2], ...updateData, updatedAt: /* @__PURE__ */ new Date() };
      return this.phoneContacts[index2];
    }
    return void 0;
  }
  async deletePhoneContact(id) {
    const index2 = this.phoneContacts.findIndex((c) => c.id === id);
    if (index2 >= 0) {
      this.phoneContacts.splice(index2, 1);
      return true;
    }
    return false;
  }
  async getContactsByUser(userId) {
    return this.phoneContacts.filter((c) => c.addedByUserId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async reportContact(report) {
    const newReport = {
      ...report,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contactReports.push(newReport);
    const contact = this.phoneContacts.find((c) => c.id === report.phoneContactId);
    if (contact) {
      contact.reportCount++;
      contact.updatedAt = /* @__PURE__ */ new Date();
    }
    return newReport;
  }
  async getContactReports(phoneContactId) {
    return this.contactReports.filter((r) => r.phoneContactId === phoneContactId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
var storage = process.env.NODE_ENV === "development" && !process.env.DATABASE_URL ? new InMemoryStorage() : new DbStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false,
      // Set to true in production with HTTPS
      maxAge: sessionTtl
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "phone", passwordField: "password" },
      async (phone, password, done) => {
        try {
          const user = await storage.getUserByPhone(phone);
          if (!user || !await comparePasswords(password, user.password)) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { phone, password, name } = req.body;
      if (!phone || !password || !name) {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u0627\u0644\u0627\u0633\u0645 \u0645\u0637\u0644\u0648\u0628\u0629" });
      }
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      const user = await storage.createUser({
        phone,
        password: await hashPassword(password),
        name,
        accountType: "personal",
        isVerified: false,
        isActive: true
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628" });
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/auth/user", async (req, res) => {
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
  app2.get("/api/search", async (req, res) => {
    try {
      const { query, type, city, accountType, isVerified, isActive } = req.query;
      if (!query || !type) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0648\u0646\u0648\u0639 \u0627\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (city) filters.city = city;
      if (accountType) filters.accountType = accountType;
      if (isVerified !== void 0) filters.isVerified = isVerified === "true";
      if (isActive !== void 0) filters.isActive = isActive === "true";
      let result;
      if (type === "phone") {
        const users2 = await storage.searchUsersByPhone(query, filters);
        const phoneContacts2 = await storage.getPhoneContactsByNumber(query);
        result = {
          users: users2,
          phoneContacts: phoneContacts2.contacts,
          totalContacts: phoneContacts2.contacts.length
        };
      } else if (type === "name") {
        const users2 = await storage.searchUsersByName(query, filters);
        const phoneSearchResults = await storage.searchPhoneByName(query);
        result = {
          users: users2,
          phoneContacts: phoneSearchResults.flatMap((r) => r.contacts),
          totalContacts: phoneSearchResults.reduce((sum, r) => sum + r.contacts.length, 0)
        };
      } else {
        return res.status(400).json({ message: "\u0646\u0648\u0639 \u0628\u062D\u062B \u063A\u064A\u0631 \u0635\u062D\u064A\u062D" });
      }
      await storage.addSearchHistory({
        query,
        searchType: type,
        results: JSON.stringify(result)
      });
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B" });
    }
  });
  app2.post("/api/phone-contacts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
      }
      const validatedData = insertPhoneContactSchema.parse(req.body);
      const contact = await storage.addPhoneContact({
        ...validatedData,
        addedByUserId: req.user.id
      });
      res.status(201).json(contact);
    } catch (error) {
      console.error("Add contact error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.get("/api/phone-contacts/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const result = await storage.getPhoneContactsByNumber(phoneNumber);
      res.json(result);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.get("/api/search/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const users2 = await storage.searchUsersByPhone(phone);
      await storage.addSearchHistory({
        query: phone,
        searchType: "phone",
        results: JSON.stringify(users2)
      });
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.get("/api/search/name/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const users2 = await storage.searchUsersByName(name);
      await storage.addSearchHistory({
        query: name,
        searchType: "name",
        results: JSON.stringify(users2)
      });
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0627\u0633\u0645" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0633\u062C\u0644 \u0645\u0633\u0628\u0642\u0627\u064B" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.get("/api/users/phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const { city, accountType, isVerified, isActive } = req.query;
      const filters = {};
      if (city) filters.city = city;
      if (accountType) filters.accountType = accountType;
      if (isVerified !== void 0) filters.isVerified = isVerified === "true";
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const users2 = await storage.getAllUsers(filters);
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" });
    }
  });
  app2.get("/api/favorites", async (req, res) => {
    try {
      const favorites2 = await storage.getFavoriteUsers();
      res.json(favorites2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0641\u0636\u0644\u0629" });
    }
  });
  app2.post("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.addToFavorites(userId);
      res.json({ message: "\u062A\u0645 \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629" });
    }
  });
  app2.delete("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.removeFromFavorites(userId);
      res.json({ message: "\u062A\u0645 \u0627\u0644\u062D\u0630\u0641 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629" });
    }
  });
  app2.get("/api/search/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const history = await storage.getRecentSearches(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u0628\u062D\u062B" });
    }
  });
  app2.get("/api/export", async (req, res) => {
    try {
      const format = req.query.format || "json";
      const users2 = await storage.getAllUsers();
      if (format === "csv") {
        const csvHeader = "Name,Phone,City,Account Type,Verified,Active,Category\n";
        const csvData = users2.map(
          (user) => `"${user.name}","${user.phone}","${user.city || ""}","${user.accountType}","${user.isVerified}","${user.isActive}","${user.category || ""}"`
        ).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="contacts.csv"');
        res.send(csvHeader + csvData);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", 'attachment; filename="contacts.json"');
        res.json(users2);
      }
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
    }
  });
  app2.post("/api/import", async (req, res) => {
    try {
      const { users: importedUsers, format = "json" } = req.body;
      if (!importedUsers || !Array.isArray(importedUsers)) {
        return res.status(400).json({ message: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629 \u0644\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F" });
      }
      const results = {
        total: importedUsers.length,
        success: 0,
        failed: 0,
        errors: []
      };
      for (const userData of importedUsers) {
        try {
          if (!userData.name || !userData.phone) {
            results.failed++;
            results.errors.push(`\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u0645 \u0648\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645`);
            continue;
          }
          const existingUser = await storage.getUserByPhone(userData.phone);
          if (existingUser) {
            results.failed++;
            results.errors.push(`\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 ${userData.phone} \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B`);
            continue;
          }
          const validatedUser = insertUserSchema.parse({
            name: userData.name,
            phone: userData.phone,
            city: userData.city || null,
            accountType: userData.accountType || "personal",
            isVerified: userData.isVerified || false,
            isActive: userData.isActive !== void 0 ? userData.isActive : true,
            category: userData.category || null
          });
          await storage.createUser(validatedUser);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 ${userData.name || "\u0645\u0633\u062A\u062E\u062F\u0645"}: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
        }
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" });
    }
  });
  app2.get("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews2 = await storage.getReviewsForUser(userId);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A" });
    }
  });
  app2.get("/api/users/:userId/rating", async (req, res) => {
    try {
      const { userId } = req.params;
      const rating = await storage.getUserAverageRating(userId);
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645" });
    }
  });
  app2.post("/api/users/:userId/reviews", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviewData = { ...req.body, userId };
      const validatedReview = insertReviewSchema.parse(reviewData);
      const review = await storage.addReview(validatedReview);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const { category, businessId, isActive } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (businessId) filters.businessId = businessId;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const services2 = await storage.getAllServices(filters);
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" });
    }
  });
  app2.get("/api/services/search", async (req, res) => {
    try {
      const { query, category, businessId, isActive } = req.query;
      if (!query) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0646\u0635 \u0627\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (category) filters.category = category;
      if (businessId) filters.businessId = businessId;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const services2 = await storage.searchServices(query, filters);
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" });
    }
  });
  app2.get("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062E\u062F\u0645\u0629" });
    }
  });
  app2.get("/api/businesses/:businessId/services", async (req, res) => {
    try {
      const { businessId } = req.params;
      const services2 = await storage.getServicesByBusiness(businessId);
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" });
    }
  });
  app2.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062E\u062F\u0645\u0629" });
    }
  });
  app2.put("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const service = await storage.updateService(id, updateData);
      if (!service) {
        return res.status(404).json({ message: "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062E\u062F\u0645\u0629" });
    }
  });
  app2.delete("/api/services/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062E\u062F\u0645\u0629 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u062E\u062F\u0645\u0629" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, businessId, isActive } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (businessId) filters.businessId = businessId;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const products2 = await storage.getAllProducts(filters);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" });
    }
  });
  app2.get("/api/products/search", async (req, res) => {
    try {
      const { query, category, businessId, isActive } = req.query;
      if (!query) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0646\u0635 \u0627\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (category) filters.category = category;
      if (businessId) filters.businessId = businessId;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const products2 = await storage.searchProducts(query, filters);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app2.get("/api/businesses/:businessId/products", async (req, res) => {
    try {
      const { businessId } = req.params;
      const products2 = await storage.getProductsByBusiness(businessId);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C" });
    }
  });
  app2.get("/api/phone/search/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const { userCity, userCountry, userRegion, isVerified } = req.query;
      const filters = {};
      if (userCity) filters.userCity = userCity;
      if (userCountry) filters.userCountry = userCountry;
      if (userRegion) filters.userRegion = userRegion;
      if (isVerified !== void 0) filters.isVerified = isVerified === "true";
      const result = await storage.getPhoneContactsByNumber(phoneNumber, filters);
      await storage.addSearchHistory({
        query: phoneNumber,
        searchType: "phone",
        results: JSON.stringify(result)
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.get("/api/contacts/search", async (req, res) => {
    try {
      const { name, userCity, userCountry, userRegion, isVerified } = req.query;
      if (!name) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u0645 \u0644\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (userCity) filters.userCity = userCity;
      if (userCountry) filters.userCountry = userCountry;
      if (userRegion) filters.userRegion = userRegion;
      if (isVerified !== void 0) filters.isVerified = isVerified === "true";
      const results = await storage.searchPhoneByName(name, filters);
      await storage.addSearchHistory({
        query: name,
        searchType: "name",
        results: JSON.stringify(results)
      });
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0627\u0633\u0645" });
    }
  });
  app2.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertPhoneContactSchema.parse(req.body);
      const contact = await storage.addPhoneContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.post("/api/contacts/bulk", async (req, res) => {
    try {
      const { contacts } = req.body;
      if (!Array.isArray(contacts)) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0642\u0627\u0626\u0645\u0629 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
      }
      const validatedContacts = contacts.map(
        (contact) => insertPhoneContactSchema.parse(contact)
      );
      const addedContacts = await storage.bulkAddPhoneContacts(validatedContacts);
      res.status(201).json({
        message: `\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 ${addedContacts.length} \u062C\u0647\u0629 \u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u062C\u0627\u062D`,
        contacts: addedContacts
      });
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.get("/api/users/:userId/contacts", async (req, res) => {
    try {
      const { userId } = req.params;
      const contacts = await storage.getContactsByUser(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.put("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const contact = await storage.updatePhoneContact(id, updateData);
      if (!contact) {
        return res.status(404).json({ message: "\u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.delete("/api/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePhoneContact(id);
      if (!deleted) {
        return res.status(404).json({ message: "\u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json({ message: "\u062A\u0645 \u062D\u0630\u0641 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.post("/api/contacts/:id/report", async (req, res) => {
    try {
      const { id: phoneContactId } = req.params;
      const reportData = insertContactReportSchema.parse({
        ...req.body,
        phoneContactId
      });
      const report = await storage.reportContact(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.get("/api/contacts/:id/reports", async (req, res) => {
    try {
      const { id } = req.params;
      const reports = await storage.getContactReports(id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u062A\u0642\u0627\u0631\u064A\u0631 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644" });
    }
  });
  app2.post("/api/phone-numbers/:phoneNumber/names", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
      }
      const { phoneNumber } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u0645 \u0644\u0644\u0631\u0642\u0645" });
      }
      const phoneName = await storage.addPhoneNumberName({
        phoneNumber,
        name,
        addedByUserId: req.user.id
      });
      res.status(201).json(phoneName);
    } catch (error) {
      console.error("Add phone name error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0633\u0645 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.get("/api/phone-numbers/:phoneNumber/names", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const names = await storage.getPhoneNumberNames(phoneNumber);
      const namesWithUsers = await Promise.all(
        names.map(async (name) => {
          const user = await storage.getUser(name.addedByUserId);
          return {
            ...name,
            addedByUser: {
              id: user?.id,
              name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
              city: user?.city,
              country: user?.country,
              region: user?.region
            }
          };
        })
      );
      res.json(namesWithUsers);
    } catch (error) {
      console.error("Get phone names error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.get("/api/phone-numbers/search", async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u0645 \u0644\u0644\u0628\u062D\u062B" });
      }
      const results = await storage.searchPhoneNumbersByName(name);
      const resultsWithUsers = await Promise.all(
        results.map(async (result) => {
          const user = await storage.getUser(result.addedByUserId);
          return {
            ...result,
            addedByUser: {
              id: user?.id,
              name: user?.name || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641",
              city: user?.city,
              country: user?.country,
              region: user?.region
            }
          };
        })
      );
      res.json(resultsWithUsers);
    } catch (error) {
      console.error("Search phone numbers error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0623\u0631\u0642\u0627\u0645" });
    }
  });
  app2.post("/api/phone-numbers/names/:id/verify", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
      }
      const { id } = req.params;
      const { verificationMethod } = req.body;
      if (!verificationMethod) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u062D\u0642\u0642" });
      }
      const verifiedName = await storage.verifyPhoneNumberName(id, verificationMethod);
      if (!verifiedName) {
        return res.status(404).json({ message: "\u0627\u0633\u0645 \u0627\u0644\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
      }
      res.json(verifiedName);
    } catch (error) {
      console.error("Verify phone name error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0633\u0645 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.post("/api/phone-numbers/verify", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
      }
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" });
      }
      const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      const verificationRequest = await storage.createVerificationRequest({
        phoneNumber,
        requestedByUserId: req.user.id,
        verificationCode,
        expiresAt
      });
      res.status(201).json({
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642",
        verificationCode,
        // Remove this in production
        expiresAt
      });
    } catch (error) {
      console.error("Create verification request error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062A\u062D\u0642\u0642" });
    }
  });
  app2.post("/api/phone-numbers/verify-code", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      if (!phoneNumber || !code) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642" });
      }
      const isValid = await storage.verifyPhoneNumber(phoneNumber, code);
      if (!isValid) {
        return res.status(400).json({ message: "\u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
      }
      res.json({ message: "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0628\u0646\u062C\u0627\u062D" });
    } catch (error) {
      console.error("Verify phone number error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0642\u0645" });
    }
  });
  app2.get("/api/business-categories", async (req, res) => {
    try {
      const categories = await storage.getAllBusinessCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get business categories error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0641\u0626\u0627\u062A \u0627\u0644\u0623\u0639\u0645\u0627\u0644" });
    }
  });
  app2.get("/api/business-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.getBusinessCategory(id);
      if (!category) {
        return res.status(404).json({ message: "\u0641\u0626\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
      }
      res.json(category);
    } catch (error) {
      console.error("Get business category error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0641\u0626\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644" });
    }
  });
  app2.get("/api/search/services", async (req, res) => {
    try {
      const { query, categoryId, isActive } = req.query;
      if (!query) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0644\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const services2 = await storage.searchServicesWithCategory(
        query,
        categoryId,
        filters
      );
      res.json(services2);
    } catch (error) {
      console.error("Search services error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" });
    }
  });
  app2.get("/api/search/products", async (req, res) => {
    try {
      const { query, categoryId, isActive } = req.query;
      if (!query) {
        return res.status(400).json({ message: "\u0645\u0637\u0644\u0648\u0628 \u0627\u0633\u062A\u0639\u0644\u0627\u0645 \u0644\u0644\u0628\u062D\u062B" });
      }
      const filters = {};
      if (isActive !== void 0) filters.isActive = isActive === "true";
      const products2 = await storage.searchProductsWithCategory(
        query,
        categoryId,
        filters
      );
      res.json(products2);
    } catch (error) {
      console.error("Search products error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" });
    }
  });
  app2.get("/api/businesses/:businessId/services-products", async (req, res) => {
    try {
      const { businessId } = req.params;
      const result = await storage.getBusinessServicesAndProducts(businessId);
      res.json(result);
    } catch (error) {
      console.error("Get business services and products error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u062E\u062F\u0645\u0627\u062A \u0648\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0645\u0644" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
