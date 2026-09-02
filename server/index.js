const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // <-- Declared only ONCE
const sgMail = require('@sendgrid/mail');
const multer = require('multer'); // <-- All imports at the top

// 1. Configure environment variables first
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 2. Initialize Express App
const app = express();
console.log("SERVER BOOTING UP...");

// 3. Set up API keys and other configurations
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 4. Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  }
});
const upload = multer({ storage: storage });

// 5. Apply ALL Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://greenquest-1.onrender.com",
      "https://greenquest-kappa.vercel.app"
    ];
    
    // In development, allow all localhost origins and requests with no origin
    if (process.env.NODE_ENV !== 'production') {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // In production, only allow specific origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}`);
      callback(new Error(`This origin is not allowed by CORS: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json()); // Middleware to parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Middleware to serve static files

// 6. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ... The rest of your file (Schemas, Models, Routes, etc.) goes here ...

// =================================================================
// ----------------- SCHEMAS & MODELS ------------------------------
// =================================================================

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  village: { type: String, required: true },
  householdSize: { type: String, required: true },
  address: { type: String, required: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, required: true },
  redeemedRewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
  idNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);

const collectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, enum: ['plastic', 'organic', 'e-waste', 'biodegradable', 'ecofriendly'], required: true },
  weight: { type: Number, required: true },
  points: { type: Number, required: true },
  collectedBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Collection = mongoose.model('Collection', collectionSchema);

const pickupSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wasteTypes: { type: [String], required: true },
    quantity: { type: String, required: true },
    address: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true });
const Pickup = mongoose.model('Pickup', pickupSchema);

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isSold: { type: Boolean, default: false },
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

const rewardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pointsRequired: { type: Number, required: true },
    type: {
        type: String,
        enum: ['Discount', 'Voucher', 'Recharge', 'Product'],
        required: true,
    },
    requiredLevel: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Reward = mongoose.model('Reward', rewardSchema);

const redemptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
    pointsSpent: { type: Number, required: true },
}, { timestamps: true });
const Redemption = mongoose.model('Redemption', redemptionSchema);

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);

// =================================================================
// ----------------- TIER DEFINITIONS ------------------------------
// =================================================================

const tiers = [
    { level: 1, name: 'Eco-Starter', minPoints: 0 },
    { level: 2, name: 'Green-Guardian', minPoints: 100 },
    { level: 3, name: 'Eco-Champion', minPoints: 300 },
    { level: 4, name: 'Planet-Hero', minPoints: 700 },
    { level: 5, name: 'Eco-Legend', minPoints: 5000 },
    { level: 6, name: 'Terra-Guardian', minPoints: 20000 },
    { level: 7, name: 'Gaia\'s Champion', minPoints: 50000 },
];

// =================================================================
// ----------------- AUTH MIDDLEWARE -------------------------------
// =================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = decoded;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// =================================================================
// ----------------- API ROUTES ------------------------------------
// =================================================================

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phone, username, email, village, householdSize, address, password } = req.body;
    if (!username) return res.status(400).json({ message: 'Username is required' });
    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) return res.status(400).json({ message: 'User with this phone number already exists' });
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken. Please choose a different username.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, phone, username, email, village, householdSize, address, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, fullName: user.fullName, phone: user.phone, username: user.username, village: user.village, points: user.points, level: user.level, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let account = role === 'admin'
      ? await Admin.findOne({ idNumber: username })
      : await User.findOne({ $or: [{ phone: username }, { username }] });
    if (!account) return res.status(401).json({ message: 'Invalid credentials' });
    const isValid = await bcrypt.compare(password, account.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = role === 'admin'
      ? { userId: account._id, role: 'admin', idNumber: account.idNumber }
      : { userId: account._id, role: 'user' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = role === 'admin'
      ? { id: account._id, idNumber: account.idNumber, name: account.name, role: 'admin' }
      : { id: account._id, fullName: account.fullName, phone: account.phone, username: account.username, village: account.village, points: account.points, level: account.level, role: 'user' };
    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// --- User & Stats Routes ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const distinctVillages = await User.distinct('village');
        const collectionStats = await Collection.aggregate([
            { $group: { _id: null, totalWaste: { $sum: '$weight' }, totalRewards: { $sum: '$points' } } }
        ]);
        res.json({ 
            households: totalUsers, 
            villages: distinctVillages.length, 
            wasteReduction: collectionStats[0]?.totalWaste || 0, 
            rewards: collectionStats[0]?.totalRewards || 0 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
});

// --- Pickup Routes ---
app.post('/api/pickups', authenticateToken, async (req, res) => {
  try {
    const { wasteTypes, quantity, address, pickupDate, timeSlot } = req.body;
    const pickup = new Pickup({ user: req.user.userId, wasteTypes, quantity, address, pickupDate, timeSlot });
    await pickup.save();
    res.status(201).json({ message: 'Pickup scheduled successfully!', pickup });
  } catch (error) {
    res.status(500).json({ message: 'Server error during pickup scheduling' });
  }
});

app.get('/api/pickups/my-pickups', authenticateToken, async (req, res) => {
  try {
    const pickups = await Pickup.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching pickups' });
  }
});

app.get('/api/pickups/my-weights', authenticateToken, async (req, res) => {
  try {
    const stats = await Collection.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } },
      {
        $group: {
          _id: "$wasteType",
          totalWeight: { $sum: "$weight" }
        }
      }
    ]);
    const formatted = stats.reduce((acc, item) => {
      acc[item._id] = { weight: item.totalWeight };
      return acc;
    }, {});
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching waste stats' });
  }
});

// --- Product Marketplace Routes ---
// app.post('/api/products', authenticateToken, async (req, res) => {
//   try {
//     const { title, description, price } = req.body;
//     const newProduct = new Product({ title, description, price, seller: req.user.userId });
//     await newProduct.save();
//     res.status(201).json({ message: 'Product listed successfully!', product: newProduct });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error while listing product.' });
//   }
// });

// app.get('/api/products', authenticateToken, async (req, res) => {
//   try {
//     const products = await Product.find({ isSold: false }).populate('seller', 'fullName village').sort({ createdAt: -1 });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error while fetching products.' });
//   }
// });
// In server/index.js

// Find this route in your server file
app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    
    const newProduct = new Product({
      title,
      description,
      price: Number(price), // <-- FIX: Convert the price string to a Number
      seller: req.user.userId,
      imageUrl: req.file ? req.file.path : undefined,
    });
    
    await newProduct.save();
    res.status(201).json({ message: 'Product listed successfully!', product: newProduct });
  } catch (error) {
    // Add a log here to see the validation error on the server
    console.error("Error creating product:", error); 
    res.status(500).json({ message: 'Server error while listing product.' });
  }
});

app.get('/api/products', authenticateToken, async (req, res) => {
   try {
    const products = await Product.find({ isSold: false }).populate('seller', 'fullName village').sort({ createdAt: -1 });
    res.json(products);
   } catch (error) {
    res.status(500).json({ message: 'Server error while fetching products.' });
   }
});
// ... after your app.get('/api/products', ...) route

app.post('/api/products/:id/buy', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const buyerId = req.user.userId;

    const product = await Product.findById(productId);
    const buyer = await User.findById(buyerId);

    // --- Validation Checks ---
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.isSold) return res.status(400).json({ message: 'This product is already sold.' });
    if (product.seller.toString() === buyerId) return res.status(400).json({ message: 'You cannot buy your own product.' });
    if (buyer.points < product.price) return res.status(400).json({ message: 'You do not have enough points.' });

    const seller = await User.findById(product.seller);

    // --- Perform the Transaction ---
    buyer.points -= product.price;
    if (seller) {
      seller.points += product.price;
    }
    product.isSold = true;

    // --- Save all changes to the database ---
    await Promise.all([buyer.save(), seller?.save(), product.save()]);
    
    // Create notification for the seller
    const notification = new Notification({
        user: product.seller,
        message: `Congratulations! Your product "${product.title}" has been sold to ${buyer.fullName}.`,
    });
    await notification.save();

    res.json({ message: 'Purchase successful!', updatedPoints: buyer.points });
  } catch (error) {
    console.error("Purchase Error:", error);
    res.status(500).json({ message: 'Server error during purchase.' });
  }
});
    

// --- Reward & Leaderboard Routes ---
app.get('/api/rewards', async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ pointsRequired: 1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching rewards' });
  }
});

app.post('/api/rewards/redeem', authenticateToken, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const user = await User.findById(req.user.userId);
    const reward = await Reward.findById(rewardId);
    if (!reward) return res.status(404).json({ message: 'Reward not found.' });
    if (user.redeemedRewards && user.redeemedRewards.includes(rewardId)) return res.status(400).json({ message: 'You have already redeemed this reward.' });
    if (user.points < reward.pointsRequired) return res.status(400).json({ message: 'Insufficient points.' });
    user.points -= reward.pointsRequired;
    if (!user.redeemedRewards) user.redeemedRewards = [];
    user.redeemedRewards.push(rewardId);
    const redemption = new Redemption({ user: user._id, reward: reward._id, pointsSpent: reward.pointsRequired });
    const notification = new Notification({ user: user._id, message: `Success! You've redeemed "${reward.title}" for ${reward.pointsRequired} points.`, link: '/rewards' });
    await Promise.all([user.save(), redemption.save(), notification.save()]);
    if (user.email) {
      const emailMessage = { to: user.email, from: 'ashmi.sn2004@gmail.com', subject: 'Reward Redemption Successful!', text: `You successfully redeemed "${reward.title}" for ${reward.pointsRequired} points.` };
      sgMail.send(emailMessage).catch(error => console.error('Error sending email:', error.response?.body || error.message));
    }
    res.json({ message: `Successfully redeemed '${reward.title}'!`, updatedPoints: user.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while redeeming reward' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find({ role: 'user' }).sort({ points: -1 }).limit(10).select('fullName village points level');
        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});

// --- Notification Routes ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

app.post('/api/notifications/mark-read', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.userId, isRead: false }, { $set: { isRead: true } });
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Game Routes ---
app.post('/api/users/add-game-points', authenticateToken, async (req, res) => {
    try {
        const { pointsToAdd, gameName } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const pointsBefore = user.points;
        user.points += pointsToAdd;
        const tierBefore = tiers.slice().reverse().find(t => pointsBefore >= t.minPoints) || tiers[0];
        const tierAfter = tiers.slice().reverse().find(t => user.points >= t.minPoints) || tiers[0];
        const notificationPromises = [];
        if (tierAfter.level > tierBefore.level) {
            const levelUpMessage = `LEVEL UP! You've reached Tier ${tierAfter.level}: ${tierAfter.name}!`;
            notificationPromises.push(new Notification({ user: user._id, message: levelUpMessage, link: '/dashboard' }).save());
        }
        const gameWinMessage = `Congratulations! You earned ${pointsToAdd} bonus points from playing ${gameName}.`;
        notificationPromises.push(new Notification({ user: user._id, message: gameWinMessage, link: '/games' }).save());
        await Promise.all([user.save(), ...notificationPromises]);
        res.json({ message: 'Points added successfully!', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding game points' });
    }
});

// --- Admin Routes ---
app.post('/api/assign-points', [authenticateToken, authorizeAdmin], async (req, res) => {
    try {
        const { phone, wasteType, weight } = req.body;
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        const pointsBefore = user.points;
        let pointsPerKg = 10, bonusMultiplier = 1.0, bonusMessage = '';
        if (wasteType === 'plastic') {
            const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
            const fifteenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 15));
            const recentCollections = await Collection.find({ userId: user._id, wasteType: 'plastic', date: { $gte: thirtyDaysAgo } });
            const firstHalfWeight = recentCollections.filter(c => c.date < fifteenDaysAgo).reduce((sum, c) => sum + c.weight, 0);
            const secondHalfWeight = recentCollections.filter(c => c.date >= fifteenDaysAgo).reduce((sum, c) => sum + c.weight, 0);
            if (firstHalfWeight > 0 && secondHalfWeight < firstHalfWeight) {
                bonusMultiplier = 1.2;
                bonusMessage = ' Great job reducing plastic waste! You earned a 20% bonus.';
            }
        }
        else if (wasteType === 'biodegradable') pointsPerKg = 15;
        else if (wasteType === 'e-waste') pointsPerKg = 25;
        const pointsEarned = Math.round((weight * pointsPerKg) * bonusMultiplier);
        user.points += pointsEarned;
        const notificationPromises = [];
        const tierBefore = tiers.slice().reverse().find(t => pointsBefore >= t.minPoints) || tiers[0];
        const tierAfter = tiers.slice().reverse().find(t => user.points >= t.minPoints) || tiers[0];
        if (tierAfter.level > tierBefore.level) {
            const levelUpMessage = `LEVEL UP! You've reached Tier ${tierAfter.level}: ${tierAfter.name}!`;
            notificationPromises.push(new Notification({ user: user._id, message: levelUpMessage, link: '/dashboard' }).save());
        }
        const pointsMessage = `You earned ${pointsEarned} points for your ${wasteType} collection.${bonusMessage}`;
        notificationPromises.push(new Notification({ user: user._id, message: pointsMessage }).save());
        const newCollection = new Collection({ userId: user._id, wasteType, weight, points: pointsEarned, collectedBy: req.user.idNumber || 'admin' });
        await Promise.all([user.save(), newCollection.save(), ...notificationPromises]);
        res.json({ message: `Points assigned successfully.${bonusMessage}`, points: pointsEarned, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error while assigning points' });
    }
});

app.get('/api/pickups/all', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const allPickups = await Pickup.find({}).populate('user', 'fullName phone').sort({ createdAt: -1 });
    res.json(allPickups);
  } catch (error) {
    console.error("Admin: Error fetching all pickups:", error);
    res.status(500).json({ message: 'Server error while fetching all pickups' });
  }
});

app.put('/api/pickups/:id', [authenticateToken, authorizeAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status value provided.' });
    const pickup = await Pickup.findById(id);
    if (!pickup) return res.status(404).json({ message: 'Pickup request not found.' });
    pickup.status = status;
    await pickup.save();
    const message = `Update: Your pickup scheduled for ${new Date(pickup.pickupDate).toLocaleDateString()} is now marked as "${status}".`;
    const newNotification = new Notification({ user: pickup.user, message: message, link: '/dashboard' });
    await newNotification.save();
    res.json({ message: `Pickup status successfully updated to ${status}`, pickup });
  } catch (error) {
    console.error("Admin: Error updating pickup status:", error);
    res.status(500).json({ message: 'Server error while updating pickup status' });
  }
});

// =================================================================
// ----------------- SERVER INITIALIZATION -------------------------
// =================================================================

const createDefaultAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ idNumber: 'admin123' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new Admin({ idNumber: 'admin123', password: hashedPassword, name: 'Default Admin' });
            await admin.save();
            console.log('Default admin created: admin123 / admin123');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultAdmin();
});