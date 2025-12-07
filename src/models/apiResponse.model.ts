export interface APIResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
  error: any;
}

export class ApiResponse<T = unknown> implements APIResponse<T> {
  constructor(
    public success: boolean,
    public code: number,
    public message: string,
    public data: T | null,
    public error: any
  ) { }

  /** Success response (data required) */
  static success<T>(
    code: number = 200,
    message: string = "Success",
    data: T,
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, code, message, data, null);
  }

  /** Error response (error message required) */
  static error(
    code: number = 400,
    message: string,
    error: string | Error | unknown = "ERROR",
  ): ApiResponse<any> {
    let errorDetail: any = error;

    // If it's an Error object, we might want to expose details in non-production
    if (error instanceof Error) {
      if (process.env.NODE_ENV !== 'production') {
        errorDetail = {
          message: error.message,
          name: error.name,
          stack: error.stack
        };
      } else {
        // In production, keep it generic unless it's a known safe error
        errorDetail = "Internal Server Error";
      }
    }

    return new ApiResponse<any>(false, code, message, null, errorDetail);
  }
}
