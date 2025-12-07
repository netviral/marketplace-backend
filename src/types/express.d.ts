// ============================================
// EXPRESS TYPE EXTENSIONS
// ============================================
// This file extends Express types to include custom properties
// and methods added by our middleware.

import { ApiResponse } from "../models/apiResponse.model.js";
import User from "../models/User.model.js";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      /**
       * Tenant ID for multi-tenancy support
       */
      tenantId?: string;

      /**
       * Authenticated user object
       * Populated by authentication middleware
       */
      user?: User;
    }

    interface Response {
      /**
       * Custom API response method
       * Sends a standardized JSON response using ApiResponse model
       * @param response - ApiResponse object containing status, message, and data
       * @returns Response object for chaining
       */
      api: <T>(response: ApiResponse<T>) => Response;
    }
  }
}

// Also extend express-serve-static-core for compatibility
declare module "express-serve-static-core" {
  interface Response {
    /**
     * Custom API response method
     * Sends a standardized JSON response using ApiResponse model
     * @param response - ApiResponse object containing status, message, and data
     * @returns Response object for chaining
     */
    api: <T>(response: ApiResponse<T>) => Response;
  }
}

// This export is required to make this file a module
export { };
