export default class User {
    private _id: string;
    private _name: string;
    private _email: string;
    private _imageUrl: string;
    private _roles: string[];
    private _isActive? : boolean;
    private _isBlocked? : boolean;
    private _apiKey? : string;

    constructor(id: string, imageUrl:string, name: string, email: string, roles: string[]) {
        this._id = id;
        this._imageUrl = imageUrl;
        this._name = name;
        this._email = email;
        this._roles = roles;
    }

    public get name() { return this._name; }
    public get email() { return this._email; }
    public get roles() { return this._roles; }
    public get isActive() { return this._isActive; }
    public get isBlocked() { return this._isBlocked; }
    public get apiKey() { return this._apiKey; }
    public get id() { return this._id; }
    public get imageUrl() { return this._imageUrl; }
    
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
