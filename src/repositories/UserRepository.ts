import { prisma } from "../config/database.config.js";
import User from "../models/User.model.js";

export default class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const db = await prisma.user.findUnique({ where: { email } });
    if (!db) return null;

    return new User(
      db.id,
      db.imageUrl ?? "",
      db.name,
      db.email,
      db.roles,
      db.phone ?? "",
      db.address ?? "",
      db.isActive,
      db.isBlocked
    );
  }

  static async findById(id: string): Promise<User | null> {
    const db = await prisma.user.findUnique({ where: { id } });
    if (!db) return null;

    return new User(
      db.id,
      db.imageUrl ?? "",
      db.name,
      db.email,
      db.roles,
      db.phone ?? "",
      db.address ?? "",
      db.isActive,
      db.isBlocked
    );
  }

  static async create(user: User): Promise<User> {
    try {
      const db = await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl,
          roles: user.roles,
          isActive: user.isActive,
          isBlocked: user.isBlocked ?? false,
          phone: user.phone ?? null,
          address: user.address ?? null
        },
      });

      return new User(
        db.id,
        db.imageUrl ?? "",
        db.name,
        db.email,
        db.roles,
        db.phone ?? "",
        db.address ?? "",
        db.isActive,
        db.isBlocked
      );
    } catch (err) {
      console.error("Prisma User.create failed:", err);
      throw new Error("Failed to create user: " + (err as any).message);
    }
  }

  static async update(user: User): Promise<User> {
    const db = await prisma.user.update({
      where: { email: user.email },
      data: {
        name: user.name,
        roles: user.roles,
        imageUrl: user.imageUrl,
        phone: user.phone ?? null,
        address: user.address ?? null,
        isActive: user.isActive,
        isBlocked: user.isBlocked ?? false
      }
    });

    return new User(
      db.id,
      db.imageUrl ?? "",
      db.name,
      db.email,
      db.roles,
      db.phone ?? "",
      db.address ?? "",
      db.isActive,
      db.isBlocked
    );
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  static async verifyApiKey(email: string, apiKey: string): Promise<boolean> {
    if (email && apiKey) {
      const user: User | null = await this.findByEmail(email);
      if (user !== null) {
        return user.apiKey === apiKey;
      }
    }
    return false;
  }
}
