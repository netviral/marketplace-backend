export default class IdUtil {
    static generateUUID(): string {
        // Node 18+ has crypto.randomUUID built-in
        return crypto.randomUUID();
    }
}