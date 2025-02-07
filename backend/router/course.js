import { Router } from "express";
import { getAllCoursesHandler, newCourseHandler } from "../handlers/course.js";

const router = Router();

router.get("/all", getAllCoursesHandler);
router.post("/new", newCourseHandler);

export default router;
