import { UserActivityRequestFilter, UserActivityResponse } from "@miniapp-template/shared";

export class UserActivityService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE;
  }

  async getUserActivities(filter: UserActivityRequestFilter): Promise<UserActivityResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.userName) queryParams.append("userName", filter.userName);
      if (filter.dateFrom) queryParams.append("dateFrom", filter.dateFrom);
      if (filter.dateTo) queryParams.append("dateTo", filter.dateTo);
      if (filter.page !== undefined) queryParams.append("page", filter.page.toString());
      if (filter.pageSize !== undefined) queryParams.append("pageSize", filter.pageSize.toString());
      if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter.sortDirection) queryParams.append("sortDirection", filter.sortDirection);

      const url = `${this.baseUrl}/user-activities?${queryParams.toString()}`;

      console.log("🌐 Fetching user activities from backend:", url);

      const response = await fetch(url, { method: "GET", credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json" } });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
      }

      const result: UserActivityResponse = await response.json();

      return result;
    } catch (error) {
      console.error("❌ Error fetching user activities from backend:", error);
      throw error;
    }
  }
}
