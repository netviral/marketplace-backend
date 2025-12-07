import UserFactory from "../factories/UserFactory.js";
import UserRepository from "../repositories/UserRepository.js";
import User from "../models/User.model.js";

export default class UserService {

  static async getUserByEmail(email: string): Promise<User | null> {
    let user = await UserRepository.findByEmail(email);
    if (user){
      return user;
    } 
    return null;
  }

  static async registerUser(name: string, email:string, imageUrl: string, roles: string[] = ["user"]): Promise<User> {
    const user = UserFactory.createNew(name, email, imageUrl,roles);
    await UserRepository.create(user);
    return user;
  }

  static async updateUser(name: string, email:string, imageUrl: string, roles: string[] = ["user"]): Promise<User | null> {
    const user = await UserRepository.findByEmail(email);
    if(user !== null) {
      await UserRepository.update(new User(user.id, name, user.email, imageUrl, roles));
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
}
