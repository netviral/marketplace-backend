import Vendor from "../models/Vendor.model.js";
import IdUtil from "../utils/IdUtil.js";

export default class VendorFactory {
  static createNew(
    name: string,
    description: string,
    contactEmail: string,
    contactPhone: string,
    categories: string[] = []
  ) {
    return new Vendor(IdUtil.generateUUID(), name, description, contactEmail, contactPhone, categories);
  }
}
