import axios from 'axios';
import { authAPI, rewardAPI, leaderboardAPI, pickupAPI, productAPI } from '../../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('AuthAPI', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          fullName: 'John Doe',
          phone: '1234567890',
          username: 'johndoe',
          email: 'john@example.com',
          village: 'Test Village',
          householdSize: '4',
          address: '123 Test St',
          password: 'password123'
        };

        const mockResponse = {
          data: {
            message: 'User registered successfully',
            token: 'mock-jwt-token',
            user: { id: 'user123', fullName: 'John Doe' }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.register(userData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/register', userData);
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle registration errors', async () => {
        const userData = { fullName: 'John Doe' };
        const errorMessage = 'Registration failed';

        mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

        await expect(authAPI.register(userData)).rejects.toThrow(errorMessage);
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: { id: 'user123', fullName: 'John Doe' }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.login('johndoe', 'password123', 'user');

        expect(mockedAxios.post).toHaveBeenCalledWith('/login', {
          username: 'johndoe',
          password: 'password123',
          role: 'user'
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should login admin successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: { id: 'admin123', name: 'Admin User', role: 'admin' }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.login('admin123', 'password123', 'admin');

        expect(mockedAxios.post).toHaveBeenCalledWith('/login', {
          username: 'admin123',
          password: 'password123',
          role: 'admin'
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should handle login errors', async () => {
        const errorMessage = 'Invalid credentials';
        mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

        await expect(authAPI.login('invalid', 'wrong', 'user')).rejects.toThrow(errorMessage);
      });
    });

    describe('getProfile', () => {
      it('should fetch user profile successfully', async () => {
        const mockResponse = {
          data: {
            id: 'user123',
            fullName: 'John Doe',
            phone: '1234567890',
            points: 100
          }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.getProfile();

        expect(mockedAxios.get).toHaveBeenCalledWith('/profile');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getStats', () => {
      it('should fetch stats successfully', async () => {
        const mockResponse = {
          data: {
            households: 150,
            villages: 5,
            wasteReduction: 2500,
            rewards: 15000
          }
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.getStats();

        expect(mockedAxios.get).toHaveBeenCalledWith('/stats');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('assignPoints', () => {
      it('should assign points successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Points assigned successfully',
            points: 50,
            user: { id: 'user123', points: 150 }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.assignPoints('1234567890', 'plastic', 5);

        expect(mockedAxios.post).toHaveBeenCalledWith('/assign-points', {
          phone: '1234567890',
          wasteType: 'plastic',
          weight: 5
        });
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('addGamePoints', () => {
      it('should add game points successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Points added successfully',
            user: { id: 'user123', points: 120 }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authAPI.addGamePoints(20, 'Quiz Game');

        expect(mockedAxios.post).toHaveBeenCalledWith('users/add-game-points', {
          pointsToAdd: 20,
          gameName: 'Quiz Game'
        });
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('RewardAPI', () => {
    describe('getRewards', () => {
      it('should fetch rewards successfully', async () => {
        const mockResponse = {
          data: [
            { id: 'reward1', title: 'Discount Voucher', pointsRequired: 100 },
            { id: 'reward2', title: 'Free Product', pointsRequired: 200 }
          ]
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await rewardAPI.getRewards();

        expect(mockedAxios.get).toHaveBeenCalledWith('/rewards');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('redeemReward', () => {
      it('should redeem reward successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Successfully redeemed reward!',
            updatedPoints: 50
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await rewardAPI.redeemReward('reward123');

        expect(mockedAxios.post).toHaveBeenCalledWith('/rewards/redeem', {
          rewardId: 'reward123'
        });
        expect(result).toEqual(mockResponse.data);
      });

      it('should log reward ID to console', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockResponse = { data: { message: 'Success' } };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await rewardAPI.redeemReward('reward123');

        expect(consoleSpy).toHaveBeenCalledWith('Attempting to redeem reward with ID:', 'reward123');
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('LeaderboardAPI', () => {
    describe('getLeaderboard', () => {
      it('should fetch leaderboard successfully', async () => {
        const mockResponse = {
          data: [
            { fullName: 'John Doe', village: 'Village A', points: 500, level: 3 },
            { fullName: 'Jane Smith', village: 'Village B', points: 450, level: 2 }
          ]
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await leaderboardAPI.getLeaderboard();

        expect(mockedAxios.get).toHaveBeenCalledWith('/leaderboard');
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('PickupAPI', () => {
    describe('schedulePickup', () => {
      it('should schedule pickup successfully', async () => {
        const pickupData = {
          wasteTypes: ['plastic', 'organic'],
          quantity: '5kg',
          address: '123 Test St',
          pickupDate: '2024-01-15',
          timeSlot: 'morning'
        };

        const mockResponse = {
          data: {
            message: 'Pickup scheduled successfully!',
            pickup: { id: 'pickup123', ...pickupData }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await pickupAPI.schedulePickup(pickupData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/pickups', pickupData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getUserPickups', () => {
      it('should fetch user pickups successfully', async () => {
        const mockResponse = {
          data: [
            { id: 'pickup1', wasteTypes: ['plastic'], status: 'Pending' },
            { id: 'pickup2', wasteTypes: ['organic'], status: 'Completed' }
          ]
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await pickupAPI.getUserPickups();

        expect(mockedAxios.get).toHaveBeenCalledWith('/pickups/my-pickups');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('updatePickupStatus', () => {
      it('should update pickup status successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Pickup status successfully updated to Confirmed',
            pickup: { id: 'pickup123', status: 'Confirmed' }
          }
        };

        mockedAxios.put.mockResolvedValueOnce(mockResponse);

        const result = await pickupAPI.updatePickupStatus('pickup123', 'Confirmed');

        expect(mockedAxios.put).toHaveBeenCalledWith('/pickups/pickup123', {
          status: 'Confirmed'
        });
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('ProductAPI', () => {
    describe('createProduct', () => {
      it('should create product successfully', async () => {
        const productData = {
          title: 'Test Product',
          description: 'A test product',
          price: 100
        };

        const mockResponse = {
          data: {
            message: 'Product listed successfully!',
            product: { id: 'product123', ...productData }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await productAPI.createProduct(productData);

        expect(mockedAxios.post).toHaveBeenCalledWith('/products', productData);
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('getAllProducts', () => {
      it('should fetch all products successfully', async () => {
        const mockResponse = {
          data: [
            { id: 'product1', title: 'Product 1', price: 100 },
            { id: 'product2', title: 'Product 2', price: 200 }
          ]
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await productAPI.getAllProducts();

        expect(mockedAxios.get).toHaveBeenCalledWith('/products');
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe('buyProduct', () => {
      it('should buy product successfully', async () => {
        const mockResponse = {
          data: {
            message: 'Purchase successful!',
            updatedPoints: 50
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await productAPI.buyProduct('product123');

        expect(mockedAxios.post).toHaveBeenCalledWith('/products/product123/buy');
        expect(result).toEqual(mockResponse.data);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(authAPI.login('user', 'pass', 'user')).rejects.toThrow('Network Error');
    });

    it('should handle API errors with proper status codes', async () => {
      const apiError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(apiError);

      await expect(authAPI.login('invalid', 'wrong', 'user')).rejects.toEqual(apiError);
    });
  });
});


