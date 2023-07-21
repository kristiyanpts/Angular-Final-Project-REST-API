const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course name is required"],
    minLength: [5, "The name of the course must be at least 5 characters long"],
  },
  image: {
    type: String,
    required: [true, "Course image is required"],
    // TODO: Add regex check for http & https!
  },
  level: {
    type: String,
    required: [true, "The level of the course is required"],
    enum: {
      values: ["entry", "mid", "advanced", "expert"],
      message: "Invalid course level!",
    },
  },
  capacity: {
    type: Number,
    required: [true, "The capacity of the course is required"],
    min: [1, "Capacity must be at least 1"],
    max: [100, "Capacity must be less than 100"],
  },
  date: {
    type: String,
    required: [true, "The date of the course is required"],
  },
  duration: {
    type: String,
    required: [true, "The duration of the course is required"],
  },
  description: {
    type: String,
    required: [true, "The description of the course is required"],
    minLength: [
      10,
      "The description of the course must be at least 10 characters long",
    ],
    maxLength: [
      200,
      "The description of the course must be less than 200 characters long",
    ],
  },
  schedule: [
    {
      lessonName: { type: String },
      lessonDate: { type: String },
    },
  ],
  teacher: {
    type: ObjectId,
    ref: "User",
    required: [true, "The teacher of the course is required"],
  },
  students: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
