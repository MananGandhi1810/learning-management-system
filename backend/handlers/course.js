import { PrismaClient } from "@prisma/client";
import { validateSlug } from "../utils/validators.js";

const prisma = new PrismaClient();

const getAllCoursesHandler = async (req, res) => {
    const courses = await prisma.course.findMany({
        where: {
            isLaunched: true,
        },
    });
    res.json({
        success: true,
        message: "Courses fetched successfully",
        data: {
            courses,
        },
    });
};

const newCourseHandler = async (req, res) => {
    const { title, description, price, slug } = req.body;
    if (!title || !description || !price || isNaN(price) || !slug) {
        return res.status(400).json({
            success: false,
            message: "Title, description, slug and price are required",
            data: null,
        });
    }
    if (price < 0) {
        return res.status(400).json({
            success: false,
            message: "Price cannot be negative",
            data: null,
        });
    }
    if (!validateSlug(slug)) {
        return res.status(400).json({
            success: false,
            message:
                "Slug can only contain letters, numbers and hyphens, and must be at least 3 characters long",
            data: null,
        });
    }
    const existingSlug = await prisma.course.count({ where: { slug } });
    if (existingSlug > 0) {
        return res.status(400).json({
            success: false,
            message: "Slug already exists",
            data: null,
        });
    }
    const course = await prisma.course.create({
        data: {
            title,
            description,
            slug,
            price: parseInt(price),
        },
        select: {
            id: true,
        },
    });
    return res.json({
        success: true,
        message: "Course created successfully",
        data: {
            id: course.id,
        },
    });
};

export { getAllCoursesHandler, newCourseHandler };
