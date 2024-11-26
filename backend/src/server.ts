import express, { Request, Response, RequestHandler } from 'express';
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connectDB from './connection'; // Import your connection setup file

dotenv.config();

const app = express();
app.use(express.json());

// Define environment variable types
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Define TypeScript interface for the User schema
interface IUser extends Document {
  username: string;
  password: string;
  groceryList: string[];
  enabledStores: string[];
}

// Define Mongoose Schema and Model
const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  groceryList: { type: [String], default: [] },
  enabledStores: { type: [String], default: [] },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

// Signup Route
const signupHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    console.log("Received signup request:", req.body); // Log the request body to check if username/password are received correctly.

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' }); // Send a JSON response
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    console.log("User created:", newUser); // Log the created user.
    res.status(201).json({ message: 'User created successfully' }); // Send a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: "An unknown error occured" }); // Send a JSON response with error details
  }
};



// Login Route
const loginHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send('Username and password are required');
      return;
    }

    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      res.send({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error'});
  }
};

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Grocery List API!');
});

// Get Grocery List Route
const groceryListHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send('Authorization header missing');
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    res.send(user.groceryList);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

// Connect to the database before starting the server
connectDB()
  .then(() => {
    console.log('Database connected successfully');

    // Define routes after DB connection is established
    app.post('/signup', signupHandler);
    app.post('/login', loginHandler);
    app.get('/grocery-list', groceryListHandler);

    // Start the server after DB connection
    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
