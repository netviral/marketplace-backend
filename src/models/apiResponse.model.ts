export interface APIResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
  error: string | null;
}

export class ApiResponse<T = unknown> implements APIResponse<T> {
  constructor(
    public success: boolean,
    public code: number,
    public message: string,
    public data: T | null,
    public error: string | null
  ) {}
  
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
    error: string = "ERROR",
  ): ApiResponse<null> {
    return new ApiResponse<null>(false, code, message, null, error);
  }
}
