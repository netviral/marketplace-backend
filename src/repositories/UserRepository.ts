import { prisma } from "../prisma.config.js";
import User from "../models/User.model.js";

export default class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const db = await prisma.user.findUnique({ where: { email } });
    if (!db) return null;

    return new User(db.id, db.imageUrl ?? "", db.name, db.email, db.roles);
  }


  static async update(user: User): Promise<User> {
    const db = await prisma.user.update({
      where: { email: user.email },
      data: {
        name: user.name,
        roles: user.roles,
      }
    });
    return user;
  }
  
  static async verifyApiKey(email: string, apiKey:string): Promise<boolean> {
    if(email && apiKey) {
      const user: User | null = await this.findByEmail(email);
      if(user !== null) {
        return user["apiKey"] === apiKey;
      }
    }
    return false;
  }
}
