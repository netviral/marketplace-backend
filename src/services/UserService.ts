import UserFactory from "../factories/UserFactory.js";
import UserRepository from "../repositories/UserRepository.js";
import User from "../models/User.model.js";

export default class UserService {

  static async getUserByEmail(email: string): Promise<User> {
    let user = await UserRepository.findByEmail(email);
    if (user){
      return user;
    } else {
      return UserFactory.createNew("","",email, ["user"]);
    }
  }

  static async registerUser(name: string, imageUrl: string, email: string, roles: string[] = ["user"]): Promise<User> {
    const user = UserFactory.createNew(name, imageUrl, email, roles);
    return user;
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
