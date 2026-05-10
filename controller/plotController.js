// controllers/plotController.js

const Plot = require("../models/Plot");
const User = require("../models/User");

exports.createPlot = async (req, res) => {
  try {
    // get uploaded files
    const files = req.files || [];

    const filePaths = files.map((file) => file.path);

    const plot = new Plot({
      ...req.body,
      documents: filePaths, // SAVE FILE
    });

    await plot.save();

    res.json({
      status: true,
      message: "Plot created successfully",
      data: plot,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

exports.getPlots = async (req, res) => {
  try {
    const plots = await Plot.find()
      .populate("assignedAgent", "name email phone")
      .sort({ createdAt: -1 });

    res.json({
      status: true,
      data: plots,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

//UPDATE
exports.updatePlot = async (req, res) => {
  try {
    const files = req.files || [];

    let updateData = { ...req.body };

    // FIX HERE
    if (updateData.assignedAgent === "null") {
      updateData.assignedAgent = null;
    }

    if (files.length > 0) {
      const filePaths = files.map((file) => file.path);
      updateData.documents = filePaths;
    }

    const updatedPlot = await Plot.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.json({
      status: true,
      message: "Plot updated successfully",
      data: updatedPlot,
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

//DELETE
exports.deletePlot = async (req, res) => {
  try {
    await Plot.findByIdAndDelete(req.params.id);

    res.json({
      status: true,
      message: "Plot deleted successfully",
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

// ASSIGN / UNASSIGN AGENT TO PLOT
exports.assignAgentToPlot = async (req, res) => {
  try {
    const plotId = req.params.id;
    const { agentId } = req.body;

    const plot = await Plot.findById(plotId);

    if (!plot) {
      return res.json({ status: false, message: "Plot not found" });
    }

    // ================= UNASSIGN =================
    if (!agentId) {
      plot.assignedAgent = null;
      await plot.save();

      return res.json({
        status: true,
        message: "Agent unassigned successfully",
        data: plot,
      });
    }

    // ================= RULE 1: plot already assigned =================
    if (plot.assignedAgent) {
      return res.json({
        status: false,
        message: "Plot already assigned. Please unassign first.",
      });
    }

    // ================= RULE 2: agent already assigned to another plot =================
    const existingPlot = await Plot.findOne({ assignedAgent: agentId });

    if (existingPlot) {
      return res.json({
        status: false,
        message: "This agent is already assigned to another plot.",
      });
    }

    // ================= ASSIGN =================
    plot.assignedAgent = agentId;
    await plot.save();

    return res.json({
      status: true,
      message: "Agent assigned successfully",
      data: plot,
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};
