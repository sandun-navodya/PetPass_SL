-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "location_name" TEXT NOT NULL,
    "location_type" TEXT NOT NULL,
    "parent_location_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "clinic_id" SERIAL NOT NULL,
    "clinic_name" TEXT NOT NULL,
    "description" TEXT,
    "location_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "website" TEXT,
    "opening_hours" JSONB,
    "map_latitude" DOUBLE PRECISION,
    "map_longitude" DOUBLE PRECISION,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("clinic_id")
);

-- CreateTable
CREATE TABLE "clinic_services" (
    "clinic_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_services_pkey" PRIMARY KEY ("clinic_id","category_id")
);

-- CreateTable
CREATE TABLE "clinic_images" (
    "image_id" SERIAL NOT NULL,
    "clinic_id" INTEGER NOT NULL,
    "image_type" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateIndex
CREATE INDEX "locations_location_type_is_active_idx" ON "locations"("location_type", "is_active");

-- CreateIndex
CREATE INDEX "locations_parent_location_id_idx" ON "locations"("parent_location_id");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "clinics_location_id_is_active_idx" ON "clinics"("location_id", "is_active");

-- CreateIndex
CREATE INDEX "clinics_is_featured_is_active_idx" ON "clinics"("is_featured", "is_active");

-- CreateIndex
CREATE INDEX "clinic_images_clinic_id_image_type_idx" ON "clinic_images"("clinic_id", "image_type");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_location_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("clinic_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_services" ADD CONSTRAINT "clinic_services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_images" ADD CONSTRAINT "clinic_images_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("clinic_id") ON DELETE CASCADE ON UPDATE CASCADE;
