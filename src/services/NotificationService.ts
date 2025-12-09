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
                                    <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
                                        <h2 style="color:#063460;">Order Confirmation</h2>
                                        <p>Your order for <strong>${listing.name}</strong> (Total Qty: <strong>${totalQuantity}</strong>) has been placed.</p>
                                        <p><strong>Order IDs:</strong> ${orders.map(o => o.id).join(', ')}</p>
                                        <p><strong>Status:</strong> ${firstOrder.status}</p>
                                        <hr>
                                        <p>Thank you for shopping with Marketplace!</p>
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
                                            <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
                                                <h2 style="color:#063460;">New Orders Received</h2>
                                                <p>New orders have been placed for <strong>${listing.name}</strong>.</p>
                                                <p><strong>Total Quantity:</strong> ${totalQuantity}</p>
                                                <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                                                <p><strong>Order IDs:</strong> ${orders.map(o => o.id).join(', ')}</p>
                                                <hr>
                                                <p>Please process these orders promptly.</p>
                                            </div>
                                        `,
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
                                    <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
                                        <h2 style="color:#C4122F;">Order Cancelled</h2>
                                        <p>Your order for <strong>${listing.name}</strong> (ID: <strong>${order.id}</strong>) has been cancelled.</p>
                                        <hr>
                                        <p>If you have questions, reply to this email.</p>
                                    </div>
                                `,
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
                                            <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
                                                <h2 style="color:#C4122F;">Order Cancelled</h2>
                                                <p>Order for <strong>${listing.name}</strong> (Qty: <strong>${order.quantity}</strong>) was cancelled by ${user.name}.</p>
                                                <p><strong>Order ID:</strong> ${order.id}</p>
                                                <hr>
                                                <p>Check your dashboard for details.</p>
                                            </div>
                                        `,
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
                                            <div style="font-family:Arial,sans-serif;font-size:15px;color:#222;">
                                                <h2 style="color:#063460;">New Review Received</h2>
                                                <p>A new review was posted by <strong>${user.name}</strong>.</p>
                                                <p><strong>Rating:</strong> ${review.rating}/5</p>
                                                <p><strong>Comment:</strong> ${review.comments}</p>
                                                <hr>
                                                <p>View more details in your dashboard.</p>
                                            </div>
                                        `,
                                        alias: "Marketplace Reviews"
                                });
            }
        } catch (error) {
            console.error("Error sending review notification:", error);
        }
    }
}
