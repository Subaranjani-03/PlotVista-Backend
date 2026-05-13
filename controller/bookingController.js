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

    // CHECK SAME USER ALREADY BOOKED

    const existingBooking = await Booking.findOne({
      userId,
      plotId,
      status: { $ne: "Cancelled" },
    });

    if (existingBooking) {
      return res.json({
        status: false,
        message: "You already booked this plot",
      });
    }

    // CHECK ANY ACTIVE BOOKING EXISTS

    const existingPlotBooking = await Booking.findOne({
      plotId,
      status: { $ne: "Cancelled" },
    });

    if (existingPlotBooking) {
      return res.json({
        status: false,
        message: "This plot is already booked",
      });
    }

    // GET PLOT

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

    // BLOCK SOLD PLOTS

    if (plot.status !== "Available") {
      return res.json({
        status: false,
        message: "Plot is not available",
      });
    }

    // CREATE BOOKING

    const booking = new Booking({
      bookingId: generateBookingId(),
      userId,
      plotId,
      assignedAgent: null,
      status: "Pending",
    });

    await booking.save();

    // UPDATE PLOT STATUS => BOOKED

    await Plot.findByIdAndUpdate(plotId, {
      status: "Booked",
    });

    res.json({
      status: true,
      message: "Booking created successfully",
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

// ================= GET USER BOOKINGS =================

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    const bookings = await Booking.find({ userId })
      .populate("plotId")
      .populate("assignedAgent", "name phone experience")
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
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.json({
        status: false,
        message: "Booking not found",
      });
    }

    // RELEASE PLOT

    await Plot.findByIdAndUpdate(booking.plotId, {
      status: "Available",
      assignedAgent: null,
    });

    // DELETE BOOKING

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      status: true,
      message: "Booking removed successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// ================= GET ALL BOOKINGS =================

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("plotId")
      .populate("userId", "name email")
      .populate("assignedAgent", "name phone experience")
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
      .populate("assignedAgent", "name phone experience")
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

// ================= ASSIGN AGENT =================

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

      await Plot.findByIdAndUpdate(booking.plotId, {
        assignedAgent: null,
      });

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

    // UPDATE PLOT AGENT ALSO

    await Plot.findByIdAndUpdate(booking.plotId, {
      assignedAgent: agentId,
    });

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
        // status: "Scheduled",
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

// ================= MAKE PAYMENT =================

exports.makePayment = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        status: false,
        message: "Booking not found",
      });
    }

    // BLOCK DOUBLE PAYMENT

    if (booking.paymentStatus === "Paid") {
      return res.json({
        status: false,
        message: "Payment already completed",
      });
    }

    // UPDATE BOOKING

    booking.paymentStatus = "Paid";

    booking.paymentDate = new Date();

    // booking.status = "Approved";

    await booking.save();

    // UPDATE PLOT STATUS => SOLD

    await Plot.findByIdAndUpdate(booking.plotId, {
      status: "Sold",
    });

    res.json({
      status: true,
      message: "Payment completed successfully",
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

// ================= UPDATE REMARKS =================

exports.updateRemarks = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const { remarks } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        remarks,
      },
      { new: true },
    );

    res.json({
      status: true,
      message: "Remarks updated successfully",
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

// ================= UPDATE BOOKING STATUS =================

exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const { status } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({
        status: false,
        message: "Booking not found",
      });
    }

    // ================= CANCELLED =================

    if (status === "Cancelled") {
      // RESET BOOKING

      booking.assignedAgent = null;

      booking.paymentStatus = "Pending";

      booking.visitStatus = "Pending";

      booking.visited = false;

      booking.visitDate = null;

      // RELEASE PLOT

      await Plot.findByIdAndUpdate(booking.plotId, {
        status: "Available",
        assignedAgent: null,
      });
    }

    // ================= APPROVED =================

    if (status === "Approved") {
      await Plot.findByIdAndUpdate(booking.plotId, {
        status: "Sold",
      });
    }

    // ================= PENDING / ASSIGNED / SCHEDULED =================

    // ================= PENDING / ASSIGNED / SCHEDULED / CONFIRMED =================

    if (
      status === "Pending" ||
      status === "Assigned" ||
      status === "Scheduled" ||
      status === "Confirmed"
    ) {
      await Plot.findByIdAndUpdate(booking.plotId, {
        status: "Booked",
      });
    }

    booking.status = status;

    await booking.save();

    res.json({
      status: true,
      message: "Booking status updated",
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
