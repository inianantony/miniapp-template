export interface UserActivity {
  id: number;
  userName: string;
  activityOn: string;
  activityAt: string;
  controller: string;
  action: string;
  requestParam: string;
  activityIp: string;
  ipCountry: string;
  tokenId: string;
  userAgent: string;
}

export interface UserActivityRequestFilter {
  userName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UserActivityResponse {
  data: UserActivity[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}