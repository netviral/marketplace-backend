// src/models/BaseModel.ts

export default abstract class BaseModel {
    public readonly id: string;
    public readonly createdAt: Date;
    public updatedAt?: Date;
    public version:number = 1;

    constructor(id: string) {
        this.id = id;
        const rightNow = new Date();
        this.createdAt = rightNow;
        this.updatedAt = rightNow;
    }

    public touch(): void {
        this.updatedAt = new Date();
        this.version += 1;
    }

    public toJSON(): object {
        // Generic serialization (can be overridden in child classes)
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
