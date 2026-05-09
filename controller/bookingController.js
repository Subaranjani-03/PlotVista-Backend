const Booking = require("../models/Booking");
const Plot = require("../models/Plot");
const User = require("../models/User");

const generateBookingId = () => {
  return "BK-" + Date.now().toString().slice(-6);
};

// ================= CREATE BOOKING =================
exports.createBooking = async (req, res) => {
  try {
    const { userId, plotId } = req.body;

    // CHECK ALREADY BOOKED BY SAME USER
    const existing = await Booking.findOne({
      userId,
      plotId,
      status: { $ne: "Cancelled" },
    });

    if (existing) {
      return res.json({
        status: false,
        message: "Plot already booked",
      });
    }

    const plot = await Plot.findById(plotId).populate(
      "assignedAgent",
      "name phone",
    );

    if (!plot) {
      return res.json({
        status: false,
        message: "Plot not found",
      });
    }

    const booking = new Booking({
      bookingId: generateBookingId(),
      userId,
      plotId,
      assignedAgent: plot.assignedAgent || null,
    });

    await booking.save();

    res.json({
      status: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= GET USER BOOKINGS =================
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const bookings = await Booking.find({ userId })
      .populate("plotId")
      .populate("assignedAgent", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      data: bookings,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= CANCEL BOOKING =================
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: "Cancelled",
      },
      { new: true },
    );

    res.json({
      status: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= GET ALL BOOKINGS (ADMIN) =================

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("plotId")
      .populate("userId", "name email")
      .populate("assignedAgent", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      data: bookings,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= GET AGENT BOOKINGS =================
exports.getAgentBookings = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const bookings = await Booking.find({
      assignedAgent: agentId,
    })
      .populate("plotId")
      .populate("userId", "name email phone")
      .populate("assignedAgent", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      data: bookings,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= ASSIGN AGENT TO BOOKING =================

exports.assignAgentToBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const { agentId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        status: false,
        message: "Booking not found",
      });
    }

    // UNASSIGN
    if (agentId === null) {
      booking.assignedAgent = null;

      await booking.save();

      return res.json({
        status: true,
        message: "Agent unassigned successfully",
        data: booking,
      });
    }

    // CHECK AGENT
    const agent = await User.findOne({
      _id: agentId,
      role: "agent",
    });

    if (!agent) {
      return res.json({
        status: false,
        message: "Agent not found",
      });
    }

    booking.assignedAgent = agentId;

    await booking.save();

    res.json({
      status: true,
      message: "Agent assigned successfully",
      data: booking,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
// ================= UPDATE VISIT STATUS =================

exports.updateVisitStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const { visitStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        visitStatus,
        visited: visitStatus === "Visited",
      },
      { new: true },
    );

    res.json({
      status: true,
      message: "Visit status updated",
      data: booking,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= AGENT CUSTOMERS =================
exports.getAgentCustomers = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const bookings = await Booking.find({
      assignedAgent: agentId,
    }).populate("userId");

    // REMOVE DUPLICATES
    const uniqueCustomers = [];

    const customerIds = new Set();

    bookings.forEach((booking) => {
      if (booking.userId && !customerIds.has(booking.userId._id.toString())) {
        customerIds.add(booking.userId._id.toString());

        uniqueCustomers.push(booking.userId);
      }
    });

    res.json({
      status: true,
      data: uniqueCustomers,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ================= SCHEDULE VISIT =================

exports.scheduleVisit = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const { visitDate } = req.body;

    const formattedDate = new Date(visitDate);

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        visitDate: formattedDate,
      },
      { new: true },
    );

    res.json({
      status: true,
      message: "Visit scheduled successfully",
      data: booking,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
