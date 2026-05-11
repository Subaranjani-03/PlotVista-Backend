const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name cannot exceed 30 characters"],
      match: [/^[A-Za-z ]+$/, "Name must contain only letters"],
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid Indian mobile number"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [20, "Password cannot exceed 20 characters"],
    },

    address: {
      type: String,
      default: "Not provided",
      maxlength: [200, "Address cannot exceed 200 characters"],
    },

    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
      max: [20, "Experience cannot exceed 20 years"],
    },

    role: {
      type: String,
      enum: {
        values: ["user", "admin", "agent"],
        message: "Role must be user, admin, or agent",
      },
      default: "user",
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be active or inactive",
      },
      default: "active",
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
