import pool from "../db/index.mjs";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert a new user into the database
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    req.session.user = newUser.rows[0];

    res.json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user in the database by email
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User does not exist." });
    }

    // Verify the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    req.session.user = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      username: user.rows[0].username,
    };

    res.json({
      message: "User logged in successfully.",
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        username: user.rows[0].username,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const logout = async (req, res) => {
  try {
    req.session.user = null;
    res.json({ message: "User Logged Out" });
  } catch (err) {
    console.error(err);
  }
};

export const checkAuth = async (req, res) => {
  try {
    if (!req.session.user) {
      res.send({ isLoggedIn: false });
    } else {
      req.session.save();
      res.send({ isLoggedIn: true, user: req.session.user });
    }
  } catch (err) {
    console.error(err);
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const userReviews = await pool.query(
      "SELECT * FROM reviews WHERE user_id = $1",
      [userId]
    );

    res.json({ userReviews: userReviews.rows });
  } catch (err) {
    console.error(err);
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (existingUser.rows < 1)
      return res.status(400).json({ message: "User not found" });
    res.json({ user: existingUser.rows[0], message: "User Found" });
  } catch (err) {
    console.error(err);
  }
};
