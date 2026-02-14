const express = require("express");
const router = express.Router();

const Admin = require("../../models/Admin");
const User = require("../../models/User");
const License = require("../../models/License");
const auth = require("../../middleware/auth");

// Create new admin (Only Super Admin)
router.post("/create-admin", auth("super_admin"), async (req, res) => {
  const { email, password, role } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.status(400).json({ msg: "Admin already exists" });
  }

  await Admin.create({ email, password, role });

  res.json({ msg: "Admin created" });
});

// Get all users
router.get("/users", auth("admin"), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get all licenses
router.get("/licenses", auth("admin"), async (req, res) => {
  const licenses = await License.find();
  res.json(licenses);
});

// Block user
router.post("/block-user/:userId", auth("admin"), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { isBlocked: true });
  res.json({ msg: "User blocked" });
});

module.exports = router;
