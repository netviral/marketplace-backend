import UserFactory from "../factories/UserFactory.js";
import UserRepository from "../repositories/UserRepository.js";
import User from "../models/User.model.js";

export default class UserService {

  static async getUserByEmail(email: string): Promise<User> {
    let user = await UserRepository.findByEmail(email);
    if (user) return user;

    const newUser = UserFactory.createNew("Ibrahim Khalil", email, ["user"]);
    return await UserRepository.create(newUser);
  }

  static async registerUser(name: string, email: string, roles: string[] = ["user"]): Promise<User> {
    const user = UserFactory.createNew(name, email, roles);
    console.log(user);
    return await UserRepository.create(user);
  }
}
