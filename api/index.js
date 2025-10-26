import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors package
import userRouter from './Routes/user.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
dotenv.config();


const __dirname = path.resolve();
// dotenv.config({ path: path.join(__dirname, 'api', '.env') }); // changed to load api/.env
const app = express();

// Use cors middleware
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend domain
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.use("/api/user", userRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
