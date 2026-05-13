const express = require("express");
const router = express.Router();

/* CONTROLLERS */
const auth = require("../controller/authController");
const plotController = require("../controller/plotController");
const bookingController = require("../controller/bookingController");

/* JWT MIDDLEWARE */
const verifyToken = require("../middleware/authMiddleware");

/* MULTER */
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= PUBLIC ROUTES ================= */

router.post("/register", auth.register);
router.post("/login", auth.login);

/* ================= AGENT ================= */

router.post("/create-agent", verifyToken, auth.createAgent);
router.put("/agent/:id", verifyToken, auth.updateAgent);
router.delete("/agent/:id", verifyToken, auth.deleteAgent);
router.put("/update-status", verifyToken, auth.updateStatus);

/* ================= USER ================= */

router.get("/users", verifyToken, auth.getAllUsers);
router.put("/user/:id", verifyToken, auth.updateUser);
router.delete("/user/:id", verifyToken, auth.deleteUser);
router.put("/assign-agent/:id", verifyToken, auth.assignAgent);

/* ================= PLOTS ================= */

router.post(
  "/plots",
  verifyToken,
  upload.array("documents"),
  plotController.createPlot,
);

router.get("/plots", verifyToken, plotController.getPlots);

router.put(
  "/plots/:id",
  verifyToken,
  upload.array("documents"),
  plotController.updatePlot,
);

router.delete("/plots/:id", verifyToken, plotController.deletePlot);

router.post("/plots/assign/:id", verifyToken, plotController.assignAgentToPlot);

/* ================= BOOKINGS ================= */

router.post("/bookings/create", verifyToken, bookingController.createBooking);

router.get(
  "/bookings/my-bookings/:userId",
  verifyToken,
  bookingController.getMyBookings,
);

router.put(
  "/bookings/cancel/:id",
  verifyToken,
  bookingController.cancelBooking,
);

router.get("/bookings", verifyToken, bookingController.getAllBookings);

router.get(
  "/bookings/agent/:agentId",
  verifyToken,
  bookingController.getAgentBookings,
);

router.get(
  "/agent-customers/:agentId",
  verifyToken,
  bookingController.getAgentCustomers,
);

router.put(
  "/bookings/assign-agent/:id",
  verifyToken,
  bookingController.assignAgentToBooking,
);

router.put(
  "/bookings/visit-status/:id",
  verifyToken,
  bookingController.updateVisitStatus,
);

router.put(
  "/bookings/schedule-visit/:id",
  verifyToken,
  bookingController.scheduleVisit,
);

router.put(
  "/bookings/status/:id",
  verifyToken,
  bookingController.updateBookingStatus,
);

router.put("/bookings/payment/:id", verifyToken, bookingController.makePayment);

router.put(
  "/bookings/remarks/:id",
  verifyToken,
  bookingController.updateRemarks,
);

module.exports = router;
