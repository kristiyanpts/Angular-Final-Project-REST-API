const { userModel } = require("../models");

const utils = require("../utils");
const { authCookieName } = require("../app-config");

const bsonToJson = (data) => {
  return JSON.parse(JSON.stringify(data));
};
const removePassword = (data) => {
  const { password, __v, ...userData } = data;
  return userData;
};

function register(req, res, next) {
  const {
    email,
    username,
    password,
    repeatPassword,
    firstName,
    lastName,
    image,
    role,
  } = req.body;

  return userModel
    .create({
      email,
      username,
      password,
      repeatPassword,
      firstName,
      lastName,
      image,
      role,
    })
    .then((createdUser) => {
      createdUser = bsonToJson(createdUser);
      createdUser = removePassword(createdUser);

      const token = utils.jwt.createToken({
        id: createdUser._id,
        username,
        firstName,
        lastName,
        image,
        role,
      });
      if (process.env.NODE_ENV === "production") {
        res.cookie(authCookieName, token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
      } else {
        res.cookie(authCookieName, token, { httpOnly: true });
      }
      res.status(200).send(createdUser);
    })
    .catch((err) => {
      if (err.name === "MongoError" && err.code === 11000) {
        let field = err.message.split("index: ")[1];
        field = field.split(" dup key")[0];
        field = field.substring(0, field.lastIndexOf("_"));

        res
          .status(409)
          .send({ message: `This ${field} is already registered!` });
        return;
      }
      next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  userModel
    .findOne({ email })
    .then((user) => {
      return Promise.all([user, user ? user.matchPassword(password) : false]);
    })
    .then(([user, match]) => {
      if (!match) {
        res.status(401).send({ message: "Wrong email or password" });
        return;
      }
      user = bsonToJson(user);
      user = removePassword(user);

      const token = utils.jwt.createToken({
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        role: user.role,
      });

      if (process.env.NODE_ENV === "production") {
        res.cookie(authCookieName, token, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
      } else {
        res.cookie(authCookieName, token, { httpOnly: true });
      }
      res.status(200).send(user);
    })
    .catch(next);
}

function logout(req, res) {
  res.clearCookie(authCookieName).status(204).send({ message: "Logged out!" });
}

function getTeachers(req, res, next) {
  userModel
    .find({ role: "teacher" })
    .then((t) => {
      res.status(200).json(t);
    })
    .catch(next);
}

function getProfileInfo(req, res, next) {
  let { userId } = req.params;

  userModel
    .findOne({ _id: userId }, { password: 0, __v: 0 })
    .populate("courses")
    .then((user) => {
      res.status(200).json(user);
    })
    .catch(next);
}

function editProfileInfo(req, res, next) {
  const { _id: userId } = req.user;
  const { email, username, firstName, lastName, image, role } = req.body;

  userModel
    .findOneAndUpdate(
      { _id: userId },
      { email, username, firstName, lastName, image, role },
      { runValidators: true, new: true }
    )
    .then((x) => {
      res.status(200).json(x);
    })
    .catch(next);
}

module.exports = {
  login,
  register,
  logout,
  getProfileInfo,
  editProfileInfo,
  getTeachers,
};
