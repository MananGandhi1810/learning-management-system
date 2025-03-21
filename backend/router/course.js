import { Router } from "express";
import {
    getAllCoursesHandler,
    getCourseHandler,
    getUserCoursesHandler,
    getUserCourseVideosHandler,
    getCourseVideoHandler,
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
router.get("/my-courses", checkAuth, getUserCoursesHandler);
router.get("/:slug/videos", checkAuth, getUserCourseVideosHandler);
router.get("/:slug/videos/:videoId", checkAuth, getCourseVideoHandler);
router.get("/:slug", getCourseHandler);

export default router;
