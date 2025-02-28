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
    await prisma.cartItem.delete({
        where: {
            courseId: id,
            userId: req.user.id,
        },
    });
    res.json({
        status: true,
        message: "Item deleted from cart",
        data: null,
    });
};

export { getCartHandler, addToCartHandler, removeFromCartHandler };
