const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the server app
const app = require('../../server/index');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/greenquest-test';

describe('API Endpoints - Black Box Tests', () => {
  let testUser;
  let testAdmin;
  let userToken;
  let adminToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await mongoose.model('User').create({
      fullName: 'Test User',
      phone: '1234567890',
      username: 'testuser',
      email: 'test@example.com',
      village: 'Test Village',
      householdSize: '4',
      address: '123 Test St',
      password: hashedPassword,
      points: 100,
      level: 1
    });

    // Create test admin
    testAdmin = await mongoose.model('Admin').create({
      idNumber: 'admin123',
      password: hashedPassword,
      name: 'Test Admin'
    });

    // Generate tokens
    userToken = jwt.sign(
      { userId: testUser._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    adminToken = jwt.sign(
      { userId: testAdmin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Admin').deleteMany({});
    await mongoose.model('Collection').deleteMany({});
    await mongoose.model('Pickup').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Reward').deleteMany({});
    await mongoose.model('Notification').deleteMany({});
    await mongoose.disconnect();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          fullName: 'New User',
          phone: '9876543210',
          username: 'newuser',
          email: 'new@example.com',
          village: 'New Village',
          householdSize: '3',
          address: '456 New St',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'User registered successfully');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('fullName', 'New User');
        expect(response.body.user).toHaveProperty('phone', '9876543210');
        expect(response.body.user).toHaveProperty('points', 0);
        expect(response.body.user).toHaveProperty('level', 1);
      });

      it('should reject registration with duplicate phone number', async () => {
        const userData = {
          fullName: 'Duplicate User',
          phone: '1234567890', // Same as test user
          username: 'duplicate',
          email: 'duplicate@example.com',
          village: 'Duplicate Village',
          householdSize: '2',
          address: '789 Duplicate St',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/register')
          .send(userData)
          .expect(400);

        expect(response.body).toHaveProperty('message', 'User with this phone number already exists');
      });

      it('should reject registration with missing required fields', async () => {
        const userData = {
          fullName: 'Incomplete User',
          // Missing phone, username, etc.
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/register')
          .send(userData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should reject registration with missing username', async () => {
        const userData = {
          fullName: 'No Username User',
          phone: '1111111111',
          email: 'nousername@example.com',
          village: 'No Username Village',
          householdSize: '2',
          address: '123 No Username St',
          password: 'password123'
        };

        const response = await request(app)
          .post('/api/register')
          .send(userData)
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Username is required');
      });
    });

    describe('POST /api/login', () => {
      it('should login user with phone number successfully', async () => {
        const loginData = {
          username: '1234567890',
          password: 'password123',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('fullName', 'Test User');
        expect(response.body.user).toHaveProperty('role', 'user');
      });

      it('should login user with username successfully', async () => {
        const loginData = {
          username: 'testuser',
          password: 'password123',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      });

      it('should login admin successfully', async () => {
        const loginData = {
          username: 'admin123',
          password: 'password123',
          role: 'admin'
        };

        const response = await request(app)
          .post('/api/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('role', 'admin');
        expect(response.body.user).toHaveProperty('idNumber', 'admin123');
      });

      it('should reject login with invalid credentials', async () => {
        const loginData = {
          username: 'invaliduser',
          password: 'wrongpassword',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should reject login with wrong password', async () => {
        const loginData = {
          username: 'testuser',
          password: 'wrongpassword',
          role: 'user'
        };

        const response = await request(app)
          .post('/api/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
      });
    });
  });

  describe('User Profile Endpoints', () => {
    describe('GET /api/profile', () => {
      it('should fetch user profile with valid token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('fullName', 'Test User');
        expect(response.body).toHaveProperty('phone', '1234567890');
        expect(response.body).toHaveProperty('points', 100);
        expect(response.body).toHaveProperty('level', 1);
        expect(response.body).not.toHaveProperty('password'); // Password should not be returned
      });

      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
      });

      it('should reject request with invalid token', async () => {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(403);

        expect(response.body).toHaveProperty('message', 'Invalid or expired token.');
      });
    });

    describe('GET /api/stats', () => {
      it('should fetch public stats without authentication', async () => {
        const response = await request(app)
          .get('/api/stats')
          .expect(200);

        expect(response.body).toHaveProperty('households');
        expect(response.body).toHaveProperty('villages');
        expect(response.body).toHaveProperty('wasteReduction');
        expect(response.body).toHaveProperty('rewards');
        expect(typeof response.body.households).toBe('number');
        expect(typeof response.body.villages).toBe('number');
        expect(typeof response.body.wasteReduction).toBe('number');
        expect(typeof response.body.rewards).toBe('number');
      });
    });
  });

  describe('Pickup Endpoints', () => {
    describe('POST /api/pickups', () => {
      it('should schedule pickup with valid data', async () => {
        const pickupData = {
          wasteTypes: ['plastic', 'organic'],
          quantity: '5kg',
          address: '123 Test St',
          pickupDate: '2024-12-31',
          timeSlot: 'morning'
        };

        const response = await request(app)
          .post('/api/pickups')
          .set('Authorization', `Bearer ${userToken}`)
          .send(pickupData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Pickup scheduled successfully!');
        expect(response.body).toHaveProperty('pickup');
        expect(response.body.pickup).toHaveProperty('wasteTypes', ['plastic', 'organic']);
        expect(response.body.pickup).toHaveProperty('quantity', '5kg');
        expect(response.body.pickup).toHaveProperty('status', 'Pending');
      });

      it('should reject pickup scheduling without authentication', async () => {
        const pickupData = {
          wasteTypes: ['plastic'],
          quantity: '2kg',
          address: '123 Test St',
          pickupDate: '2024-12-31',
          timeSlot: 'morning'
        };

        const response = await request(app)
          .post('/api/pickups')
          .send(pickupData)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
      });

      it('should reject pickup scheduling with missing required fields', async () => {
        const pickupData = {
          wasteTypes: ['plastic'],
          // Missing quantity, address, etc.
        };

        const response = await request(app)
          .post('/api/pickups')
          .set('Authorization', `Bearer ${userToken}`)
          .send(pickupData)
          .expect(500); // Server error due to validation

        expect(response.body).toHaveProperty('message', 'Server error during pickup scheduling');
      });
    });

    describe('GET /api/pickups/my-pickups', () => {
      it('should fetch user pickups with valid token', async () => {
        const response = await request(app)
          .get('/api/pickups/my-pickups')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should reject request without authentication', async () => {
        const response = await request(app)
          .get('/api/pickups/my-pickups')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
      });
    });
  });

  describe('Reward Endpoints', () => {
    beforeAll(async () => {
      // Create test rewards
      await mongoose.model('Reward').create([
        {
          title: 'Discount Voucher',
          description: '10% off your next purchase',
          pointsRequired: 100,
          type: 'Discount',
          requiredLevel: 1,
          isActive: true
        },
        {
          title: 'Free Product',
          description: 'Get a free eco-friendly product',
          pointsRequired: 200,
          type: 'Product',
          requiredLevel: 2,
          isActive: true
        }
      ]);
    });

    describe('GET /api/rewards', () => {
      it('should fetch active rewards without authentication', async () => {
        const response = await request(app)
          .get('/api/rewards')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        
        const reward = response.body[0];
        expect(reward).toHaveProperty('title');
        expect(reward).toHaveProperty('description');
        expect(reward).toHaveProperty('pointsRequired');
        expect(reward).toHaveProperty('type');
        expect(reward).toHaveProperty('isActive', true);
      });
    });

    describe('POST /api/rewards/redeem', () => {
      it('should redeem reward with sufficient points', async () => {
        // First get available rewards
        const rewardsResponse = await request(app)
          .get('/api/rewards')
          .expect(200);

        const reward = rewardsResponse.body[0];

        const response = await request(app)
          .post('/api/rewards/redeem')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ rewardId: reward._id })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('updatedPoints');
        expect(response.body.updatedPoints).toBeLessThanOrEqual(100); // User had 100 points
      });

      it('should reject redemption without authentication', async () => {
        const response = await request(app)
          .post('/api/rewards/redeem')
          .send({ rewardId: 'some-id' })
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
      });

      it('should reject redemption with invalid reward ID', async () => {
        const response = await request(app)
          .post('/api/rewards/redeem')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ rewardId: 'invalid-id' })
          .expect(404);

        expect(response.body).toHaveProperty('message', 'Reward not found.');
      });
    });
  });

  describe('Leaderboard Endpoints', () => {
    describe('GET /api/leaderboard', () => {
      it('should fetch leaderboard without authentication', async () => {
        const response = await request(app)
          .get('/api/leaderboard')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        
        if (response.body.length > 0) {
          const user = response.body[0];
          expect(user).toHaveProperty('fullName');
          expect(user).toHaveProperty('village');
          expect(user).toHaveProperty('points');
          expect(user).toHaveProperty('level');
        }
      });
    });
  });

  describe('Admin Endpoints', () => {
    describe('POST /api/assign-points', () => {
      it('should assign points with admin token', async () => {
        const pointsData = {
          phone: '1234567890',
          wasteType: 'plastic',
          weight: 5
        };

        const response = await request(app)
          .post('/api/assign-points')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(pointsData)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('points');
        expect(response.body).toHaveProperty('user');
        expect(typeof response.body.points).toBe('number');
        expect(response.body.points).toBeGreaterThan(0);
      });

      it('should reject assignment with user token', async () => {
        const pointsData = {
          phone: '1234567890',
          wasteType: 'plastic',
          weight: 5
        };

        const response = await request(app)
          .post('/api/assign-points')
          .set('Authorization', `Bearer ${userToken}`)
          .send(pointsData)
          .expect(403);

        expect(response.body).toHaveProperty('message', 'Access denied. Admin role required.');
      });

      it('should reject assignment for non-existent user', async () => {
        const pointsData = {
          phone: '9999999999', // Non-existent phone
          wasteType: 'plastic',
          weight: 5
        };

        const response = await request(app)
          .post('/api/assign-points')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(pointsData)
          .expect(404);

        expect(response.body).toHaveProperty('message', 'User not found.');
      });
    });
  });

  describe('Game Endpoints', () => {
    describe('POST /api/users/add-game-points', () => {
      it('should add game points successfully', async () => {
        const gameData = {
          pointsToAdd: 10,
          gameName: 'Quiz Game'
        };

        const response = await request(app)
          .post('/api/users/add-game-points')
          .set('Authorization', `Bearer ${userToken}`)
          .send(gameData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Points added successfully!');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('points');
      });

      it('should reject game points without authentication', async () => {
        const gameData = {
          pointsToAdd: 10,
          gameName: 'Quiz Game'
        };

        const response = await request(app)
          .post('/api/users/add-game-points')
          .send(gameData)
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should handle requests to non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    it('should handle server errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we'll test with invalid data that causes server errors
      const response = await request(app)
        .post('/api/pickups')
        .set('Authorization', `Bearer ${userToken}`)
        .send({}) // Empty data should cause validation errors
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});



