import { Router } from "express";
import { checkAuth } from "../middlewares/auth.js";
import {
    initiatePaymentHandler,
    completePaymentHandler,
    bulkPaymentHandler,
    completeBulkPaymentHandler,
} from "../handlers/payment.js";

const router = Router();

router.post("/initiate", checkAuth, initiatePaymentHandler);
router.post("/complete", checkAuth, completePaymentHandler);
router.post("/bulk/initiate", checkAuth, bulkPaymentHandler);
router.post("/bulk/complete", checkAuth, completeBulkPaymentHandler);

export default router;
