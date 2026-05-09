// models/Plot.js

const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    plotId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    plotName: {
      type: String,
      required: true,
      trim: true,
    },

    surveyNo: {
      type: String,
      required: true,
      trim: true,
    },

    zone: {
      type: String,
      required: true,
    },

    projectName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    plotImage: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/, // Indian pincode validation
    },

    latitude: {
      type: String,
    },

    longitude: {
      type: String,
    },

    plotSize: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      required: true,
      enum: ["Sq.ft", "Sq.m", "Acres", "Cents"],
    },

    dimensions: {
      type: String,
    },

    pricePerSqft: {
      type: String,
      required: true,
    },

    totalPrice: {
      type: String,
      required: true,
    },

    facing: {
      type: String,
      enum: ["North", "South", "East", "West"],
    },

    roadWidth: {
      type: String,
    },

    approvalType: {
      type: String,
      enum: ["DTCP", "CMDA", "Panchayat", "Other"],
    },

    cornerPlot: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Available", "Booked", "Sold", "Reserved", "Blocked"],
      default: "Available",
    },

    remarks: {
      type: String,
      default: "",
    },

    documents: [
      {
        type: String,
      },
    ],

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Plot", plotSchema);
