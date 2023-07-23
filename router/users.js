const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { auth } = require("../utils");

router.get("/", authController.getAllUsers);
router.get("/teachers", authController.getTeachers);
router.get("/students", authController.getStudents);
router.get("/:userId", authController.getProfileInfo);
router.delete("/:userId", auth(), authController.deleteUser);
router.put("/:userId", auth(), authController.editProfileInfo);

module.exports = router;
