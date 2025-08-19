import {
  UserActivityRequestFilter,
  UserActivityResponse,
} from "@shared/types/userActivity";
import { TokenManager } from "./TokenManager";

export class UserActivityService {
  private tokenManager: TokenManager;
  private baseUrl: string;

  constructor() {
    this.tokenManager = new TokenManager();

    // Environment variable to switch between mock and real API
    this.baseUrl =
      import.meta.env.VITE_USER_ACTIVITY_API_BASE || "http://localhost:3001";

    console.log("UserActivityService base URL:", this.baseUrl);
    console.log(import.meta.env.VITE_USER_ACTIVITY_API_BASE);

    console.log("UserActivityService initialized with base URL:", this.baseUrl);
  }

  /**
   * Get authentication token - either from TokenManager or custom env variable
   */
  private async getAuthToken(): Promise<string> {
    // If custom token is provided via environment variable, use it

    console.log("UserActivityService base URL:", this.baseUrl);
    console.log(import.meta.env.VITE_USER_ACTIVITY_API_BASE);

    const customToken = import.meta.env.VITE_CUSTOM_AUTH_TOKEN;
    if (customToken) {
      console.log("Using custom auth token from environment variable");
      return customToken;
    }

    // Otherwise, get token from TokenManager
    return await this.tokenManager.getToken();
  }

  /**
   * Fetch user activities with filtering, sorting, and pagination
   */
  async getUserActivities(
    filter: UserActivityRequestFilter
  ): Promise<UserActivityResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      console.log("Using custom auth token from environment variable");

      if (filter.userName) queryParams.append("userName", filter.userName);
      if (filter.dateFrom) queryParams.append("dateFrom", filter.dateFrom);
      if (filter.dateTo) queryParams.append("dateTo", filter.dateTo);
      if (filter.page !== undefined)
        queryParams.append("page", filter.page.toString());
      if (filter.pageSize !== undefined)
        queryParams.append("pageSize", filter.pageSize.toString());
      if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter.sortDirection)
        queryParams.append("sortDirection", filter.sortDirection);

      // Get Bearer token
      const token = await this.getAuthToken();

      const url = `${
        this.baseUrl
      }/api/UserActivity/Get?${queryParams.toString()}`;

      console.log("Fetching user activities:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthorized: Please check your authentication token"
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UserActivityResponse = await response.json();

      console.log("User activities fetched:", {
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
        dataLength: result.data.length,
      });

      return result;
    } catch (error) {
      console.error("Error fetching user activities:", error);
      throw error;
    }
  }

  /**
   * Get current API configuration
   */
  getApiConfig() {
    return {
      baseUrl: this.baseUrl,
      isUsingMockApi: this.baseUrl.includes("localhost:3001"),
    };
  }
}
