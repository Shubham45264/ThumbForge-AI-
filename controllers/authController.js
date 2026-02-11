const User = require("../models/user.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/* ======================
   REGISTER
====================== */
exports.register = async (request, reply) => {
  try {
    const { name, email, password, country } = request.body;

    // Validate fields
    if (!name || !email || !password) {
      return reply.code(400).send({
        message: "Name, email and password are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return reply.code(400).send({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ FIX HERE
    const user = new User({
      name,
      email,
      country,
      password: hashedPassword   // ✅ correct
    });

    await user.save();

    reply.code(201).send({
      message: "User registered successfully"
    });

  } catch (error) {
    reply.code(500).send({
      error: "Registration failed",
      message: error.message
    });
  }
};

/* ======================
   LOGIN
====================== */
exports.login = async (request, reply) => {
  try {
    const { email, password } = request.body || {};

    // ✅ INPUT VALIDATION (prevents bcrypt crash)
    if (!email || !password) {
      return reply.code(400).send({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(400).send({
        message: "Invalid email or password"
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.code(400).send({
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = request.server.jwt.sign({
      id: user._id
    });

    reply.send({ token });

  } catch (error) {
    reply.code(500).send({
      error: "Login failed",
      message: error.message
    });
  }
};


/* ======================
   FORGOT PASSWORD
====================== */
exports.forgotpassword = async (request, reply) => {
  try {
    const { email } = request.body;

    const user = await User.findOne({ email });
    if (!user) {
      return reply.notFound("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    user.resetpasswordtoken = resetToken;
    user.resetpasswordExpiry = resetPasswordExpire;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`;

    reply.send({ resetUrl });

  } catch (error) {
    reply.code(500).send({
      error: "Forgot password failed",
      message: error.message
    });
  }
};

/* ======================
   RESET PASSWORD
====================== */
exports.resetpassword = async (request, reply) => {
  try {
    const resetToken = request.params.token;
    const { newPassword } = request.body;

    const user = await User.findOne({
      resetpasswordtoken: resetToken,
      resetpasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return reply.badRequest("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetpasswordtoken = undefined;
    user.resetpasswordExpiry = undefined;

    await user.save();

    reply.send({ message: "Password reset successfully" });

  } catch (error) {
    reply.code(500).send({
      error: "Reset password failed",
      message: error.message
    });
  }
};

/* ======================
   LOGOUT
====================== */
exports.logout = async (request, reply) => {
  reply.send({ message: "Logout successful" });
};
