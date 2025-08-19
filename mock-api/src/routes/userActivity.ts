import express from 'express';

const router = express.Router();

interface UserActivity {
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

interface UserActivityRequestFilter {
  userName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

// Generate sample UserActivity data
const generateUserActivities = (count: number): UserActivity[] => {
  const users = ['john.doe', 'jane.smith', 'bob.wilson', 'alice.johnson', 'charlie.brown', 'diana.lee', 'eve.davis', 'frank.miller'];
  const controllers = ['Auth', 'User', 'Dashboard', 'Reports', 'Settings', 'Admin', 'Api', 'Files'];
  const actions = ['Login', 'Logout', 'View', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Search'];
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'IN'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  ];

  return Array.from({ length: count }, (_, i) => {
    const activityDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    return {
      id: i + 1,
      userName: users[Math.floor(Math.random() * users.length)],
      activityOn: activityDate.toISOString().split('T')[0], // Date only
      activityAt: activityDate.toISOString(), // Full datetime
      controller: controllers[Math.floor(Math.random() * controllers.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      requestParam: JSON.stringify({ 
        id: Math.floor(Math.random() * 1000),
        filter: Math.random() > 0.5 ? 'active' : 'all'
      }),
      activityIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      ipCountry: countries[Math.floor(Math.random() * countries.length)],
      tokenId: `tok_${Math.random().toString(36).substr(2, 16)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    };
  });
};

// Generate 500 sample records
const sampleUserActivities = generateUserActivities(500);

// Middleware to verify Bearer token
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Bearer token required' 
    });
  }

  const token = authHeader.substring(7);
  
  // For mock API, just check if token exists and is not empty
  if (!token || token.length < 10) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid bearer token' 
    });
  }

  next();
};

// GET /api/UserActivity/Get
router.get('/Get', verifyToken, (req, res) => {
  try {
    const filter: UserActivityRequestFilter = {
      userName: req.query.userName as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 100,
      sortBy: req.query.sortBy as string || 'id',
      sortDirection: req.query.sortDirection as string || 'desc',
    };

    let filteredData = [...sampleUserActivities];

    // Apply userName filter
    if (filter.userName) {
      filteredData = filteredData.filter(activity => 
        activity.userName.toLowerCase().includes(filter.userName!.toLowerCase())
      );
    }

    // Apply date range filter
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom);
      filteredData = filteredData.filter(activity => 
        new Date(activity.activityAt) >= fromDate
      );
    }

    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredData = filteredData.filter(activity => 
        new Date(activity.activityAt) <= toDate
      );
    }

    // Apply sorting
    if (filter.sortBy) {
      const sortKey = filter.sortBy.toLowerCase();
      const direction = filter.sortDirection?.toLowerCase() === 'asc' ? 1 : -1;
      
      filteredData.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortKey) {
          case 'id':
            aVal = a.id;
            bVal = b.id;
            break;
          case 'username':
            aVal = a.userName.toLowerCase();
            bVal = b.userName.toLowerCase();
            break;
          case 'activityon':
            aVal = new Date(a.activityOn);
            bVal = new Date(b.activityOn);
            break;
          case 'activityat':
            aVal = new Date(a.activityAt);
            bVal = new Date(b.activityAt);
            break;
          case 'controller':
            aVal = a.controller.toLowerCase();
            bVal = b.controller.toLowerCase();
            break;
          case 'action':
            aVal = a.action.toLowerCase();
            bVal = b.action.toLowerCase();
            break;
          case 'ipcountry':
            aVal = a.ipCountry.toLowerCase();
            bVal = b.ipCountry.toLowerCase();
            break;
          default:
            aVal = a.id;
            bVal = b.id;
        }

        if (aVal < bVal) return -1 * direction;
        if (aVal > bVal) return 1 * direction;
        return 0;
      });
    }

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / filter.pageSize!);

    // Apply pagination
    const startIndex = (filter.page! - 1) * filter.pageSize!;
    const endIndex = startIndex + filter.pageSize!;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Simulate network delay
    setTimeout(() => {
      res.json({
        data: paginatedData,
        totalCount,
        page: filter.page,
        pageSize: filter.pageSize,
        totalPages
      });
    }, Math.random() * 300 + 100); // 100-400ms delay

  } catch (error) {
    console.error('Error in UserActivity/Get:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to fetch user activities' 
    });
  }
});

export default router;