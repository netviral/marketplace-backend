import User from "../models/User.model.js";
import IdUtil from "../utils/IdUtil.js";

export default class UserFactory {
  static createNew(name: string, email: string, imageUrl: string, roles: string[] = ["user"]) {
    return new User(IdUtil.generateUUID(), imageUrl, name, email, roles);
  }
}
