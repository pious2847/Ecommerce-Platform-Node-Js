const mongoose = require("mongoose");



  const connectDB = mongoose.connection;

  mongoose.connect("mongodb://127.0.0.1:27017/supermallclone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connectDB.on("error", console.error.bind(console, "error in database connection"));
  connectDB.once("open", () => {
    console.log("Database Connected sucessfully");
  });

module.exports = connectDB;
 