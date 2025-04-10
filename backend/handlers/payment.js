import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const initiatePaymentHandler = async (req, res) => {
    const { courseId } = req.body;

    if (!courseId) {
        return res.status(400).json({
            success: false,
            message: "Course ID is required",
            data: null,
        });
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId, isLaunched: true },
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
        });
    }

    const existingEnrollment = await prisma.courseUser.findUnique({
        where: {
            userId_courseId: {
                userId: req.user.id,
                courseId: courseId,
            },
        },
    });

    if (existingEnrollment) {
        return res.status(400).json({
            success: false,
            message: "You already have access to this course",
            data: null,
        });
    }

    const paymentSession = {
        id: uuidv4(),
        amount: course.price,
        courseId: course.id,
        courseName: course.title,
    };

    const payment = await prisma.payment.create({
        data: {
            amount: course.price,
            status: "pending",
            userId: req.user.id,
            courseId: course.id,
            transactionId: paymentSession.id,
        },
    });

    return res.json({
        success: true,
        message: "Payment initiated",
        data: {
            paymentSession,
            course: {
                id: course.id,
                title: course.title,
                price: course.price,
                thumbnailPath: course.thumbnailPath,
            },
        },
    });
};

const completePaymentHandler = async (req, res) => {
    const { transactionId, paymentMethod = "card" } = req.body;

    if (!transactionId) {
        return res.status(400).json({
            success: false,
            message: "Transaction ID is required",
            data: null,
        });
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId },
        include: { course: true },
    });

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: "Payment not found",
            data: null,
        });
    }

    if (payment.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized",
            data: null,
        });
    }

    if (payment.status === "completed") {
        return res.status(400).json({
            success: false,
            message: "Payment already completed",
            data: null,
        });
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "completed",
            paymentMethod,
        },
    });

    await prisma.courseUser.create({
        data: {
            userId: req.user.id,
            courseId: payment.courseId,
        },
    });

    await prisma.cartItem.deleteMany({
        where: {
            userId: req.user.id,
            courseId: payment.courseId,
        },
    });

    return res.json({
        success: true,
        message: "Payment completed successfully",
        data: {
            course: {
                id: payment.course.id,
                slug: payment.course.slug,
                title: payment.course.title,
            },
        },
    });
};

const bulkPaymentHandler = async (req, res) => {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Cart items are required",
            data: null,
        });
    }

    const courseIds = cartItems.map((item) => item);
    const courses = await prisma.course.findMany({
        where: {
            id: { in: courseIds },
            isLaunched: true,
        },
    });

    if (courses.length !== courseIds.length) {
        return res.status(400).json({
            success: false,
            message: "One or more courses are invalid",
            data: null,
        });
    }

    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);
    const bulkTransactionId = uuidv4();

    for (const course of courses) {
        await prisma.payment.create({
            data: {
                amount: course.price,
                status: "pending",
                userId: req.user.id,
                courseId: course.id,
                transactionId: bulkTransactionId,
            },
        });
    }

    return res.json({
        success: true,
        message: "Bulk payment initiated",
        data: {
            paymentSession: {
                id: bulkTransactionId,
                amount: totalAmount,
                courses: courses.map((course) => ({
                    id: course.id,
                    title: course.title,
                    price: course.price,
                })),
            },
        },
    });
};

const completeBulkPaymentHandler = async (req, res) => {
    const { transactionId, paymentMethod = "card" } = req.body;

    if (!transactionId) {
        return res.status(400).json({
            success: false,
            message: "Transaction ID is required",
            data: null,
        });
    }

    const payments = await prisma.payment.findMany({
        where: {
            transactionId,
            userId: req.user.id,
            status: "pending",
        },
        include: { course: true },
    });

    if (payments.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No pending payments found",
            data: null,
        });
    }

    for (const payment of payments) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "completed",
                paymentMethod,
            },
        });

        await prisma.courseUser.create({
            data: {
                userId: req.user.id,
                courseId: payment.courseId,
            },
        });

        await prisma.cartItem.deleteMany({
            where: {
                userId: req.user.id,
                courseId: payment.courseId,
            },
        });
    }

    return res.json({
        success: true,
        message: "All payments completed successfully",
        data: {
            courses: payments.map((payment) => ({
                id: payment.course.id,
                slug: payment.course.slug,
                title: payment.course.title,
            })),
        },
    });
};

export {
    initiatePaymentHandler,
    completePaymentHandler,
    bulkPaymentHandler,
    completeBulkPaymentHandler,
};
