const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = Number(process.env.SALTROUNDS) || 5;

const { ObjectId } = mongoose.Types;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [5, "Username should be at least 5 characters long"],
    validate: {
      validator: function (v) {
        return /[a-zA-Z0-9]+/g.test(v);
      },
      message: (props) =>
        `${props.value} must contains only latin letters and digits!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password should be at least 8 characters long"],
    validate: {
      validator: function (v) {
        return /[a-zA-Z0-9]+/g.test(v);
      },
      message: (props) =>
        `${props.value} must contains only latin letters and digits!`,
    },
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    minlength: [1, "First name should be at least 1 characters long"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    minlength: [1, "Last name should be at least 1 characters long"],
  },
  image: {
    type: String,
    required: [true, "Image is required"],
    //TODO: Add regex check for http & https!
  },
  role: {
    type: String,
    enum: {
      values: ["student", "teacher", "admin", "owner"],
      message: "Selected role is invalid!",
    },
    required: [true, "Role is required"],
  },
  courses: [
    {
      type: ObjectId,
      ref: "Course",
    },
  ],
});

userSchema.methods = {
  matchPassword: function (password) {
    return bcrypt.compare(password, this.password);
  },
};

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        next(err);
      }
      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) {
          next(err);
        }
        this.password = hash;
        next();
      });
    });
    return;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
