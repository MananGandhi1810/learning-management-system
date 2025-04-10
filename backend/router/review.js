import { Router } from "express";
import {
    getReviewsHandler,
    createOrUpdateReviewHandler,
    deleteReviewHandler,
} from "../handlers/review.js";
import { checkAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/:slug", getReviewsHandler);
router.post("/:slug", checkAuth, createOrUpdateReviewHandler);
router.delete("/:slug", checkAuth, deleteReviewHandler);

export default router;
