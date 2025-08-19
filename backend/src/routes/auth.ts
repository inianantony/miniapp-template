import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthToken } from '@miniapp-template/shared';
import { config } from '../config/app';

export const authRouter = Router();

// Mock user database (in production, this would come from Azure AD or similar)
const MOCK_USERS = [
  {
    id: 'user-123',
    email: 'developer@company.com',
    name: 'Development User',
    roles: ['user', 'developer']
  },
  {
    id: 'admin-456',
    email: 'admin@company.com', 
    name: 'Admin User',
    roles: ['user', 'admin']
  },
  {
    id: 'analyst-789',
    email: 'analyst@company.com',
    name: 'Business Analyst',
    roles: ['user', 'analyst']
  }
];

// Mock app permissions (mimics the permission files from the sample)
const APP_PERMISSIONS: Record<string, { allowed: string[]; denied: string[] }> = {
  'myapp': {
    allowed: [
      'developer@company.com',
      'admin@company.com',
      'analyst@company.com',
      '*@company.com' // Allow all company emails
    ],
    denied: []
  }
};

// Check if user has access to app (mimics checkUserAccess from sample)
function checkUserAccess(userEmail: string, appName: string): boolean {
  const permissions = APP_PERMISSIONS[appName];
  if (!permissions) return false;

  const email = userEmail.toLowerCase();

  // Check if explicitly denied
  if (permissions.denied?.includes(email)) {
    return false;
  }

  // Check if explicitly allowed
  if (permissions.allowed?.includes(email)) {
    return true;
  }

  // Check for wildcard access
  for (const pattern of permissions.allowed || []) {
    if (pattern === '*') {
      return true; // Allow all authenticated users
    }
    if (pattern.startsWith('*@') && email.endsWith(pattern.substring(1))) {
      return true; // Domain wildcard match
    }
  }

  return false;
}

// Mock token endpoint (simulates /miniappsdev/auth/token)
// This mimics the token generation from the sample auth service
authRouter.get('/token', (req: Request, res: Response) => {
  try {
    // In development, we simulate getting user info from headers or cookies
    // In production, this would validate an existing session/cookie
    
    // Get user from request (in real scenario, this comes from NGINX headers or session)
    const userEmail = req.headers['x-user-email'] || req.user?.email || 'developer@company.com';
    const mockUser = MOCK_USERS.find(u => u.email === userEmail) || MOCK_USERS[0];

    // Check if user has access to the app
    const appName = config.appName;
    const hasAccess = checkUserAccess(mockUser.email, appName);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: `User ${mockUser.email} does not have access to ${appName}`
      });
    }

    // Create JWT token (mimics the sample auth service JWT creation)
    const payload = {
      id: mockUser.id,
      email: mockUser.email.toLowerCase(),
      name: mockUser.name,
      roles: mockUser.roles,
      app: appName,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '1h',
      issuer: 'miniapp-auth-service',
      audience: appName
    });

    const tokenResponse: AuthToken = {
      access_token: token,
      expires_in: 3600, // 1 hour
      token_type: 'Bearer',
      scope: 'read write'
    };

    console.log(`🔐 Generated token for ${mockUser.email} (app: ${appName})`);
    
    res.json(tokenResponse);

  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({
      error: 'Token generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify token endpoint (for testing)
authRouter.post('/verify', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles,
        app: decoded.app
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid token'
    });
  }
});

// Mock userinfo endpoint (mimics Azure AD Graph API response)
authRouter.get('/userinfo', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token required' });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Return user info in Microsoft Graph API format
    res.json({
      id: decoded.id,
      mail: decoded.email,
      userPrincipalName: decoded.email,
      displayName: decoded.name,
      givenName: decoded.name.split(' ')[0],
      surname: decoded.name.split(' ').slice(1).join(' '),
      jobTitle: decoded.roles.includes('admin') ? 'Administrator' : 'User'
    });

  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Token verification failed'
    });
  }
});

// Mock logout endpoint
authRouter.post('/logout', (req: Request, res: Response) => {
  // In a real implementation, this would invalidate the token/session
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});