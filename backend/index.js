import express from "express";
import cors from "cors";
import authRouter from "./router/auth.js";
import courseRouter from "./router/course.js";
import cartRouter from "./router/cart.js";
import reviewRouter from "./router/review.js";
import paymentRouter from "./router/payment.js";
import logger from "morgan";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);

app.use("/auth", authRouter);
app.use("/course", courseRouter);
app.use("/cart", cartRouter);
app.use("/reviews", reviewRouter);
app.use("/payment", paymentRouter);

app.use(function (req, res, next) {
    res.status(404).json({
        success: false,
        message: "This route could not be found",
        data: null,
    });
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    console.log(err);

    res.status(err.status || 500).json({
        success: false,
        message: "An unexpected error occured",
        data: null,
    });
});

export default app;
