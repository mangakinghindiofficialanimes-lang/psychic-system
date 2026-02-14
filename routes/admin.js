const express = require("express");
const router = express.Router();

const Admin = require("../models/Admin");
const auth = require("../middleware/auth"); // adjust path if needed

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

module.exports = router;