require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());

const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

const offerRoutes = require("./routes/offer");
app.use("/offers", offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "all routes" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started ! 🚀🚀");
});
