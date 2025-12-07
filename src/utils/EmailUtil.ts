import transporter from "../config/email.config.js";
import ENV from "../config/env.config.js";

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    alias?: string; // Custom sender name alias
}

/**
 * Sends an email using the configured Nodemailer transporter.
 * @param options - Email options including recipient, subject, body, and sender alias.
 * @returns Promise<boolean> - True if sent successfully, false otherwise.
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
        const senderName = options.alias || "Marketplace Support";
        const senderEmail = ENV.SMTP_USER;

        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`, // "Alias <email@example.com>"
            to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
            subject: options.subject,
            text: options.text, // plain text body
            html: options.html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};
