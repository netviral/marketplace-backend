import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import ENV from "../config/env.config.js";

const s3Client = new S3Client({
    region: ENV.AWS_REGION,
    credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY
    }
});

export class S3Service {

    /**
     * Uploads a base64 encoded image to S3
     * @param base64String - Format: "data:image/png;base64,..."
     * @param folder - Target folder ('listings' or 'vendors')
     * @returns Public URL of the uploaded image
     */
    static async uploadImage(base64String: string, folder: 'listings' | 'vendors'): Promise<string> {
        // If it's already a URL (e.g. from previous upload or external), return it
        if (typeof base64String !== 'string') return "";
        if (base64String.startsWith('http') || base64String.startsWith('https')) return base64String;

        // Valid Base64 Data URI check
        const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            // If it's pure base64 without prefix, we might fallback or throw.
            // For now, strict Data URI format.
            console.warn("Invalid base64 image string (missing prefix?), skipping upload.");
            return base64String; // Return original if unknown format
        }

        const type = matches[1]; // e.g. png, jpeg
        const data = matches[2] as string;
        const buffer = Buffer.from(data, 'base64');

        // Sanitize extension
        let extension = type;
        if (type === 'jpeg') extension = 'jpg';
        if (type === 'svg+xml') extension = 'svg';

        const filename = `${folder}/${uuidv4()}.${extension}`;

        try {
            const command = new PutObjectCommand({
                Bucket: ENV.AWS_S3_BUCKET,
                Key: filename,
                Body: buffer,
                ContentType: `image/${type}`,
                // ACL: 'public-read' // Optional, depends on bucket settings
            });

            await s3Client.send(command);

            return `https://${ENV.AWS_S3_BUCKET}.s3.${ENV.AWS_REGION}.amazonaws.com/${filename}`;
        } catch (error) {
            console.error("Error uploading to S3:", error);
            throw new Error("Failed to upload image to S3");
        }
    }

    /**
     * Helper to process an array of images
     */
    static async uploadImages(images: string[], folder: 'listings' | 'vendors'): Promise<string[]> {
        if (!images || !Array.isArray(images)) return [];

        const uploadPromises = images.map(img => this.uploadImage(img, folder));
        return Promise.all(uploadPromises);
    }
}
