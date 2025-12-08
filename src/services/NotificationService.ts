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
                text: `Your order for ${listing.name} (Total Qty: ${totalQuantity}) has been placed.\nOrder IDs: ${orders.map(o => o.id).join(', ')}\nStatus: ${firstOrder.status}.`,
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
                    text: `New orders have been placed for ${listing.name}.\nTotal Quantity: ${totalQuantity}\nCustomer: ${user.name} (${user.email})\nOrder IDs: ${orders.map(o => o.id).join(', ')}`,
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
                text: `Your order for ${listing.name} (ID: ${order.id}) has been cancelled.`,
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
                    text: `Order for ${listing.name} (Qty: ${order.quantity}) was cancelled by ${user.name}.\nOrder ID: ${order.id}`,
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
                    text: `A new review was posted by ${user.name}.\nRating: ${review.rating}/5\nComment: ${review.comments}`,
                    alias: "Marketplace Reviews"
                });
            }
        } catch (error) {
            console.error("Error sending review notification:", error);
        }
    }
}
