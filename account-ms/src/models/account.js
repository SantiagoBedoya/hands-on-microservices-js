const mongoose = require("mongoose");

const { Schema } = mongoose;

const AccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["root", "sub"],
      default: "prop",
    },
    status: {
      type: String,
      enum: ["new", "active", "inactive", "blocked"],
      default: "new",
    },
    count: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    optimisticConcurrency: true,
  },
);

module.exports = mongoose.model("account", AccountSchema);
