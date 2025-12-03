import BaseModel from "./Base.model.js";

export default class Vendor extends BaseModel {
    private _name: string;
    private _description: string;
    private _contactEmail: string;
    private _contactPhone: string;
    private _isActive: boolean = true;
    private _isVerified: boolean = false;     // for admin approval
    private _categories: string[];            // e.g. ["food", "services"]

    constructor(
        id: string,
        name: string,
        description: string,
        contactEmail: string,
        contactPhone: string,
        categories: string[] = []
    ) {
        super(id);
        this._name = name;
        this._description = description;
        this._contactEmail = contactEmail;
        this._contactPhone = contactPhone;
        this._categories = categories;
    }


    get name() { return this._name; }
    get description() { return this._description; }
    get contactEmail() { return this._contactEmail; }
    get contactPhone() { return this._contactPhone; }
    get isActive() { return this._isActive; }
    get isVerified() { return this._isVerified; }
    get categories() { return [...this._categories]; }


    public deactivate() {
        this._isActive = false;
    }

    public activate() {
        this._isActive = true;
    }

    public verifyVendor() {
        this._isVerified = true;
    }

    public unverifyVendor() {
        this._isVerified = false;
    }

    public addCategory(category: string) {
        if (!this._categories.includes(category)) {
            this._categories.push(category);
        }
    }

    public removeCategory(category: string) {
        this._categories = this._categories.filter(c => c !== category);
    }

    public updateDescription(newDesc: string) {
        if (newDesc.length < 10) {
            throw new Error("Description too short");
        }
        this._description = newDesc;
    }

    public updateContact(phone: string, email: string) {
        this._contactPhone = phone;
        this._contactEmail = email;
    }
}
