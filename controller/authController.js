const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const generateUserId = (role) => {
  const uniquePart = Date.now().toString().slice(-6);

  return role === "agent" ? `AGT-${uniquePart}` : `USR-${uniquePart}`;
};

// ======================================
// AUTH APIs (REGISTER / LOGIN)
// ======================================

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;

    const existing = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existing) {
      return res.json({
        status: false,
        message: "User already exists",
      });
    }

    // 🔐 STEP: HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: generateUserId("user"),
      name,
      phone,
      email,
      password: hashedPassword, // IMPORTANT CHANGE
      address,
      role: "user",
      status: "active",
    });

    await newUser.save();

    res.json({
      status: true,
      message: "User Registered",
      data: newUser,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    // =========================
    // DEFAULT ADMIN LOGIN
    // =========================
    if (role === "admin" && phone === "9999999999" && password === "admin123") {
      const token = jwt.sign(
        {
          role: "admin",
          phone: "9999999999",
        },
        process.env.JWT_SECRET,
      );

      return res.json({
        status: true,
        message: "Admin Login Successful",
        token,
        data: {
          name: "Admin",
          phone: "9999999999",
          role: "admin",
          status: "active",
        },
      });
    }

    // =========================
    // NORMAL USER / AGENT LOGIN
    // =========================
    const user = await User.findOne({ phone, role });

    if (!user) {
      return res.json({
        status: false,
        message: "Invalid credentials or role",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        status: false,
        message: "Invalid password",
      });
    }

    if (user.status !== "active") {
      return res.json({
        status: false,
        message: "User inactive",
      });
    }

    // =========================
    // CREATE TOKEN (NO EXPIRY)
    // =========================
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
    );

    return res.json({
      status: true,
      message: "Login Successful",
      token,
      data: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

// ======================================
// USER APIs
// ======================================

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate(
      "assignedAgent",
      "name phone email",
    );

    res.json({
      status: true,
      data: users,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address } = req.body;

    // ✅ check duplicate email/phone
    const existing = await User.findOne({
      $or: [{ email }, { phone }],
      _id: { $ne: userId },
    });

    if (existing) {
      return res.json({
        status: false,
        message: "Email or phone already exists",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, address },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    res.json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};
// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const userDelete = await User.deleteOne({
      _id: userId,
      role: "user",
    });

    if (userDelete.deletedCount > 0) {
      return res.status(200).send({
        status: true,
        message: "User deleted successfully",
      });
    }

    return res.status(404).send({
      status: false,
      message: "No user deleted",
    });
  } catch (err) {
    return res.status(400).send({
      status: false,
      message: err.message,
    });
  }
};

// ======================================
// AGENT APIs
// ======================================

// CREATE AGENT
exports.createAgent = async (req, res) => {
  try {
    const { name, phone, email, password, address, experience } = req.body;

    const existing = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (existing) {
      return res.json({
        status: false,
        message: "Agent already exists",
      });
    }

    // 🔐 HASH PASSWORD (IMPORTANT FIX)
    const hashedPassword = await bcrypt.hash(password, 10);

    const agent = new User({
      userId: generateUserId("agent"),
      name,
      phone,
      email,
      password: hashedPassword, // ✅ FIXED
      address,
      experience,
      role: "agent",
      status: "active",
    });

    await agent.save();

    res.json({
      status: true,
      message: "Agent Created",
      data: agent,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// UPDATE AGENT
exports.updateAgent = async (req, res) => {
  try {
    const agentId = req.params.id;

    const updateData = { ...req.body };

    // REMOVE PASSWORD IF EMPTY OR NOT GIVEN
    if (!updateData.password) {
      delete updateData.password;
    }

    const updatedAgent = await User.findOneAndUpdate(
      { _id: agentId, role: "agent" },
      updateData,
      { new: true },
    );

    if (!updatedAgent) {
      return res.status(404).send({
        status: false,
        message: "Agent not found",
      });
    }

    res.status(200).send({
      status: true,
      message: "Agent updated successfully",
      data: updatedAgent,
    });
  } catch (err) {
    res.status(400).send({
      status: false,
      message: err.message,
    });
  }
};

// DELETE AGENT
exports.deleteAgent = async (req, res) => {
  try {
    const agentId = req.params.id;

    const agentDelete = await User.deleteOne({
      _id: agentId,
      role: "agent",
    });

    if (agentDelete.deletedCount > 0) {
      return res.status(200).send({
        status: true,
        message: "Agent deleted successfully",
      });
    }

    return res.status(404).send({
      status: false,
      message: "No agent deleted",
    });
  } catch (err) {
    return res.status(400).send({
      status: false,
      message: err.message,
    });
  }
};

// ======================================
// COMMON APIs
// ======================================

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.json({
        status: false,
        message: "Invalid status",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    );

    if (!updatedUser) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    res.json({
      status: true,
      message: "Status Updated",
      data: updatedUser,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ASSIGN AGENT
exports.assignAgent = async (req, res) => {
  try {
    const userId = req.params.id;
    const { agentId } = req.body;

    if (!agentId) {
      return res.json({
        status: false,
        message: "Agent ID required",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: "user" },
      { assignedAgent: agentId },
      { new: true },
    );

    if (!updatedUser) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    res.json({
      status: true,
      message: "Agent assigned successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};
