require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../dashboard/models/Admin");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Admin.findOne({ email: "admin@email.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  await Admin.create({
    email: "admin@email.com",
    password: "YourPassword123",
    role: "super_admin"
  });

  console.log("Super Admin Created");
  process.exit();
}

createAdmin();