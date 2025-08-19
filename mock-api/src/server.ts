import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userActivityRoutes from './routes/userActivity';

const app = express();
const PORT = process.env.MOCK_API_PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/UserActivity', userActivityRoutes);

// Mock delay to simulate network latency
const mockDelay = parseInt(process.env.MOCK_API_DELAY || '200');
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock company API endpoints
app.get('/dashboard/widgets', async (req, res) => {
  await delay(mockDelay);
  res.json({
    success: true,
    data: [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: '$45,231.89',
        change: { value: 20.1, direction: 'up', period: 'vs last month' },
        type: 'kpi'
      },
      {
        id: 'users',
        title: 'Active Users',
        value: '2,350',
        change: { value: 180.1, direction: 'up', period: 'vs last month' },
        type: 'kpi'
      },
      {
        id: 'sales-chart',
        title: 'Sales Trend',
        type: 'chart',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sales',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        }
      }
    ]
  });
});

app.get('/metrics/sales', async (req, res) => {
  await delay(mockDelay);
  res.json({
    success: true,
    data: {
      totalSales: 156789,
      salesGrowth: 12.5,
      topProducts: [
        { name: 'Product A', sales: 45000 },
        { name: 'Product B', sales: 38000 },
        { name: 'Product C', sales: 32000 }
      ],
      monthlySales: [
        { month: 'Jan', sales: 23000 },
        { month: 'Feb', sales: 28000 },
        { month: 'Mar', sales: 31000 },
        { month: 'Apr', sales: 35000 },
        { month: 'May', sales: 39000 },
        { month: 'Jun', sales: 42000 }
      ]
    }
  });
});

app.get('/reports/inventory', async (req, res) => {
  await delay(mockDelay);
  res.json({
    success: true,
    data: {
      totalItems: 1248,
      lowStock: 23,
      outOfStock: 5,
      categories: [
        { name: 'Electronics', count: 450, value: 125000 },
        { name: 'Clothing', count: 320, value: 85000 },
        { name: 'Home & Garden', count: 280, value: 65000 },
        { name: 'Books', count: 198, value: 15000 }
      ]
    }
  });
});

app.get('/analytics/trends', async (req, res) => {
  await delay(mockDelay);
  res.json({
    success: true,
    data: {
      pageViews: {
        current: 145892,
        previous: 128634,
        change: 13.4
      },
      bounceRate: {
        current: 24.5,
        previous: 28.2,
        change: -3.7
      },
      avgSessionDuration: {
        current: '00:03:24',
        previous: '00:02:58',
        change: 14.7
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mock Company API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Company API running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /api/UserActivity/Get`);
  console.log(`   GET /dashboard/widgets`);
  console.log(`   GET /metrics/sales`);
  console.log(`   GET /reports/inventory`);
  console.log(`   GET /analytics/trends`);
  console.log(`   GET /health`);
});

export default app;