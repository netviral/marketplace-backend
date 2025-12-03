import VendorFactory from "../factories/VendorFactory.js";
import VendorRepository from "../repositories/VendorRepository.js";
import Vendor from "../models/Vendor.model.js";

export class VendorService {
  static async getVendorById(id: string): Promise<Vendor | null> {
    return VendorRepository.findById(id);
  }

  static async registerVendor(
    name: string,
    description: string,
    contactEmail: string,
    contactPhone: string,
    categories: string[] = []
  ): Promise<Vendor> {
    const vendor = VendorFactory.createNew(name, description, contactEmail, contactPhone, categories);
    return VendorRepository.create(vendor);
  }

  static async addCategory(id: string, category: string): Promise<Vendor> {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) throw new Error("Vendor not found");

    vendor.addCategory(category);
    return VendorRepository.update(vendor);
  }
}
