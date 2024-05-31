const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const cookieSession = require("cookie-session");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const padelTeamRoutes = require('./routes/padelTeamRoutes');
const padelPlayerRoutes = require('./routes/padelPlayerRoutes');
const padelMatchStatRoutes = require('./routes/padelMatchStatRoutes');
const matchRoutes = require('./routes/matchRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const googleAuthConfig = require('./passport');

dotenv.config();
const app = express();

// Body parser middleware
app.use(express.json());

// setup session
app.use(
  cookieSession({ name: "session", keys: [process.env.SECRET_SESSION], maxAge: 24 * 60 * 60 * 100 })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware
app.use(cors({
  origin: 'https://statapp.in',
  // origin: 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent from the client
}));

// Google OAuth configuration
googleAuthConfig(passport);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/matches', matchRoutes);
app.use('/api/v1/padel-team-stat', padelTeamRoutes);
app.use('/api/v1/padel-player-stat', padelPlayerRoutes);
app.use('/api/v1/padel-match-stat', padelMatchStatRoutes);

// Error middleware
app.use(errorMiddleware);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
