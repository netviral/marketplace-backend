import { prisma } from "../config/database.config.js";
import User from "../models/User.model.js";

export default class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const db = await prisma.user.findUnique({ where: { email } });
    if (!db) return null;

    return new User(db.id, db.imageUrl ?? "", db.name, db.email, db.roles);
  }


  static async create(user: User): Promise<User> {
    try {
      const db = await prisma.user.create({
        data: {
          id: user.id,
          name: user["_name"],
          email: user["_email"],
          imageUrl: user["_imageUrl"],
          roles: user["_roles"],
          isActive: user["_isActive"],
        },
      });

      return new User(db.id, db.name, db.email, db.imageUrl ?? "", db.roles);
    } catch (err) {
      console.error("Prisma User.create failed:", err);

      // Optional: wrap in your own custom error for controllers to catch
      throw new Error("Failed to create user: " + (err as any).message);
    }
  }

  static async update(user: User): Promise<User> {
    const db = await prisma.user.update({
      where: { email: user.email },
      data: {
        name: user.name,
        roles: user.roles,
      }
    });
    return new User(db.id, db.name, db.email, db.imageUrl ?? "", db.roles);
  }


  static async verifyApiKey(email: string, apiKey: string): Promise<boolean> {
    if (email && apiKey) {
      const user: User | null = await this.findByEmail(email);
      if (user !== null) {
        return user["apiKey"] === apiKey;
      }
    }
    return false;
  }
}
