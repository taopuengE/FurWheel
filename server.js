const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const argon2 = require('argon2'); // Use argon2 instead of bcryptjs

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.log('❌ MongoDB connection error:', err));

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// เช็ค password
userSchema.methods.matchPassword = async function (password) {
  return await argon2.verify(this.password, password);
};

const User = mongoose.model('User', userSchema);

// Define Car schema and model
const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price_per_day: Number,
  image_path: String,
  status: { type: String, default: 'available' },
  username: String,
  description: String,
  year: Number,
  mileage: Number,
  province: String,
  details: String, // เพิ่มฟิลด์ details
});

const Car = mongoose.model('Car', carSchema);

// Define Payment schema and model
const paymentSchema = new mongoose.Schema({
  carId: String,
  renterUsername: String,
  paymentMethod: String,
  slip: String,
  amount: Number, // เพิ่มฟิลด์ amount
});

const Payment = mongoose.model('Payment', paymentSchema);

// Define Rental schema and model
const rentalSchema = new mongoose.Schema({
  carId: String,
  renterUsername: String,
  startDate: Date,
  endDate: Date,
  rentalDays: Number,
  documentPath: String,
});

const Rental = mongoose.model('Rental', rentalSchema);

// Define Order schema and model
const orderSchema = new mongoose.Schema({
  carId: String,
  renterUsername: String,
  amount: Number, // เพิ่มฟิลด์ amount
  startDate: Date,
  endDate: Date,
  rentalDays: Number,
});

const Order = mongoose.model('Order', orderSchema);

// API: สมัครสมาชิก
app.post('/register', async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;
    const newUser = new User({ username, phone, email, password });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก', error });
  }
});

// API: เข้าสู่ระบบ
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', error });
  }
});

// API: เพิ่มข้อมูลรถ
app.post('/cars', upload.single('image'), async (req, res) => {
  try {
    const { brand, model, price_per_day, username, description, year, mileage, province, details } = req.body;
    const newCar = new Car({
      brand,
      model,
      price_per_day,
      image_path: `/uploads/${req.file.filename}`,
      username,
      description,
      year,
      mileage,
      province,
      details, // บันทึก details
    });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลรถ', error });
  }
});

// API: ดึงข้อมูลรถทั้งหมด
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถ', error });
  }
});

// API: ดึงข้อมูลรถเดี่ยว
app.get('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'ไม่พบรถที่ต้องการ' });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถ', error });
  }
});

// API: เพิ่มข้อมูลการชำระเงิน
app.post('/payments', upload.single('slip'), async (req, res) => {
  try {
    const { carId, renterUsername, paymentMethod, amount } = req.body; // รับ amount จาก request body
    const newPayment = new Payment({
      carId,
      renterUsername,
      paymentMethod,
      slip: paymentMethod === 'bank_transfer' ? `/uploads/${req.file.filename}` : null,
      amount, // บันทึก amount
    });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลการชำระเงิน', error });
  }
});

// API: ดึงข้อมูลการชำระเงินทั้งหมด
app.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน', error });
  }
});

// API: อัปโหลดเอกสาร
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const { carId, rentalDays } = req.body;
    const newRental = new Rental({
      carId,
      renterUsername: req.body.renterUsername,
      startDate: new Date(),
      endDate: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000),
      rentalDays,
      documentPath: `/uploads/${req.file.filename}`,
    });
    await newRental.save();
    res.status(201).json({ message: 'อัปโหลดเอกสารสำเร็จ', filePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร', error });
  }
});

// API: ดึงข้อมูลการเช่าเดี่ยว
app.get('/rentals/:carId', async (req, res) => {
  try {
    const rental = await Rental.findOne({ carId: req.params.carId });
    if (!rental) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการเช่า' });
    }
    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเช่า', error });
  }
});

// Endpoint สำหรับลบรถ
app.delete('/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'ไม่พบรถที่ต้องการลบ' });
    }
    res.status(200).json({ message: 'ลบรถสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรถ', error });
  }
});

// API: อัปเดตข้อมูลรถ
app.put('/cars/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { price_per_day, details } = req.body;
    const updateData = { price_per_day, details };
    if (req.file) {
      updateData.image_path = `/uploads/${req.file.filename}`;
    }
    const updatedCar = await Car.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: 'ไม่พบรถที่ต้องการอัปเดต' });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error); // Log the error
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตรถ', error });
  }
});

// API: อัปเดตสถานะรถ
app.put('/cars/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedCar = await Car.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: 'ไม่พบรถที่ต้องการอัปเดต' });
    }

    res.status(200).json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตรถ', error });
  }
});

// API: ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

// API: ดึงข้อมูลการเช่าทั้งหมด
app.get('/rentals', async (req, res) => {
  try {
    const rentals = await Rental.find();
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเช่า', error });
  }
});

// API: ดึงข้อมูลการเช่าเดี่ยว
app.get('/rentals/:carId', async (req, res) => {
  try {
    const rental = await Rental.findOne({ carId: req.params.carId });
    if (!rental) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลการเช่า' });
    }
    res.status(200).json(rental);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการเช่า', error });
  }
});

// API: ลบผู้ใช้
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status (500).json({ message: 'Error deleting user', error });
  }
});

// API: ลบการจองใน payments และ rentals
app.delete('/bookings/:carId', async (req, res) => {
  try {
    const { carId } = req.params;

    // ลบการจองใน payments
    await Payment.deleteMany({ carId });

    // ลบการจองใน rentals
    await Rental.deleteMany({ carId });

    res.status(200).json({ message: 'ลบการจองสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบการจอง', error });
  }
});

// API: ดึงข้อมูลผู้ใช้ตาม username
app.get('/users/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', error });
  }
});

// API: เพิ่มข้อมูลการสั่งซื้อ
app.post('/orders', async (req, res) => {
  try {
    const { carId, renterUsername, amount, startDate, endDate, rentalDays } = req.body; // รับ amount จาก request body
    const newOrder = new Order({
      carId,
      renterUsername,
      amount, // บันทึก amount
      startDate,
      endDate,
      rentalDays,
    });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลการสั่งซื้อ', error });
  }
});

// API: ดึงข้อมูลการสั่งซื้อทั้งหมด
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการสั่งซื้อ', error });
  }
});

// API: คืนเงิน (Refund)
app.post('/refund', async (req, res) => {
  try {
    const { carId } = req.body;

    // ลบข้อมูลใน orders, payments, และ rentals
    await Order.deleteMany({ carId });
    await Payment.deleteMany({ carId });
    await Rental.deleteMany({ carId });

    // เปลี่ยนสถานะรถเป็นว่าง (available)
    const updatedCar = await Car.findByIdAndUpdate(carId, { status: 'available' }, { new: true });

    if (!updatedCar) {
      return res.status(404).json({ message: 'ไม่พบรถที่ต้องการอัปเดต' });
    }

    res.status(200).json({ message: 'Refund สำเร็จ', updatedCar });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการคืนเงิน', error });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});