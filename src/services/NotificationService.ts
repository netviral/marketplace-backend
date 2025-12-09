import { prisma } from "../config/database.config.js";
import { sendEmail } from "../utils/EmailUtil.js";

export class NotificationService {

    static async sendOrdersCreated(orderIds: string[]) {
        try {
            if (orderIds.length === 0) return;

            const orders = await prisma.order.findMany({
                where: { id: { in: orderIds } },
                include: {
                    listing: {
                        include: {
                            vendor: {
                                include: {
                                    owners: true,
                                    members: true
                                }
                            }
                        }
                    },
                    user: true
                }
            });

            if (orders.length === 0) return;

            // Assume all orders are for the same user and listing for this batch
            // (Since createOrder controller handles one listing at a time)
            const firstOrder = orders[0];
            if (!firstOrder) return;

            // Cast to any to avoid deep type inference issues with Prisma includes
            const { user, listing } = firstOrder as any;
            const { vendor } = listing;
            const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0);

            // Email to Customer
                        await sendEmail({
                                to: user.email,
                                subject: `Order Confirmation - ${listing.name}`,
                                html: `
                                    <div style="background:#f7f9fc;padding:30px;font-family:Arial,Helvetica,sans-serif;">
                                    <div style="
                                        max-width:520px;
                                        margin:0 auto;
                                        background:#ffffff;
                                        border-radius:12px;
                                        padding:24px 28px;
                                        box-shadow:0 2px 8px rgba(0,0,0,0.05);
                                        color:#2a2a2a;
                                        font-size:15px;
                                        line-height:1.6;
                                    ">
                                        
                                        <h2 style="color:#0b3c5d;margin-top:0;text-align:center;font-weight:600;">
                                            Order Confirmation
                                        </h2>

                                        <p style="margin:16px 0;">
                                            Hi <strong>${user.name || ""}</strong>,<br>
                                            Your order has been successfully placed!
                                        </p>

                                        <div style="
                                            background:#f1f5fb;
                                            padding:14px 18px;
                                            border-radius:10px;
                                            margin:20px 0;
                                        ">
                                            <p style="margin:0;">
                                                <strong>Item:</strong> ${listing.name}<br>
                                                <strong>Total Quantity:</strong> ${totalQuantity}<br>
                                                <strong>Status:</strong> ${firstOrder.status}
                                            </p>
                                        </div>

                                        <div style="margin:20px 0;">
                                            <strong>Order IDs:</strong><br>
                                            <span style="color:#3a3a3a;">
                                                ${orders.map(o => o.id).join(', ')}
                                            </span>
                                        </div>

                                        <hr style="border:none;border-top:1px solid #e3e9f0;margin:24px 0;">

                                        <p style="margin:0;text-align:center;color:#4a4a4a;">
                                            Thank you for shopping with <strong>Marketplace</strong>!  
                                        </p>

                                    </div>

                                    <p style="text-align:center;margin-top:16px;color:#9ba3b0;font-size:12px;">
                                        This is an automated message. Please do not reply.
                                    </p>
                                    </div>
                                    `,
                                alias: "Marketplace Orders"
                        });

            // Email to Vendor (Owners + Members)
            const recipients = [
                ...(vendor.owners || []).map((o: any) => o.email),
                ...(vendor.members || []).map((m: any) => m.email)
            ];
            // Unique emails
            const uniqueRecipients = [...new Set(recipients)];

            if (uniqueRecipients.length > 0) {
                                await sendEmail({
                                        to: uniqueRecipients,
                                        subject: `New Orders Received - ${listing.name}`,
                                        html: `
                                            <div style="background:#f7f9fc;padding:30px;font-family:Arial,Helvetica,sans-serif;">
                                            <div style="
                                                max-width:520px;
                                                margin:0 auto;
                                                background:#ffffff;
                                                border-radius:12px;
                                                padding:24px 28px;
                                                box-shadow:0 2px 8px rgba(0,0,0,0.05);
                                                color:#2a2a2a;
                                                font-size:15px;
                                                line-height:1.6;
                                            ">
                                                
                                                <h2 style="color:#0b3c5d;margin-top:0;text-align:center;font-weight:600;">
                                                    New Orders Received
                                                </h2>

                                                <p style="margin:16px 0;">
                                                    New orders have been placed for <strong>${listing.name}</strong>.
                                                </p>

                                                <div style="
                                                    background:#f1f5fb;
                                                    padding:14px 18px;
                                                    border-radius:10px;
                                                    margin:20px 0;
                                                ">
                                                    <p style="margin:0;">
                                                        <strong>Total Quantity:</strong> ${totalQuantity}<br>
                                                        <strong>Customer:</strong> ${user.name} (${user.email})
                                                    </p>
                                                </div>

                                                <div style="margin:20px 0;">
                                                    <strong>Order IDs:</strong><br>
                                                    <span style="color:#3a3a3a;">
                                                        ${orders.map(o => o.id).join(', ')}
                                                    </span>
                                                </div>

                                                <hr style="border:none;border-top:1px solid #e3e9f0;margin:24px 0;">

                                                <p style="margin:0;text-align:center;color:#4a4a4a;">
                                                    Please process these orders promptly.
                                                </p>

                                            </div>

                                            <p style="text-align:center;margin-top:16px;color:#9ba3b0;font-size:12px;">
                                                Automated system notification — no reply needed.
                                            </p>
                                            </div>
                                            `
                                            ,
                                        alias: "Marketplace System"
                                });
            }

        } catch (error) {
            console.error("Error sending orders created notifications:", error);
        }
    }

    static async sendOrderCancelled(orderId: string) {
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    listing: {
                        include: {
                            vendor: {
                                include: {
                                    owners: true,
                                    members: true
                                }
                            }
                        }
                    },
                    user: true
                }
            });

            if (!order) return;

            const { user, listing } = order;
            const { vendor } = listing;

            // Email to Customer
                        await sendEmail({
                                to: user.email,
                                subject: `Order Cancelled - ${listing.name}`,
                                html: `
                                    <div style="background:#f7f9fc;padding:30px;font-family:Arial,Helvetica,sans-serif;">
                                    <div style="
                                        max-width:520px;
                                        margin:0 auto;
                                        background:#ffffff;
                                        border-radius:12px;
                                        padding:24px 28px;
                                        box-shadow:0 2px 8px rgba(0,0,0,0.05);
                                        color:#2a2a2a;
                                        font-size:15px;
                                        line-height:1.6;
                                    ">

                                        <h2 style="color:#b3202f;margin-top:0;text-align:center;font-weight:600;">
                                            Order Cancelled
                                        </h2>

                                        <p style="margin:16px 0;">
                                            Your order for <strong>${listing.name}</strong> has been cancelled.
                                        </p>

                                        <div style="
                                            background:#f8e9ec;
                                            padding:14px 18px;
                                            border-radius:10px;
                                            margin:20px 0;
                                            color:#7a1b25;
                                        ">
                                            <p style="margin:0;">
                                                <strong>Order ID:</strong> ${order.id}
                                            </p>
                                        </div>

                                        <p style="margin:16px 0;">
                                            We're sorry this order couldn't be completed.  
                                            If you have any questions, feel free to reply to this email.
                                        </p>

                                        <hr style="border:none;border-top:1px solid #e3e9f0;margin:24px 0;">

                                        <p style="margin:0;text-align:center;color:#4a4a4a;">
                                            Thank you for using Marketplace.
                                        </p>

                                    </div>

                                    <p style="text-align:center;margin-top:16px;color:#9ba3b0;font-size:12px;">
                                        Automated system notification — no reply needed.
                                    </p>
                                    </div>
                                    `
,
                                alias: "Marketplace Orders"
                        });

            // Email to Vendor
            const recipients = [
                ...vendor.owners.map(o => o.email),
                ...vendor.members.map(m => m.email)
            ];
            const uniqueRecipients = [...new Set(recipients)];

            if (uniqueRecipients.length > 0) {
                                await sendEmail({
                                        to: uniqueRecipients,
                                        subject: `Order Cancelled - ${listing.name}`,
                                        html: `
                                            <div style="background:#f7f9fc;padding:30px;font-family:Arial,Helvetica,sans-serif;">
                                            <div style="
                                                max-width:520px;
                                                margin:0 auto;
                                                background:#ffffff;
                                                border-radius:12px;
                                                padding:24px 28px;
                                                box-shadow:0 2px 8px rgba(0,0,0,0.05);
                                                color:#2a2a2a;
                                                font-size:15px;
                                                line-height:1.6;
                                            ">

                                                <h2 style="color:#b3202f;margin-top:0;text-align:center;font-weight:600;">
                                                    Order Cancelled
                                                </h2>

                                                <p style="margin:16px 0;">
                                                    An order for <strong>${listing.name}</strong> has been cancelled by the buyer.
                                                </p>

                                                <div style="
                                                    background:#f8e9ec;
                                                    padding:14px 18px;
                                                    border-radius:10px;
                                                    margin:20px 0;
                                                    color:#7a1b25;
                                                ">
                                                    <p style="margin:0;">
                                                        <strong>Order ID:</strong> ${order.id}<br>
                                                        <strong>Quantity:</strong> ${order.quantity}<br>
                                                        <strong>Buyer:</strong> ${user.name}
                                                    </p>
                                                </div>

                                                <p style="margin:16px 0;">
                                                    You can review the full details on your seller dashboard.
                                                </p>

                                                <hr style="border:none;border-top:1px solid #e3e9f0;margin:24px 0;">

                                                <p style="margin:0;text-align:center;color:#4a4a4a;">
                                                    Marketplace System Notification
                                                </p>

                                            </div>

                                            <p style="text-align:center;margin-top:16px;color:#9ba3b0;font-size:12px;">
                                                This is an automated email.
                                            </p>
                                            </div>
                                            `
,
                                        alias: "Marketplace System"
                                });
            }

        } catch (error) {
            console.error("Error sending order cancelled notifications:", error);
        }
    }

    static async sendReviewSubmitted(reviewId: string) {
        try {
            const review = await prisma.review.findUnique({
                where: { id: reviewId },
                include: {
                    user: true,
                    listing: {
                        include: {
                            vendor: {
                                include: {
                                    owners: true,
                                    members: true
                                }
                            }
                        }
                    }
                }
            });

            if (!review) return;

            const { user, listing } = review;
            const { vendor } = listing;

            const recipients = [
                ...vendor.owners.map(o => o.email),
                ...vendor.members.map(m => m.email)
            ];
            const uniqueRecipients = [...new Set(recipients)];

            if (uniqueRecipients.length > 0) {
                                await sendEmail({
                                        to: uniqueRecipients,
                                        subject: `New Review for ${listing.name}`,
                                        html: `
                                            <div style="background:#f7f9fc;padding:30px;font-family:Arial,Helvetica,sans-serif;">
                                            <div style="
                                                max-width:520px;
                                                margin:0 auto;
                                                background:#ffffff;
                                                border-radius:12px;
                                                padding:24px 28px;
                                                box-shadow:0 2px 8px rgba(0,0,0,0.05);
                                                color:#2a2a2a;
                                                font-size:15px;
                                                line-height:1.6;
                                            ">

                                                <h2 style="color:#063460;margin-top:0;text-align:center;font-weight:600;">
                                                    New Review Received
                                                </h2>

                                                <p style="margin:16px 0;">
                                                    A new review has been submitted for <strong>${listing.name}</strong>.
                                                </p>

                                                <div style="
                                                    background:#e9f1f9;
                                                    padding:14px 18px;
                                                    border-radius:10px;
                                                    margin:20px 0;
                                                    color:#063460;
                                                ">
                                                    <p style="margin:0;">
                                                        <strong>Reviewer:</strong> ${user.name}<br>
                                                        <strong>Rating:</strong> ⭐ ${review.rating}/5
                                                    </p>
                                                </div>

                                                <div style="
                                                    background:#f3f6f9;
                                                    padding:14px 18px;
                                                    border-radius:10px;
                                                    margin:12px 0;
                                                    color:#3a3a3a;
                                                    font-style:italic;
                                                ">
                                                    <p style="margin:0;">"${review.comments}"</p>
                                                </div>

                                                <p style="margin:16px 0;">
                                                    Visit your dashboard to view and manage all reviews.
                                                </p>

                                                <hr style="border:none;border-top:1px solid #e3e9f0;margin:24px 0;">

                                                <p style="margin:0;text-align:center;color:#4a4a4a;">
                                                    Marketplace Reviews Notification
                                                </p>

                                            </div>

                                            <p style="text-align:center;margin-top:16px;color:#9ba3b0;font-size:12px;">
                                                This is an automated email.
                                            </p>
                                            </div>
                                            `
,
                                        alias: "Marketplace Reviews"
                                });
            }
        } catch (error) {
            console.error("Error sending review notification:", error);
        }
    }
}
