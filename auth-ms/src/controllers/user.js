const path = require("path");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userService = require("../services/user");
const { createConfig } = require("../config/config");

const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    const user = await userService.createUser({ email, password });
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const configPath = path.join(__dirname, "../../configs/.env");
    const appConfig = createConfig(configPath);

    const payload = { userId: user._id };
    const jwtSecret = appConfig.jwt.access_token;
    const jwtRefreshTokenSecret = appConfig.jwt.refresh_token;

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign(payload, jwtRefreshTokenSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAccessTokenByRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    const configPath = path.join(__dirname, "../../configs/.env");
    const appConfig = createConfig(configPath);
    const refreshTokenSecret = appConfig.jwt.refresh_token;

    jwt.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const userId = decoded.userId;

      const newAccessTokenPayload = { userId };
      const newAccessToken = jwt.sign(
        newAccessTokenPayload,
        appConfig.jwt.access_token,
        {
          expiresIn: "5m",
        },
      );

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  getAccessTokenByRefreshToken,
};
