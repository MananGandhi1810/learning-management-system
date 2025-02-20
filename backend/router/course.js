import { Router } from "express";
import {
    getAllCoursesHandler,
    getCourseHandler,
    newCourseHandler,
    newCourseVideoHandler,
} from "../handlers/course.js";
import { checkAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/all", getAllCoursesHandler);
router.post(
    "/new",
    (req, res, next) => checkAuth(req, res, next, true),
    newCourseHandler,
);
router.post(
    "/video/new",
    (req, res, next) => checkAuth(req, res, next, true),
    newCourseVideoHandler,
);
router.get("/:slug", getCourseHandler);

export default router;
