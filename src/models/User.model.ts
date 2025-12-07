import ENV from "../config/env.config.js";
export default class User {
  private _id: string;
  private _name: string;
  private _email: string;
  private _imageUrl: string;
  private _roles: string[];
  private _isActive: boolean;
  private _isBlocked?: boolean;
  private _apiKey?: string;
  private _phone?: string;
  private _address?: string;

  constructor(
    id: string,
    imageUrl: string,
    name: string,
    email: string,
    roles: string[],
    phone: string = "",
    address: string = "",
    isActive: boolean | null = null,
    isBlocked: boolean = false
  ) {
    this._id = id;
    this._imageUrl = imageUrl;
    this._name = name;
    this._email = email;
    this._roles = roles;
    this._phone = phone;
    this._address = address;

    if (isActive !== null) {
      this._isActive = isActive;
    } else {
      // Check if email is allowed
      const domainAllowed = ENV.ALLOWED_DOMAINS.some(domain =>
        email.endsWith(`@${domain}`)
      );
      const inAllowedList = ENV.ALLOWED_LIST.includes(email);
      this._isActive = domainAllowed || inAllowedList;
    }

    this._isBlocked = isBlocked;
  }

  public get name() { return this._name; }
  public get email() { return this._email; }
  public get roles() { return this._roles; }
  public get isActive() { return this._isActive; }
  public get isBlocked() { return this._isBlocked; }
  public get apiKey() { return this._apiKey; }
  public get id() { return this._id; }
  public get imageUrl() { return this._imageUrl; }
  public get phone() { return this._phone; }
  public get address() { return this._address; }

  public hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  public isAdmin(): boolean {
    return this.hasRole("admin");
  }

  public isAshokaStudent(): boolean {
    return this.hasRole("student");
  }
}
