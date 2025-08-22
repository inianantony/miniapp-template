import express, { Request, Response } from "express";
import { UserActivityRequestFilter, UserActivityResponse } from "@miniapp-template/shared";
import { config } from "../config/app";

const router = express.Router();

interface CacheEntry {
  data: UserActivityResponse;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;
let externalApiToken: string | null = null;
let tokenExpiry: number | null = null;

async function getExternalApiToken(req: Request): Promise<string> {
  if (externalApiToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return externalApiToken;
  }

  const customToken = process.env.EXTERNAL_API_TOKEN;
  if (customToken) {
    console.log("🔐 Using external API token from environment");
    externalApiToken = customToken;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    return externalApiToken;
  }

  try {
    console.log("🔐 Fetching token from AuthService...");

    const response = await fetch(config.authServiceTokenEndpoint, {
      method: "GET",
      headers: { Cookie: req.headers.cookie || "", Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`AuthService token request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = (await response.json()) as { access_token: string; expires_in: number };

    externalApiToken = tokenData.access_token;
    tokenExpiry = Date.now() + tokenData.expires_in * 1000;

    console.log(`✅ Token fetched from AuthService, expires in ${tokenData} seconds`);

    return externalApiToken;
  } catch (error) {
    console.error("❌ Failed to fetch token from AuthService:", error);
    throw new Error("Failed to get authentication token from AuthService");
  }
}

async function fetchFromExternalApi(filter: UserActivityRequestFilter, req: Request): Promise<UserActivityResponse> {
  const baseUrl = process.env.EXTERNAL_USER_ACTIVITY_API;

  const queryParams = new URLSearchParams();
  if (filter.userName) queryParams.append("userName", filter.userName);
  if (filter.dateFrom) queryParams.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) queryParams.append("dateTo", filter.dateTo);
  if (filter.page !== undefined) queryParams.append("page", filter.page.toString());
  if (filter.pageSize !== undefined) queryParams.append("pageSize", filter.pageSize.toString());
  if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
  if (filter.sortDirection) queryParams.append("sortDirection", filter.sortDirection);

  const url = `${baseUrl}/api/UserActivity/Get?${queryParams.toString()}`;

  try {
    const token = await getExternalApiToken(req);

    console.log(`🌐 Fetching from external API: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(process.env.NODE_ENV === "development" && {
        rejectUnauthorized: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as UserActivityResponse;

    console.log(`✅ Fetched ${data.data.length} activities from external API`);

    return data;
  } catch (error) {
    console.error("❌ External API call failed:", error);
    throw new Error("Failed to fetch user activities from external service");
  }
}

function getCacheKey(filter: UserActivityRequestFilter): string {
  return JSON.stringify(filter);
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: UserActivityRequestFilter = {
      userName: req.query.userName as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 25,
      sortBy: (req.query.sortBy as string) || "id",
      sortDirection: (req.query.sortDirection as "asc" | "desc") || "desc",
    };

    const cacheKey = getCacheKey(filter);

    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      console.log("💾 Returning cached user activities");
      return res.json(cachedEntry.data);
    }

    const data = await fetchFromExternalApi(filter, req);

    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    });

    for (const [key, entry] of cache.entries()) {
      if (!isValidCacheEntry(entry)) {
        cache.delete(key);
      }
    }

    res.json(data);
  } catch (error) {
    console.error("Error in user activities endpoint:", error);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Failed to fetch user activities",
    });
  }
});

export default router;
