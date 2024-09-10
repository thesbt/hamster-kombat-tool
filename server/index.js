require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const app = express();
const port = 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const DEFAULT_IMAGE_URL =
  "https://res.cloudinary.com/dquxlbwmd/image/upload/v1725012351/hamster/qwawyy6fabmtfazqmvcv.webp";

//FOR TESTING


const limiter = rateLimit({
  windowMs: 1,
  max: Infinity,
});


/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
});

*/

app.use(limiter);
app.use(express.json());

app.use(
  cors({
    origin: ["https://hamsterkombattool.site", "http://localhost:3000", "http://192.168.1.20:3000"], // remove localhost later
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Cloudinary yapılandırması
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// E-posta gönderici yapılandırması
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS için true, 587 portu için false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Şifre sıfırlama talebi
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await pool.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 saat geçerli

    await pool.query(
      "UPDATE Users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
      [token, expires, email]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Hamster Kombat Tool Password Reset",
      text: `To reset your password, please click the following link:\n Link is valid for 1 hour\n\n${resetUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "E-posta gönderilemedi" });
      }
      res.json({ message: "Şifre sıfırlama e-postası gönderildi" });
    });
  } catch (err) {
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// Şifre sıfırlama
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM Users WHERE reset_password_token = $1 AND reset_password_expires > $2",
      [token, new Date()]
    );

    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Geçersiz veya süresi dolmuş token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE Users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, user.rows[0].id]
    );

    res.json({ message: "Şifre başarıyla sıfırlandı" });
  } catch (err) {
    res.status(500).json({ error: "Bir hata oluştu" });
  }
});

// Yeni endpoint: Token doğrulama
app.post("/api/verify-reset-token", async (req, res) => {
  const { token } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM Users WHERE reset_password_token = $1 AND reset_password_expires > $2",
      [token, new Date()]
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: "Token doğrulanamadı" });
  }
});

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await pool.query(
      "SELECT id, username, is_admin FROM Users WHERE id = $1",
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.sendStatus(403);
    }

    req.user = user.rows[0];
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
};

const deleteCardAndUserCards = async (cardId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Kullanıcılardan kart silme
    await client.query("DELETE FROM user_cards WHERE card_id = $1", [cardId]);

    // Kart tablosundan silme
    await client.query("DELETE FROM cards WHERE id = $1", [cardId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const addNewDefaultCardToAllUsers = async (cardId) => {
  const client = await pool.connect();
  try {
    const users = await client.query("SELECT id FROM Users");
    const cardDetails = await client.query(
      "SELECT base_cost, base_hourly_earnings FROM cards WHERE id = $1",
      [cardId]
    );

    if (cardDetails.rows.length === 0) {
      throw new Error("Card not found");
    }

    const { base_cost, base_hourly_earnings } = cardDetails.rows[0];

    for (const user of users.rows) {
      await client.query(
        "INSERT INTO user_cards (user_id, card_id, level, current_cost, current_hourly_earnings) " +
          "VALUES ($1, $2, 1, $3, $4) " +
          "ON CONFLICT (user_id, card_id) DO NOTHING",
        [user.id, cardId, base_cost, base_hourly_earnings]
      );
    }
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
};

app.get("/api/user-info", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, email, is_admin FROM Users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching user info" });
  }
});

const addDefaultCardsToUser = async (userId) => {
  const client = await pool.connect();
  try {
    const defaultCardsQuery = "SELECT id FROM cards WHERE is_default = TRUE";
    const defaultCardsResult = await client.query(defaultCardsQuery);
    const defaultCards = defaultCardsResult.rows;
    const cardDetailsQuery =
      "SELECT id, base_cost, base_hourly_earnings FROM cards WHERE id = ANY($1)";
    const cardIds = defaultCards.map((card) => card.id);
    const cardDetailsResult = await client.query(cardDetailsQuery, [cardIds]);
    const cardDetailsMap = cardDetailsResult.rows.reduce((acc, card) => {
      acc[card.id] = {
        current_cost: card.base_cost,
        current_hourly_earnings: card.base_hourly_earnings,
      };
      return acc;
    }, {});

    const insertPromises = defaultCards.map((card) => {
      const details = cardDetailsMap[card.id];
      return client.query(
        "INSERT INTO user_cards (user_id, card_id, level, current_cost, current_hourly_earnings) " +
          "VALUES ($1, $2, 1, $3, $4) " +
          "ON CONFLICT (user_id, card_id) DO UPDATE " +
          "SET level = EXCLUDED.level, current_cost = EXCLUDED.current_cost, current_hourly_earnings = EXCLUDED.current_hourly_earnings",
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

const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const usernameRegex = /^[a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]+$/;

app.post("/api/register", async (req, res) => {
  const { password, email } = req.body;
  const username = req.body.username.toLowerCase(); // Username'i hemen küçük harfe çeviriyoruz
  const hashedPassword = await bcrypt.hash(password, 10);

  if (
    !username ||
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 12 ||
    !usernameRegex.test(username)
  ) {
    return res
      .status(400)
      .json({ error: "Username must be between 3 and 12 characters" });
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 18
  ) {
    return res
      .status(400)
      .json({ error: "Password must be between 6 and 18 characters" });
  }
  if (!email || typeof email !== "string" || email.length > 100) {
    return res.status(400).json({ error: "Email is too long" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const checkQuery = `
      SELECT
        (SELECT COUNT(*) FROM Users WHERE username = $1) AS username_exists,
        (SELECT COUNT(*) FROM Users WHERE email = $2) AS email_exists
    `;
    const { rows } = await pool.query(checkQuery, [username, email]);

    const { username_exists, email_exists } = rows[0];

    if (parseInt(username_exists) > 0 || parseInt(email_exists) > 0) {
      return res.status(400).json({ error: "user_already_exists" });
    }

    const result = await pool.query(
      "INSERT INTO Users (username, password_hash, email) VALUES ($1, $2, LOWER($3)) RETURNING id, username, email",
      [username, hashedPassword, email]
    );

    const userId = result.rows[0].id;

    await addDefaultCardsToUser(userId);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "registration_error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    !username ||
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 12
  ) {
    return res.status(400).json({ error: "Invalid username" });
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 18
  ) {
    return res.status(400).json({ error: "Invalid password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id },
      SECRET_KEY,
      { expiresIn: "30d" } // Token'ın 30 gün geçerli olmasını sağlar
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "An error occurred during login" });
  }
});

app.get("/api/admin/cards", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Cards");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching cards" });
  }
});

app.post("/api/admin/cards", authenticateToken, isAdmin, async (req, res) => {
  const {
    name,
    image_url,
    base_cost,
    base_hourly_earnings,
    card_category,
    has_timer,
    is_default,
  } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO Cards (name, image_url, base_cost, base_hourly_earnings, card_category, has_timer, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        name,
        image_url || DEFAULT_IMAGE_URL, // Eğer image_url boşsa, varsayılan URL'yi kullan
        base_cost,
        base_hourly_earnings,
        card_category,
        has_timer,
        is_default,
      ]
    );

    if (is_default) {
      await addNewDefaultCardToAllUsers(result.rows[0].id);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while adding the card" });
  }
});

app.put(
  "/api/admin/cards/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      image_url,
      base_cost,
      base_hourly_earnings,
      card_category,
      has_timer,
      is_default,
    } = req.body;
    try {
      const result = await pool.query(
        "UPDATE Cards SET name = $1, image_url = $2, base_cost = $3, base_hourly_earnings = $4, card_category = $5, has_timer = $6, is_default = $7 WHERE id = $8 RETURNING *",
        [
          name,
          image_url || DEFAULT_IMAGE_URL, // Eğer image_url boşsa, varsayılan URL'yi kullan
          base_cost,
          base_hourly_earnings,
          card_category,
          has_timer,
          is_default,
          id,
        ]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Card not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res
        .status(500)
        .json({ error: "An error occurred while updating the card" });
    }
  }
);

app.delete(
  "/api/admin/cards/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      await deleteCardAndUserCards(id);
      res.json({ message: "Card deleted successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the card" });
    }
  }
);

app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Cards");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching cards" });
  }
});

app.get("/api/user-cards", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT Cards.*, User_Cards.level, User_Cards.current_cost, User_Cards.current_hourly_earnings, Cards.card_category, Cards.has_timer " +
        "FROM User_Cards " +
        "JOIN Cards ON User_Cards.card_id = Cards.id " +
        "WHERE User_Cards.user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).send("An error occurred while fetching user cards");
  }
});

app.post("/api/user-cards", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { card_id, level, current_cost, current_hourly_earnings } = req.body;

    if (level <= 0 || level > 999) {
      return res.status(400).json({ error: "Invalid Level" });
    }
    if (current_cost <= 0 || current_cost > 9999999999999999) {
      return res.status(400).json({ error: "Invalid Cost" });
    }
    if (current_hourly_earnings <= 0 || current_hourly_earnings > 9999999999) {
      return res.status(400).json({ error: "Invalid PPH" });
    }

    const result = await pool.query(
      "INSERT INTO User_Cards (user_id, card_id, level, current_cost, current_hourly_earnings) " +
        "VALUES ($1, $2, $3, $4, $5) " +
        "ON CONFLICT (user_id, card_id) DO UPDATE " +
        "SET level = EXCLUDED.level, current_cost = EXCLUDED.current_cost, current_hourly_earnings = EXCLUDED.current_hourly_earnings " +
        "RETURNING *",
      [userId, card_id, level, current_cost, current_hourly_earnings]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .send("An error occurred while adding or updating user cards");
  }
});

app.put("/api/user-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { current_cost, current_hourly_earnings, level } = req.body;

  if (level <= 0 || level > 999) {
    return res.status(400).json({ error: "Invalid Level" });
  }
  if (current_cost <= 0 || current_cost > 9999999999999999) {
    return res.status(400).json({ error: "Invalid Cost" });
  }
  if (current_hourly_earnings <= 0 || current_hourly_earnings > 9999999999) {
    return res.status(400).json({ error: "Invalid PPH" });
  }

  try {
    const result = await pool.query(
      "UPDATE user_cards SET current_cost = $1, current_hourly_earnings = $2, level = $3 WHERE card_id = $4 AND user_id = $5 RETURNING *",
      [current_cost, current_hourly_earnings, level, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Card not found or you do not have permission to update it",
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while updating the card" });
  }
});

app.delete("/api/user-cards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const defaultCardCheck = await pool.query(
      "SELECT is_default FROM cards WHERE id = $1",
      [id]
    );

    if (
      defaultCardCheck.rows.length > 0 &&
      defaultCardCheck.rows[0].is_default
    ) {
      return res.status(400).json({ error: "Default cards cannot be deleted" });
    }

    const result = await pool.query(
      "DELETE FROM user_cards WHERE card_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Card not found or you do not have permission to delete it",
      });
    }
    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the card" });
  }
});

app.get("/api/card-levels/:cardId", async (req, res) => {
  const { cardId } = req.params;

  try {
    const result = await pool.query(
      "SELECT level, base_cost, base_hourly_earnings FROM card_levels WHERE card_id = $1",
      [cardId]
    );

    if (result.rows.length > 0) {
      return res.json(result.rows); // Tüm seviyeleri döndür
    } else {
      return res.status(404).json({ error: "Values not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
