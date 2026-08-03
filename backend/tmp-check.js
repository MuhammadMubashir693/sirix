require("dotenv").config();
const mongoose = require("mongoose");
const env = require("./src/config/env");
const User = require("./src/models/User");
(async () => {
  console.log("MONGO_URI", env.mongoUri);
  await mongoose.connect(env.mongoUri, { strictQuery: true });
  const user = await User.findOne({ email: "admin@sirix.io" }).select("+password");
  console.log("Found user:", !!user);
  if (user) {
    console.log("email", user.email);
    console.log("password hash", user.password);
    const match = await user.comparePassword("Admin@12345");
    console.log("comparePassword result:", match);
  }
  await mongoose.disconnect();
})();
