# 📘 Marketplace Backend Documentation

This documentation provides a comprehensive overview of the Marketplace Backend, including its architecture, API routes, authentication methods, and project structure.

---

## 🏗 Repository Structure

The project follows a **modular architecture** designed for scalability and maintainability.

```
src/
├── config/                 # Configuration files (DB, Env, Passport)
│   ├── database.config.ts  # Prisma client interface
│   └── env.config.ts       # Environment variable validation (Zod)
│
├── controllers/            # Business Logic (Modularized)
│   ├── vendors/            # Vendor operations (create, read, update, delete)
│   ├── listings/           # Listing operations
│   └── orders/             # Order operations
│
├── middlewares/            # Custom Middlewares
│   ├── auth.middleware.ts  # Authentication checks
│   ├── role.middleware.ts  # Role-based access control
│   └── ...                 # Validation & utility middlewares
│
├── models/                 # Data Models & Interfaces
│
├── routes/                 # API Routes (Request Handling)
│   ├── index.ts            # Main router mounting
│   ├── auth/               # Authentication routes
│   ├── vendors/            # Vendor + Nested resources
│   ├── listings/           # Public listing access
│   ├── orders/             # User order management
│   └── users/              # User profile management
│
└── services/               # Shared Services (JWT, etc.)
```

---

## 🔐 Authentication

 The application supports **JWT-based authentication** with support for browser cookies and direct API usage.
 **Note on Global Authentication**: The application enforces `isCookieAuthenticated` middleware globally on the root API router. This means **all** routes documented below (except Auth initialization) require a valid authentication cookie to be accessed, effectively making "Public" routes accessible only to logged-in users.

### **Methods**
1.  **Direct API (Bearer Token)**:
    *   Header: `Authorization: Bearer <access_token>`
    *   Used for mobile apps or external clients.
2.  **Browser (Cookies)**:
    *   HttpOnly Cookies: `accessToken`, `refreshToken`
    *   Used for web frontend.
3.  **Google OAuth**:
    *   Initiate: `GET /auth/browser/google`
    *   Callback: `GET /auth/browser/google/callback`

### **Tokens**
*   **Access Token**: Short-lived (e.g., 15m). Used for authentication.
*   **Refresh Token**: Long-lived (e.g., 7d). Used to generate new access tokens.

---

## 📡 API Routes & Operations

### **1. Vendors (`/vendors`)**
Base URL: `/api/vendors` (or `/vendors` depending on mount)

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **POST** | `/vendors/me` | User | Create a new vendor (User becomes owner) |
| **GET** | `/vendors/me` | User | Get all vendors owned by current user |
| **GET** | `/vendors/me/:id` | Owner | Get specific owned vendor details |
| **PUT** | `/vendors/me/:id` | Owner | Update vendor details |
| **DELETE** | `/vendors/me/:id` | Owner | Delete a vendor |
| **GET** | `/vendors` | Registered | List vendors (Supports `page`, `limit`, `sort`, `search`, `isVerified`) |
| **GET** | `/vendors/:id` | Registered | Get vendor profile |
| **POST** | `/vendors/:id/verify` | Admin | **Admin**: Verify a vendor |

#### **Nested: Vendor Listings**
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **POST** | `/vendors/:vendorId/listings` | Vendor | Create a listing under a vendor |
| **GET** | `/vendors/:vendorId/listings` | Registered | Get all listings for a specific vendor |
| **PUT** | `/vendors/:vendorId/listings/:id` | Vendor | Update a listing |
| **DELETE** | `/vendors/:vendorId/listings/:id` | Vendor | Delete a listing |

#### **Nested: Vendor Orders**
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **GET** | `/vendors/:vendorId/orders` | Vendor | View orders received by this vendor |
| **GET** | `/vendors/:vendorId/orders/:id` | Vendor | View specific order details |
| **GET** | `/vendors/:vendorId/orders/stats` | Vendor | Get order statistics (counts by status) |
| **PUT** | `/vendors/:vendorId/orders/:id` | Vendor | Update order status (`CONFIRMED`, `DELIVERED`, etc.) |

---

### **2. Listings (`/listings`)**
Base URL: `/api/listings`

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **GET** | `/listings` | Registered | Get all listings. **Advanced params**: `page`, `limit`, `sort`, `search`, `tags`, `type`, `vendorId`. |
| **GET** | `/listings/:id` | Registered | Get listing details |
| **POST** | `/listings` | Vendor | Create a listing (Must provide `vendorId` in body) |
| **PUT** | `/listings/:id` | Vendor Owner | Update a listing (User must own the vendor) |
| **DELETE** | `/listings/:id` | Vendor Owner | Delete a listing (User must own the vendor) |

---

### **3. Orders (`/orders`)**
Base URL: `/api/orders` - **User Order Management**

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **POST** | `/orders/me` | User | Create a new order (Purchase item) |
| **GET** | `/orders/me` | User | View my purchase history |
| **GET** | `/orders/me/:id` | User | View details of a purchase |
| **GET** | `/orders/me/stats` | User | View my buying statistics |
| **PUT** | `/orders/me/:id` | User | Cancel a pending order or update notes |
| **DELETE** | `/orders/:id` | Admin | **Admin**: Permanently delete an order |

---

### **4. Users (`/users`)**
Base URL: `/api/users`

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **GET** | `/users/me` | User | Get my user profile |
| **PUT** | `/users/me` | User | Update my user profile |
| **GET** | `/users/:id` | Registered | Get public user profile |

---

### **5. Wishlist (`/wishlist`)**
Base URL: `/api/wishlist`

| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| **GET** | `/wishlist/me` | User | Get my wishlist items (Supports pagination/search) |
| **POST** | `/wishlist/:listingId` | User | Add listing to wishlist |
| **DELETE** | `/wishlist/:listingId` | User | Remove listing from wishlist |

---

## 🕹 Controllers

Controllers are **modularized** to prevent large files and separate concerns.

**Structure Example (`controllers/vendors/`)**:
*   `index.ts`: Exports all functions from sub-files.
*   `create.ts`: Handles `createVendor` logic.
*   `read.ts`: Handles `getVendor`, `getAllVendors`, etc.
*   `update.ts`: Handles `updateVendor` logic.
*   `delete.ts`: Handles `deleteVendor` logic.
*   `special.ts`: Handles special actions like `verifyVendor`.

This pattern allows for easy navigation and focuses on specific CRUD operations within separate files.

---

## 🛡 Middlewares

Used to protect routes and ensure data integrity.

| Middleware | File | Purpose |
|:---|:---|:---|
| `AuthMiddleware` | `auth.middleware.ts` | Checks if user is logged in (session/token). |
| `RoleMiddleware` | `role.middleware.ts` | Checks if user has specific roles (e.g., ADMIN). |
| `checkVendorOwnership` | `vendorOwnership.middleware.ts` | Ensures user owns the targeted vendor. |
| `checkVendorAccess` | `vendorAccess.middleware.ts` | Ensures user is Owner OR Member of vendor. |
| `responseMiddleware` | `response.middleware.ts` | Adds `res.api()` helper for consistent responses. |
| `googleRedirect` | `googleRedirect.middleware.ts` | Handles Google OAuth redirect validation. |

---

## 📦 Data Models (Prisma)

Key entities in the system:
*   **User**: Registered users.
*   **Vendor**: Stores owned by users.
*   **Listing**: Products or Services sold by vendors.
*   **Order**: Transactions between users and listings.
*   **Tag**: Categories for listings.

---

## 🛠 Development Guidelines

1.  **Type Safety**: Always use TypeScript types. Triple-slash references `/// <reference path="..." />` are used to load global Express extensions.
2.  **Response Format**: Use `res.api(ApiResponse.success(...))` or `res.api(ApiResponse.error(...))` for all responses.
3.  **Path Aliases**: Currently using relative paths, but mapped to modular structures.
