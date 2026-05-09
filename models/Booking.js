const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plot",
      required: true,
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },

    visitDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },

    visitStatus: {
      type: String,
      enum: ["Pending", "Visited", "Not Visited"],
      default: "Pending",
    },

    visited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
