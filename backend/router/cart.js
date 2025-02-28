import { Router } from "express";
import { checkAuth } from "../middlewares/auth.js";
import {
    getCartHandler,
    addToCartHandler,
    removeFromCartHandler,
} from "../handlers/cart.js";
const router = Router();

router.get("/", checkAuth, getCartHandler);
router.put("/:id", checkAuth, addToCartHandler);
router.delete("/:id", checkAuth, removeFromCartHandler);

export default router;
