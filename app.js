
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');
const adminRoutes = require('./routes/admin');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
