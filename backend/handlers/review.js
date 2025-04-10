import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getReviewsHandler = async (req, res) => {
    const { slug } = req.params;

    const course = await prisma.course.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (!course) {
        return res
            .status(404)
            .json({ success: false, message: "Course not found" });
    }

    const reviews = await prisma.review.findMany({
        where: { courseId: course.id },
        include: {
            user: {
                select: {
                    name: true,
                    id: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return res.json({
        success: true,
        data: reviews,
    });
};

const createOrUpdateReviewHandler = async (req, res) => {
    const { slug } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5",
        });
    }

    const course = await prisma.course.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (!course) {
        return res
            .status(404)
            .json({ success: false, message: "Course not found" });
    }

    const courseAccess = await prisma.courseUser.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            },
        },
    });

    if (!courseAccess) {
        return res.status(403).json({
            success: false,
            message: "You must purchase this course before reviewing it",
        });
    }

    const review = await prisma.review.upsert({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            },
        },
        update: {
            rating,
            comment,
            updatedAt: new Date(),
        },
        create: {
            rating,
            comment,
            userId,
            courseId: course.id,
        },
    });

    return res.json({
        success: true,
        data: review,
    });
};

const deleteReviewHandler = async (req, res) => {
    const { slug } = req.params;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({
        where: { slug },
        select: { id: true },
    });

    if (!course) {
        return res
            .status(404)
            .json({ success: false, message: "Course not found" });
    }

    const review = await prisma.review.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            },
        },
    });

    if (!review) {
        return res
            .status(404)
            .json({ success: false, message: "Review not found" });
    }

    await prisma.review.delete({
        where: {
            userId_courseId: {
                userId,
                courseId: course.id,
            },
        },
    });

    return res.json({
        success: true,
        message: "Review deleted successfully",
    });
};

export { getReviewsHandler, createOrUpdateReviewHandler, deleteReviewHandler };
