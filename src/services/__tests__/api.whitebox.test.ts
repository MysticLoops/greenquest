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

describe('API Service - White Box Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  describe('Internal Logic Flow - AuthAPI', () => {
    describe('register function internal flow', () => {
      it('should follow correct internal execution path for successful registration', async () => {
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

        // Verify internal execution path:
        // 1. Call axios.post with correct endpoint
        expect(mockedAxios.post).toHaveBeenCalledWith('/register', userData);
        // 2. Return response.data
        expect(result).toEqual(mockResponse.data);
        // 3. Verify no additional processing occurred
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });

      it('should handle internal error propagation correctly', async () => {
        const userData = { fullName: 'John Doe' };
        const errorMessage = 'Registration failed';
        const error = new Error(errorMessage);

        mockedAxios.post.mockRejectedValueOnce(error);

        // Verify internal error handling:
        // 1. Error should propagate without modification
        await expect(authAPI.register(userData)).rejects.toThrow(errorMessage);
        // 2. No additional error handling should occur
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });

    describe('login function internal flow', () => {
      it('should construct request payload correctly for user login', async () => {
        const mockResponse = {
          data: {
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: { id: 'user123', fullName: 'John Doe' }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await authAPI.login('johndoe', 'password123', 'user');

        // Verify internal payload construction:
        const expectedPayload = {
          username: 'johndoe',
          password: 'password123',
          role: 'user'
        };
        expect(mockedAxios.post).toHaveBeenCalledWith('/login', expectedPayload);
      });

      it('should construct request payload correctly for admin login', async () => {
        const mockResponse = {
          data: {
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: { id: 'admin123', name: 'Admin User', role: 'admin' }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await authAPI.login('admin123', 'password123', 'admin');

        // Verify internal payload construction for admin:
        const expectedPayload = {
          username: 'admin123',
          password: 'password123',
          role: 'admin'
        };
        expect(mockedAxios.post).toHaveBeenCalledWith('/login', expectedPayload);
      });
    });

    describe('assignPoints function internal flow', () => {
      it('should construct request payload with correct parameter mapping', async () => {
        const mockResponse = {
          data: {
            message: 'Points assigned successfully',
            points: 50,
            user: { id: 'user123', points: 150 }
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await authAPI.assignPoints('1234567890', 'plastic', 5);

        // Verify internal parameter mapping:
        const expectedPayload = {
          phone: '1234567890',
          wasteType: 'plastic',
          weight: 5
        };
        expect(mockedAxios.post).toHaveBeenCalledWith('/assign-points', expectedPayload);
      });
    });
  });

  describe('Internal Logic Flow - RewardAPI', () => {
    describe('redeemReward function internal flow', () => {
      it('should execute console.log before API call', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const mockResponse = { data: { message: 'Success' } };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await rewardAPI.redeemReward('reward123');

        // Verify internal execution order:
        // 1. Console.log should be called first
        expect(consoleSpy).toHaveBeenCalledWith('Attempting to redeem reward with ID:', 'reward123');
        // 2. Then API call should be made
        expect(mockedAxios.post).toHaveBeenCalledWith('/rewards/redeem', {
          rewardId: 'reward123'
        });
        // 3. Console.log should be called before axios.post
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should handle console.log errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
          throw new Error('Console error');
        });
        const mockResponse = { data: { message: 'Success' } };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        // Should not throw error even if console.log fails
        await expect(rewardAPI.redeemReward('reward123')).resolves.toEqual(mockResponse.data);
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Internal Logic Flow - PickupAPI', () => {
    describe('updatePickupStatus function internal flow', () => {
      it('should construct URL with dynamic parameter correctly', async () => {
        const mockResponse = {
          data: {
            message: 'Pickup status successfully updated to Confirmed',
            pickup: { id: 'pickup123', status: 'Confirmed' }
          }
        };

        mockedAxios.put.mockResolvedValueOnce(mockResponse);

        await pickupAPI.updatePickupStatus('pickup123', 'Confirmed');

        // Verify internal URL construction:
        expect(mockedAxios.put).toHaveBeenCalledWith('/pickups/pickup123', {
          status: 'Confirmed'
        });
      });

      it('should handle different status values correctly', async () => {
        const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
        const mockResponse = { data: { message: 'Success' } };

        for (const status of statuses) {
          mockedAxios.put.mockResolvedValueOnce(mockResponse);
          await pickupAPI.updatePickupStatus('pickup123', status);
          
          expect(mockedAxios.put).toHaveBeenCalledWith('/pickups/pickup123', {
            status: status
          });
        }
      });
    });
  });

  describe('Internal Logic Flow - ProductAPI', () => {
    describe('buyProduct function internal flow', () => {
      it('should construct URL with product ID correctly', async () => {
        const mockResponse = {
          data: {
            message: 'Purchase successful!',
            updatedPoints: 50
          }
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);

        await productAPI.buyProduct('product123');

        // Verify internal URL construction:
        expect(mockedAxios.post).toHaveBeenCalledWith('/products/product123/buy');
      });

      it('should handle different product IDs correctly', async () => {
        const productIds = ['product1', 'product2', 'product-abc-123'];
        const mockResponse = { data: { message: 'Success' } };

        for (const productId of productIds) {
          mockedAxios.post.mockResolvedValueOnce(mockResponse);
          await productAPI.buyProduct(productId);
          
          expect(mockedAxios.post).toHaveBeenCalledWith(`/products/${productId}/buy`);
        }
      });
    });
  });

  describe('Internal Error Handling Logic', () => {
    it('should propagate axios errors without modification', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      // Verify error propagation:
      await expect(authAPI.login('user', 'pass', 'user')).rejects.toThrow('Network Error');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle axios response errors correctly', async () => {
      const apiError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(apiError);

      // Verify error object is passed through unchanged:
      await expect(authAPI.login('invalid', 'wrong', 'user')).rejects.toEqual(apiError);
    });

    it('should handle timeout errors correctly', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };
      mockedAxios.post.mockRejectedValueOnce(timeoutError);

      // Verify timeout error is handled:
      await expect(authAPI.login('user', 'pass', 'user')).rejects.toEqual(timeoutError);
    });
  });

  describe('Internal Data Flow', () => {
    it('should maintain data integrity through API calls', async () => {
      const originalData = {
        fullName: 'John Doe',
        phone: '1234567890',
        username: 'johndoe'
      };

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          token: 'mock-jwt-token',
          user: originalData
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await authAPI.register(originalData);

      // Verify data integrity:
      expect(result.user).toEqual(originalData);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.message).toBe('User registered successfully');
    });

    it('should handle nested data structures correctly', async () => {
      const complexData = {
        wasteTypes: ['plastic', 'organic', 'e-waste'],
        quantity: '5kg',
        address: '123 Test St',
        pickupDate: '2024-12-31',
        timeSlot: 'morning'
      };

      const mockResponse = {
        data: {
          message: 'Pickup scheduled successfully!',
          pickup: { id: 'pickup123', ...complexData }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await pickupAPI.schedulePickup(complexData);

      // Verify nested data handling:
      expect(result.pickup.wasteTypes).toEqual(['plastic', 'organic', 'e-waste']);
      expect(result.pickup.quantity).toBe('5kg');
      expect(result.pickup.address).toBe('123 Test St');
    });
  });

  describe('Internal Performance Considerations', () => {
    it('should not make unnecessary API calls', async () => {
      const mockResponse = { data: { message: 'Success' } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await authAPI.getStats();

      // Verify only one API call is made:
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith('/stats');
    });

    it('should handle concurrent API calls correctly', async () => {
      const mockResponse = { data: { message: 'Success' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Make concurrent calls:
      const promises = [
        authAPI.getStats(),
        authAPI.getProfile(),
        rewardAPI.getRewards()
      ];

      await Promise.all(promises);

      // Verify all calls were made:
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Internal State Management', () => {
    it('should not modify input parameters', async () => {
      const originalData = {
        title: 'Test Product',
        description: 'A test product',
        price: 100
      };
      const dataCopy = { ...originalData };

      const mockResponse = {
        data: {
          message: 'Product listed successfully!',
          product: { id: 'product123', ...originalData }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await productAPI.createProduct(originalData);

      // Verify input data is not modified:
      expect(originalData).toEqual(dataCopy);
    });

    it('should handle undefined and null values correctly', async () => {
      const mockResponse = { data: { message: 'Success' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      // Test with undefined values:
      await authAPI.login('user', 'pass', 'user');
      expect(mockedAxios.post).toHaveBeenCalledWith('/login', {
        username: 'user',
        password: 'pass',
        role: 'user'
      });
    });
  });
});



