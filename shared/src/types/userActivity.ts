export interface UserActivity {
  Id: number;
  UserName: string;
  ActivityOn: string;
  ActivityAt: string;
  Controller: string;
  Action: string;
  RequestParam: string;
  ActivityIp: string;
  IpCountry: string;
  TokenId: string;
  UserAgnet: string;
}

export interface UserActivityRequestFilter {
  userName?: string;
  controller?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface UserActivityResponse {
  data: UserActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
