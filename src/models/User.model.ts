import BaseModel from "./Base.model.js";

export default class User extends BaseModel {
    private _name: string;
    private _email: string;
    private _roles: string[];
    private _isActive? : boolean;
    private _isBlocked? : boolean;

    constructor(id: string, name: string, email: string, roles: string[]) {
        super(id);
        this._name = name;
        this._email = email;
        this._roles = roles;
    }

    get name() { return this._name; }
    get email() { return this._email; }
    get roles() { return this._roles; }
    get isActive() { return this._isActive; }
    get isBlocked() { return this._isBlocked; }

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
