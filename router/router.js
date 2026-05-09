const express = require("express");
const router = express.Router();

/* CONTROLLERS */
const auth = require("../controller/authController");
const plotController = require("../controller/plotController");
const bookingController = require("../controller/bookingController");

/* MULTER*/
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* REGISTER & LOGIN */
router.post("/register", auth.register);
router.post("/login", auth.login);

/* AGENT */
router.post("/create-agent", auth.createAgent);
router.put("/agent/:id", auth.updateAgent);
router.delete("/agent/:id", auth.deleteAgent);
router.put("/update-status", auth.updateStatus);

/* USER */
router.get("/users", auth.getAllUsers);
router.put("/user/:id", auth.updateUser);
router.delete("/user/:id", auth.deleteUser);
router.put("/assign-agent/:id", auth.assignAgent);

/* PLOTS */
router.post("/plots", upload.array("documents"), plotController.createPlot);
router.get("/plots", plotController.getPlots);
router.put("/plots/:id", upload.array("documents"), plotController.updatePlot);
router.delete("/plots/:id", plotController.deletePlot);

router.post("/plots/assign/:id", plotController.assignAgentToPlot);

// BOOKINGS

router.post("/bookings/create", bookingController.createBooking);
router.get("/bookings/my-bookings/:userId", bookingController.getMyBookings);
router.put("/bookings/cancel/:id", bookingController.cancelBooking);
router.get("/bookings", bookingController.getAllBookings); // ADMIN BOOKINGS
router.get("/bookings/agent/:agentId", bookingController.getAgentBookings); // AGENT BOOKINGS
router.get("/agent-customers/:agentId", bookingController.getAgentCustomers);
router.put(
  "/bookings/assign-agent/:id",
  bookingController.assignAgentToBooking,
);
router.put("/bookings/visit-status/:id", bookingController.updateVisitStatus);
router.put("/bookings/schedule-visit/:id", bookingController.scheduleVisit); //SCHEDULE

module.exports = router;
