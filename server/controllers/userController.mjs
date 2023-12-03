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
      console.log("here1");
      return res.status(401).json({ message: "User does not exist." });
    }

    // Verify the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordValid) {
      console.log("here2");
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
    req.session.destroy();
    res.json({ message: "User Logged Out" });
  } catch (err) {
    console.error(err);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      console.log("authorized");
      next(); // User is authenticated
    }
    console.log(req.session);
    res.status(401).json({ message: "Unauthorized" });
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
    const user = req.session.user;
    res.json({ user });
  } catch (err) {
    console.error(err);
  }
};

export const sendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id } = req.session.user;

    // Check if request already exists
    const existingRequest = await pool.query(
      "SELECT * FROM friends WHERE requester_id = $1 AND receiver_id = $2",
      [id, userId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: "Friend Request already sent" });
    }

    // Insert new friend request
    await pool.query(
      "INSERT INTO friends (requester_id, receiver_id, status) VALUES ($1, $2, $3)",
      [id, userId, "pending"]
    );
    res.json({ message: "Friend Request Sent" });
  } catch (err) {
    console.error(err);
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id } = req.session.user;

    // Check if a request did exist
    const existingRequest = await pool.query(
      "SELECT * FROM friends WHERE requester_id = $1 AND receiver_id = $2",
      [userId, id]
    );

    if (existingRequest.rows.length == 0) {
      return res.status(400).json("There is no friend request to accept");
    }

    // Change Status of request row to accepted
    await pool.query(
      "UPDATE friends SET status = $1, created_at = $2 WHERE requester_id = $3 AND receiver_id = $4",
      ["accepted", new Date(), userId, id]
    );

    // Insert row into friends to complete friendship
    await pool.query(
      "INSERT INTO friends (requester_id, receiver_id, status) VALUES ($1, $2, $3)",
      [id, userId, "accepted"]
    );

    res.json({ message: "Friend Request Accepted" });
  } catch (err) {
    console.error(err);
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id } = req.session.user;

    await pool.query(
      "DELETE FROM friends WHERE requester_id = $1 AND receiver_id = $2 OR requester_id = $2 AND receiver_id = $1",
      [userId, id]
    );

    res.json({ message: "You are no longer friends" });
  } catch (err) {
    console.error(err);
  }
};

export const checkFriendStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id } = req.session.user;

    // Grab rows from friends
    const friendship = await pool.query(
      "SELECT * FROM friends WHERE requester_id = $1 AND receiver_id = $2 OR requester_id = $2 AND receiver_id = $1",
      [userId, id]
    );

    if (friendship.rows.length == 2) {
      return res.json({ status: "Friends" });
    } else if (friendship.rows.length == 0) {
      return res.json({ status: "Add Friend" });
    }

    res.json({
      status: "Pending Request",
      requester: friendship.rows[0].requester_id,
    });
  } catch (err) {
    console.error(err);
  }
};
