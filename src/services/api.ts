import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debug: Log the API base URL to verify it's correct
console.log('API Base URL:', API_BASE_URL);
console.log('VITE_API_URL env var:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenquest_token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Debug: Log the full URL being requested
  const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
  console.log('API Request:', config.method?.toUpperCase(), fullUrl);
  return config;
});

export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  login: async (username: string, password: string, role: 'user' | 'admin') => {
    const response = await api.post('/login', { username, password, role });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
  assignPoints: async (phone: string, wasteType: string, weight: number) => {
    const response = await api.post('/assign-points', { phone, wasteType, weight });
    return response.data;
  },
    addGamePoints: async (pointsToAdd: number, gameName: string) => {
    const response = await api.post('/users/add-game-points', { pointsToAdd, gameName });
    return response.data;
  }
};


// --- THIS IS THE CORRECT, UNCOMMENTED REWARDAPI OBJECT ---
export const rewardAPI = {
  getRewards: async () => {
    const response = await api.get('/rewards');
    return response.data;
  },
redeemReward: async (rewardId: string) => {
  // Log the ID to the browser console
  console.log('Attempting to redeem reward with ID:', rewardId); 
  
  const response = await api.post('/rewards/redeem', { rewardId });
  return response.data;
}
};
export const leaderboardAPI = {
    getLeaderboard: async () => {
        const response = await api.get('/leaderboard');
        return response.data;
    }
};

export const pickupAPI = {
  schedulePickup: async (pickupData: any) => {
    const response = await api.post('/pickups', pickupData);
    return response.data;
  },
  getUserPickups: async () => {
    const response = await api.get('/pickups/my-pickups');
    return response.data;
  },
  getWeightPickups: async () => {
    const response = await api.get('/pickups/my-weights');
    return response.data;
  },
  getAllPickups: async () => {
    const response = await api.get('/pickups/all');
    return response.data;
  },
  updatePickupStatus: async (pickupId: string, newStatus: string) => {
    const response = await api.put(`/pickups/${pickupId}`, { status: newStatus });
    return response.data;
  }
};

// ... after the pickupAPI object

export const notificationAPI = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markNotificationsAsRead: async () => {
    const response = await api.post('/notifications/mark-read');
    return response.data;
  }
};
 
// ... inside your api.ts file

export const productAPI = {
  createProduct: async (productData: { title: string; description: string; price: number }) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
   buyProduct: async (productId: string) => {
    const response = await api.post(`/products/${productId}/buy`);
    return response.data;
  },
};
