import { AuthToken } from '@shared/types/user';

export class TokenManager {
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<string> | null = null;

  private getTokenUrl(): string {
    // Use the backend auth endpoint that mimics /miniappsdev/auth/token
    return '/miniappsdev/myapp/api/auth/token';
  }

  async getToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.token;
    }

    // If we're already refreshing, wait for that promise
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.refreshToken();
    
    try {
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  private async refreshToken(): Promise<string> {
    try {
      console.log('🔄 Refreshing token...');
      
      const response = await fetch(this.getTokenUrl(), {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const tokenData: AuthToken = await response.json();
      
      this.token = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      console.log('✅ Token refreshed successfully, expires in', tokenData.expires_in, 'seconds');
      
      return this.token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearToken();
      throw error;
    }
  }

  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;
  }

  isTokenValid(): boolean {
    return this.token !== null && 
           this.tokenExpiry !== null && 
           Date.now() < this.tokenExpiry - 60000; // 1 minute buffer
  }

  getTokenInfo(): { token: string | null; expiresAt: Date | null } {
    return {
      token: this.token,
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry) : null
    };
  }

  // Decode JWT payload (for debugging/display purposes only)
  decodeToken(): any {
    if (!this.token) return null;
    
    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }
}

// Export a singleton instance
export const tokenManager = new TokenManager();