import nodemailer from "nodemailer";
import ENV from "./env.config.js";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("Email Transporter Error:", error);
    } else {
        // console.log("Server is ready to take our messages");
    }
});

export default transporter;
