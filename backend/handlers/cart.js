import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getCartHandler = async (req, res) => {
    const cart = (
        await prisma.cartItem.findMany({
            where: {
                userId: req.user.id,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        slug: true,
                        price: true,
                        title: true,
                        thumbnailPath: true,
                    },
                },
            },
        })
    ).map((item) => item.course);
    res.json({
        success: true,
        message: "Cart fetched succesfully",
        data: { cart },
    });
};

const addToCartHandler = async (req, res) => {
    const { id } = req.params;

    const courseExists =
        (await prisma.course.count({
            where: { id, isLaunched: true },
        })) > 0;
    if (!courseExists) {
        return res.status(404).json({
            success: false,
            message: "Course does not exist",
            data: null,
        });
    }
    const cartItemExists =
        (await prisma.cartItem.count({
            where: { courseId: id, userId: req.user.id },
        })) > 0;
    if (cartItemExists) {
        return res.status(400).json({
            success: false,
            message: "Course already exists in cart",
            data: null,
        });
    }
    await prisma.cartItem.create({
        data: {
            courseId: id,
            userId: req.user.id,
        },
    });
    res.json({
        success: true,
        message: "Item added to cart",
        data: null,
    });
};

const removeFromCartHandler = async (req, res) => {
    const { id } = req.params;
    const cartItemExists =
        (await prisma.cartItem.count({
            where: { courseId: id, userId: req.user.id },
        })) > 0;
    if (!cartItemExists) {
        return res.status(404).json({
            success: false,
            message: "Item does not exist in cart",
            data: null,
        });
    }
    const cartItem = await prisma.cartItem.findFirst({
        where: {
            courseId: id,
            userId: req.user.id,
        },
        select: { id: true },
    });
    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    res.json({
        status: true,
        message: "Item deleted from cart",
        data: null,
    });
};

const purchaseCourseHandler = async (req, res) => {
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
            message: "Course not found or not available",
            data: null,
        });
    }

    // Check if user already has this course
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

    // Create enrollment record
    await prisma.courseUser.create({
        data: {
            userId: req.user.id,
            courseId: courseId,
        },
    });

    // If the course was in the cart, remove it
    await prisma.cartItem.deleteMany({
        where: {
            userId: req.user.id,
            courseId: courseId,
        },
    });

    return res.json({
        success: true,
        message: "Course purchased successfully",
        data: null,
    });
};

export {
    getCartHandler,
    addToCartHandler,
    removeFromCartHandler,
    purchaseCourseHandler,
};
