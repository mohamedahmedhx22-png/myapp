import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with phone authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Phone authentication fields
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(), // Hashed password for phone auth
  name: text("name").notNull(),
  // Optional fields
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  city: text("city"),
  country: text("country"), // User's country
  region: text("region"), // User's region/state
  address: text("address"), // Full address for businesses
  accountType: text("account_type").notNull().default("personal"), // personal | business
  isVerified: boolean("is_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category"), // for business accounts
  description: text("description"), // Business description
  website: text("website"), // Business website
  logoUrl: text("logo_url"), // Business logo
  coverImageUrl: text("cover_image_url"), // Business cover image
  workingHours: text("working_hours"), // JSON string for business hours
  tags: text("tags").array(), // Business tags for better search
  lastContactsSync: timestamp("last_contacts_sync"), // When user last synced contacts
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  searchType: text("search_type").notNull(), // "name" | "phone"
  results: text("results"), // JSON string of search results
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price"), // Stored as text to support ranges like "100-200" or "حسب الطلب"
  category: text("category").notNull(),
  duration: text("duration"), // Service duration (e.g., "30 minutes", "2 hours")
  imageUrls: text("image_urls").array(), // Service images
  tags: text("tags").array(), // Service tags for better search
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price"), // Stored as text to support ranges and custom pricing
  originalPrice: text("original_price"), // For showing discounts
  category: text("category").notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  imageUrls: text("image_urls").array(), // Product images
  specifications: text("specifications"), // JSON string for product specs
  tags: text("tags").array(), // Product tags for better search
  weight: text("weight"), // Product weight
  dimensions: text("dimensions"), // Product dimensions
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Phone number contacts - stores all names associated with phone numbers
export const phoneContacts = pgTable("phone_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(), // The actual phone number
  contactName: text("contact_name").notNull().default("Unknown"), // Name saved by user
  addedByUserId: text("added_by_user_id").notNull(), // Who added this name
  userCity: text("user_city"), // City of user who added this contact
  userCountry: text("user_country"), // Country of user who added this contact
  userRegion: text("user_region"), // Region of user who added this contact
  isVerified: boolean("is_verified").notNull().default(false), // If this contact is verified
  reportCount: integer("report_count").notNull().default(0), // Number of reports against this contact
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// User favorites for products and services
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  itemType: text("item_type").notNull(), // "product" | "service" | "business"
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Contact reports - for reporting spam or incorrect information
export const contactReports = pgTable("contact_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneContactId: text("phone_contact_id").notNull(), // ID of the phone contact being reported
  reportedByUserId: text("reported_by_user_id").notNull(), // Who reported this
  reportType: text("report_type").notNull(), // "spam" | "incorrect" | "inappropriate"
  reportReason: text("report_reason"), // Additional details
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Business image gallery
export const businessImages = pgTable("business_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: text("business_id").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Enhanced phone number discovery system
export const phoneNumberNames = pgTable("phone_number_names", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  name: text("name").notNull(),
  addedByUserId: text("added_by_user_id").notNull(), // Who added this name
  isVerified: boolean("is_verified").notNull().default(false),
  verificationMethod: text("verification_method"), // "sms", "call", "manual"
  verificationDate: timestamp("verification_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Phone number verification requests
export const phoneVerificationRequests = pgTable("phone_verification_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  requestedByUserId: text("requested_by_user_id").notNull(),
  verificationCode: text("verification_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Business categories for better organization
export const businessCategories = pgTable("business_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  arabicName: text("arabic_name"),
  description: text("description"),
  icon: text("icon"), // Icon name or URL
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schema for upsert operations
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  timestamp: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessImageSchema = createInsertSchema(businessImages).omit({
  id: true,
  createdAt: true,
});

export const insertPhoneContactSchema = createInsertSchema(phoneContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactReportSchema = createInsertSchema(contactReports).omit({
  id: true,
  createdAt: true,
});

export const insertPhoneNumberNameSchema = createInsertSchema(phoneNumberNames).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhoneVerificationRequestSchema = createInsertSchema(phoneVerificationRequests).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessCategorySchema = createInsertSchema(businessCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertBusinessImage = z.infer<typeof insertBusinessImageSchema>;
export type BusinessImage = typeof businessImages.$inferSelect;
export type InsertPhoneContact = z.infer<typeof insertPhoneContactSchema>;
export type PhoneContact = typeof phoneContacts.$inferSelect;
export type InsertContactReport = z.infer<typeof insertContactReportSchema>;
export type ContactReport = typeof contactReports.$inferSelect;
export type InsertPhoneNumberName = z.infer<typeof insertPhoneNumberNameSchema>;
export type PhoneNumberName = typeof phoneNumberNames.$inferSelect;
export type InsertPhoneVerificationRequest = z.infer<typeof insertPhoneVerificationRequestSchema>;
export type PhoneVerificationRequest = typeof phoneVerificationRequests.$inferSelect;
export type InsertBusinessCategory = z.infer<typeof insertBusinessCategorySchema>;
export type BusinessCategory = typeof businessCategories.$inferSelect;
