import { prisma } from "../config/database.config.js";
import Vendor from "../models/Vendor.model.js";

export default class VendorRepository {
  static async findById(id: string): Promise<Vendor | null> {
    const db = await prisma.vendor.findUnique({ where: { id } });
    if (!db) return null;

    return new Vendor(db.id, db.name, db.description, db.contactEmail, db.contactPhone, db.categories);
  }

  static async create(vendor: Vendor): Promise<Vendor> {
    const db = await prisma.vendor.create({
      data: {
        id: vendor.id,
        name: vendor.name,
        description: vendor.description,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        categories: vendor.categories,
      }
    });
    return new Vendor(db.id, db.name, db.description, db.contactEmail, db.contactPhone, db.categories);
  }

  static async update(vendor: Vendor): Promise<Vendor> {
    const db = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        name: vendor.name,
        description: vendor.description,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        categories: vendor.categories,
      }
    });
    return new Vendor(db.id, db.name, db.description, db.contactEmail, db.contactPhone, db.categories);
  }
}
