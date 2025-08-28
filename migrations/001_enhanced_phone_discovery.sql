-- Migration: Enhanced Phone Discovery System
-- Date: 2024-01-01
-- Description: Add new tables for enhanced phone number discovery and business categories

-- Enhanced phone number discovery system
CREATE TABLE IF NOT EXISTS "phone_number_names" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone_number" text NOT NULL,
  "name" text NOT NULL,
  "added_by_user_id" text NOT NULL,
  "is_verified" boolean NOT NULL DEFAULT false,
  "verification_method" text,
  "verification_date" timestamp,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Phone number verification requests
CREATE TABLE IF NOT EXISTS "phone_verification_requests" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "phone_number" text NOT NULL,
  "requested_by_user_id" text NOT NULL,
  "verification_code" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "is_used" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Business categories for better organization
CREATE TABLE IF NOT EXISTS "business_categories" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL UNIQUE,
  "arabic_name" text,
  "description" text,
  "icon" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default business categories
INSERT INTO "business_categories" ("name", "arabic_name", "description", "icon") VALUES
  ('restaurant', 'مطعم', 'مطاعم ومقاهي', '🍽️'),
  ('retail', 'بيع بالتجزئة', 'متاجر ومحلات', '🛍️'),
  ('healthcare', 'رعاية صحية', 'مستشفيات وعيادات', '🏥'),
  ('education', 'تعليم', 'مدارس وجامعات', '🎓'),
  ('automotive', 'سيارات', 'معارض وورش صيانة', '🚗'),
  ('beauty', 'جمال', 'صالونات تجميل', '💄'),
  ('technology', 'تقنية', 'شركات تقنية', '💻'),
  ('real_estate', 'عقارات', 'شركات عقارية', '🏠'),
  ('financial', 'مالية', 'بنوك وشركات تأمين', '💰'),
  ('entertainment', 'ترفيه', 'ملاهي ومراكز ترفيهية', '🎮');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IDX_phone_number_names_phone" ON "phone_number_names" ("phone_number");
CREATE INDEX IF NOT EXISTS "IDX_phone_number_names_verified" ON "phone_number_names" ("is_verified");
CREATE INDEX IF NOT EXISTS "IDX_phone_verification_requests_phone" ON "phone_verification_requests" ("phone_number");
CREATE INDEX IF NOT EXISTS "IDX_phone_verification_requests_expires" ON "phone_verification_requests" ("expires_at");
CREATE INDEX IF NOT EXISTS "IDX_business_categories_active" ON "business_categories" ("is_active");