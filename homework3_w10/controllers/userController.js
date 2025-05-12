// controllers/userController.js
const bcrypt = require('bcryptjs');
const { database } = require('../config/cosmosClient');
const User = require('../models/userModel');

const containerId = 'users';

async function registerUser(req, res) {
  const { username, password } = req.body;

  try {
    const db = await database();
    const container = db.container("users");

    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.username = @username',
        parameters: [{ name: '@username', value: username }],
      })
      .fetchAll();

    if (resources.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User(username, passwordHash);

    await container.items.create(user);

    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function loginUser(req, res) {
  const { username, password } = req.body;

  try {
    const db = await database();
    const container = db.container("users");

    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.username = @username',
        parameters: [{ name: '@username', value: username }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = resources[0];
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { registerUser, loginUser };
