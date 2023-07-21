const express = require("express");
const router = express.Router();
const { auth } = require("../utils");
const { coursesController } = require("../controllers");

router.get("/", coursesController.getLatestsCourses);
router.get("/:courseId", coursesController.getCourseById);

router.post("/", auth(), coursesController.createCourse);

router.put("/:courseId", auth(), coursesController.editCourse);
router.put("/:courseId/sign-up", auth(), coursesController.courseSignUp);

router.delete("/:courseId", auth(), coursesController.deleteCourse);

module.exports = router;
