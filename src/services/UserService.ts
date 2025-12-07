import UserFactory from "../factories/UserFactory.js";
import UserRepository from "../repositories/UserRepository.js";
import User from "../models/User.model.js";

export default class UserService {

  static async getUserByEmail(email: string): Promise<User | null> {
    let user = await UserRepository.findByEmail(email);
    if (user) {
      return user;
    }
    return null;
  }

  static async registerUser(name: string, email: string, imageUrl: string, roles: string[] = ["user"]): Promise<User> {
    const user = UserFactory.createNew(name, email, imageUrl, roles);
    await UserRepository.create(user);
    return user;
  }

  static async updateUser(name: string, email: string, imageUrl: string, roles: string[] = ["user"]): Promise<User | null> {
    const user = await UserRepository.findByEmail(email);
    if (user !== null) {
      // Preserve existing phone/address/active/blocked status
      await UserRepository.update(new User(
        user.id,
        imageUrl,
        name,
        user.email,
        roles,
        user.phone,
        user.address,
        user.isActive,
        user.isBlocked
      ));
      return user;
    }
    return null;
  }

  static async verifyApiKey(email: string, apiKey: string): Promise<User | null> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isApiKeyValid = await UserRepository.verifyApiKey(email, apiKey);
    if (!isApiKeyValid) {
      return null;
    }

    return user;
  }

  static async getUserById(id: string): Promise<User | null> {
    return await UserRepository.findById(id);
  }

  static async deleteUser(id: string): Promise<void> {
    await UserRepository.delete(id);
  }

  static async updateUserProfile(id: string, data: { name?: string, phone?: string, address?: string, imageUrl?: string }): Promise<User | null> {
    const user = await UserRepository.findById(id);
    if (!user) return null;

    const name = data.name !== undefined ? data.name : user.name;
    const phone = data.phone !== undefined ? data.phone : user.phone;
    const address = data.address !== undefined ? data.address : user.address;
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl : user.imageUrl;

    // Preserve core fields including active/blocked
    const updatedUser = new User(
      user.id,
      imageUrl || "",
      name,
      user.email,
      user.roles,
      phone || "",
      address || "",
      user.isActive,
      user.isBlocked
    );
    return await UserRepository.update(updatedUser);
  }

  static async updateUserByAdmin(id: string, data: { name?: string, roles?: string[], isActive?: boolean, isBlocked?: boolean }): Promise<User | null> {
    const user = await UserRepository.findById(id);
    if (!user) return null;

    const name = data.name !== undefined ? data.name : user.name;
    const roles = data.roles !== undefined ? data.roles : user.roles;
    const isActive = data.isActive !== undefined ? data.isActive : user.isActive;
    const isBlocked = data.isBlocked !== undefined ? data.isBlocked : user.isBlocked;

    // Admin can update roles, name, status, blocked. Preserve phone/address/image/email.
    const updatedUser = new User(
      user.id,
      user.imageUrl,
      name,
      user.email,
      roles,
      user.phone,
      user.address,
      isActive,
      isBlocked
    );
    return await UserRepository.update(updatedUser);
  }
}
