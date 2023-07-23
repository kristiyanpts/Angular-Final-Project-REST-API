const { userModel, courseModel } = require("../models");

function newCourse(
  name,
  image,
  level,
  capacity,
  date,
  duration,
  description,
  schedule,
  userId
) {
  return courseModel
    .create({
      name,
      image,
      level,
      capacity,
      date,
      duration,
      description,
      schedule,
      teacher: userId,
    })
    .then((course) => {
      return Promise.all([
        userModel.updateOne(
          { _id: userId },
          { $push: { courses: course._id } }
        ),
      ]);
    });
}

function getLatestsCourses(req, res, next) {
  const limit = Number(req.query.limit) || 0;

  courseModel
    .find()
    .sort({ _id: -1 })
    .limit(limit)
    .populate("teacher")
    .then((courses) => {
      res.status(200).json(courses);
    })
    .catch(next);
}

function getCourseById(req, res, next) {
  const { courseId } = req.params;

  courseModel
    .findById(courseId)
    .populate("teacher students")
    .then((course) => {
      if (course == null) throw new Error("Course not found!");
      res.status(200).json(course);
    })
    .catch(next);
}

function createCourse(req, res, next) {
  const {
    name,
    image,
    level,
    capacity,
    date,
    duration,
    description,
    schedule,
    teacher: userId,
  } = req.body;

  newCourse(
    name,
    image,
    level,
    capacity,
    date,
    duration,
    description,
    schedule,
    userId
  )
    .then(([_]) =>
      res.status(200).json({ message: "Created course successfully" })
    )
    .catch(next);
}

function editCourse(req, res, next) {
  const { courseId } = req.params;
  const {
    name,
    image,
    level,
    capacity,
    date,
    duration,
    description,
    schedule,
  } = req.body;

  courseModel
    .findOneAndUpdate(
      { _id: courseId },
      { name, image, level, capacity, date, duration, description, schedule },
      { new: true }
    )
    .then((updatedCourse) => {
      if (updatedCourse) {
        res.status(200).json(updatedCourse);
      } else {
        res.status(401).json({ message: `Not allowed!` });
      }
    })
    .catch(next);
}

function deleteCourse(req, res, next) {
  const { courseId } = req.params;

  Promise.all([
    courseModel.findOneAndDelete({ _id: courseId }),
    userModel.findOneAndUpdate(
      { courses: courseId },
      { $pull: { courses: courseId } }
    ),
  ])
    .then(([deletedOne, _]) => {
      if (deletedOne) {
        res.status(200).json(deletedOne);
      } else {
        res.status(401).json({ message: `Not allowed!` });
      }
    })
    .catch(next);
}

async function courseSignUp(req, res, next) {
  const { courseId } = req.params;
  const { _id: userId } = req.user;

  let course = await courseModel.findById(courseId);
  if (course.capacity == course.students.length) {
    return res.status(401).json({ message: "There are no spots left!" });
  }

  courseModel
    .updateOne(
      { _id: courseId },
      { $addToSet: { students: userId } },
      { new: true }
    )
    .then(() =>
      res.status(200).json({ message: "Signed up for course successfuly!" })
    )
    .catch(next);
}

function removeStudent(req, res, next) {
  const { courseId } = req.params;
  let { userId } = req.body;

  courseModel
    .updateOne({ _id: courseId }, { $pull: { students: userId } })
    .then(() =>
      res
        .status(200)
        .json({ message: "User removed from course successfully!" })
    )
    .catch(next);
}

module.exports = {
  getLatestsCourses,
  getCourseById,
  newCourse,
  createCourse,
  editCourse,
  deleteCourse,
  courseSignUp,
  removeStudent,
};
