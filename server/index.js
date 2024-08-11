const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);
app.use(express.json());
app.use(cors());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

const deleteCardAndUserCards = async (cardId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Kullanıcılardan kart silme
    await client.query('DELETE FROM user_cards WHERE card_id = $1', [cardId]);

    // Kart tablosundan silme
    await client.query('DELETE FROM cards WHERE id = $1', [cardId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

app.get('/api/user-info', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, email, is_admin FROM Users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching user info' });
  }
});

const addDefaultCardsToUser = async (userId) => {
  const client = await pool.connect();
  try {
    const defaultCardsQuery = 'SELECT id FROM cards WHERE is_default = TRUE';
    const defaultCardsResult = await client.query(defaultCardsQuery);
    const defaultCards = defaultCardsResult.rows;
    const cardDetailsQuery = 'SELECT id, base_cost, base_hourly_earnings FROM cards WHERE id = ANY($1)';
    const cardIds = defaultCards.map(card => card.id);
    const cardDetailsResult = await client.query(cardDetailsQuery, [cardIds]);
    const cardDetailsMap = cardDetailsResult.rows.reduce((acc, card) => {
      acc[card.id] = {
        current_cost: card.base_cost,
        current_hourly_earnings: card.base_hourly_earnings
      };
      return acc;
    }, {});

    const insertPromises = defaultCards.map(card => {
      const details = cardDetailsMap[card.id];
      return client.query(
        'INSERT INTO user_cards (user_id, card_id, level, current_cost, current_hourly_earnings) ' +
        'VALUES ($1, $2, 1, $3, $4) ' +
        'ON CONFLICT (user_id, card_id) DO UPDATE ' +
        'SET level = EXCLUDED.level, current_cost = EXCLUDED.current_cost, current_hourly_earnings = EXCLUDED.current_hourly_earnings',
        [userId, card.id, details.current_cost, details.current_hourly_earnings]
      );
    });

    await Promise.all(insertPromises);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const checkQuery = `
      SELECT
        (SELECT COUNT(*) FROM Users WHERE username = $1) AS username_exists,
        (SELECT COUNT(*) FROM Users WHERE email = $2) AS email_exists
    `;
    const { rows } = await pool.query(checkQuery, [username, email]);
    
    const { username_exists, email_exists } = rows[0];

    if (parseInt(username_exists) > 0 || parseInt(email_exists) > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const result = await pool.query(
      'INSERT INTO Users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, hashedPassword, email]
    );
    
    const userId = result.rows[0].id;

    await addDefaultCardsToUser(userId);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({ token, is_admin: user.is_admin });
  } catch (err) {
    console.error(err); // Log hata detayları
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.get('/api/admin/cards', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Cards');
    res.json(result.rows);
  } catch (err) {
    console.error(err); // Log hata detayları
    res.status(500).json({ error: 'An error occurred while fetching cards' });
  }
});

app.post('/api/admin/cards', authenticateToken, isAdmin, async (req, res) => {
  const { name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Cards (name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default]
    );

    if (is_default) {
      const users = await pool.query('SELECT id FROM Users');
      for (const user of users.rows) {
        await addDefaultCardsToUser(user.id);
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err); // Log hata detayları
    res.status(500).json({ error: 'An error occurred while adding the card' });
  }
});

app.put('/api/admin/cards/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Cards SET name = $1, image_url = $2, base_cost = $3, base_hourly_earnings = $4, card_category = $5, has_timer = $6, is_default = $7 WHERE id = $8 RETURNING *',
      [name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the card' });
  }
});

app.delete('/api/admin/cards/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCardAndUserCards(id);
    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the card' });
  }
});

app.get('/api/cards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Cards');
    res.json(result.rows);
  } catch (err) {
    console.error(err); // Log hata detayları
    res.status(500).json({ error: 'An error occurred while fetching cards' });
  }
});


app.get('/api/user-cards', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT Cards.*, User_Cards.level, User_Cards.current_cost, User_Cards.current_hourly_earnings, Cards.card_category, Cards.has_timer ' +
      'FROM User_Cards ' +
      'JOIN Cards ON User_Cards.card_id = Cards.id ' +
      'WHERE User_Cards.user_id = $1',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).send('An error occurred while fetching user cards');
  }
});

app.post('/api/user-cards', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { card_id, level, current_cost, current_hourly_earnings } = req.body;

  if (!Number.isInteger(level) || level <= 0 || level >= 1000 ) {
    return res.status(400).json({ error: 'Invalid level' });
  }
  if (current_cost <= 0 || current_cost >= 9999999999999) {
    return res.status(400).json({ error: 'Invalid current_cost' });
  }
  if (current_hourly_earnings <= 0 || current_hourly_earnings >= 9999999999) {
    return res.status(400).json({ error: 'Invalid current_hourly_earnings' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO User_Cards (user_id, card_id, level, current_cost, current_hourly_earnings) ' +
      'VALUES ($1, $2, $3, $4, $5) ' +
      'ON CONFLICT (user_id, card_id) DO UPDATE ' +
      'SET level = EXCLUDED.level, current_cost = EXCLUDED.current_cost, current_hourly_earnings = EXCLUDED.current_hourly_earnings ' +
      'RETURNING *',
      [userId, card_id, level, current_cost, current_hourly_earnings]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send('An error occurred while adding or updating user cards');
  }
});

app.put('/api/user-cards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { current_cost, current_hourly_earnings } = req.body;

  // Doğrulama
  if (!Number.isInteger(level) || level <= 0 || level >= 1000 ) {
    return res.status(400).json({ error: 'Invalid level' });
  }
  if (current_cost <= 0 || current_cost >= 9999999999999) {
    return res.status(400).json({ error: 'Invalid current_cost' });
  }
  if (current_hourly_earnings <= 0 || current_hourly_earnings >= 9999999999) {
    return res.status(400).json({ error: 'Invalid current_hourly_earnings' });
  }


  try {
    const cardCheck = await pool.query('SELECT * FROM user_cards WHERE card_id = $1 AND user_id = $2', [id, req.user.id]);

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found or you do not have permission to update it' });
    }

    const result = await pool.query(
      'UPDATE user_cards SET current_cost = $1, current_hourly_earnings = $2 WHERE card_id = $3 AND user_id = $4 RETURNING *',
      [current_cost, current_hourly_earnings, id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while updating the card' });
  }
});

app.delete('/api/user-cards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const defaultCardCheck = await pool.query(
      'SELECT is_default FROM cards WHERE id = $1',
      [id]
    );

    if (defaultCardCheck.rows.length > 0 && defaultCardCheck.rows[0].is_default) {
      return res.status(400).json({ error: 'Default cards cannot be deleted' });
    }

    const result = await pool.query(
      'DELETE FROM user_cards WHERE card_id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found or you do not have permission to delete it' });
    }
    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while deleting the card' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});