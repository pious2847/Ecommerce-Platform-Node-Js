const mongoose = require("mongoose");



  const connectDB = mongoose.connection;

  mongoose.connect("mongodb+srv://abdulhafis2847:pious2847@cluster0.ougor3s.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connectDB.on("error", console.error.bind(console, "error in database connection"));
  connectDB.once("open", () => {
    console.log("Database Connected sucessfully");
  });

module.exports = connectDB;
 
