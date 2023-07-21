const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { auth } = require("../utils");

router.get("/teachers", authController.getTeachers);
router.get("/:userId", authController.getProfileInfo);
router.put("/:userId", auth(), authController.editProfileInfo);

module.exports = router;
