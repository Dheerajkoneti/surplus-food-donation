const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://Dheeraj:Dheeraj2004@cluster0.uhz02rg.mongodb.net/foodDonation?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("DB Error:", err.message));
