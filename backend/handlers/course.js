import { PrismaClient } from "@prisma/client";
import { validateSlug, validateUrl } from "../utils/validators.js";

const prisma = new PrismaClient();

const getAllCoursesHandler = async (req, res) => {
    const { search, minPrice, maxPrice } = req.query;
    const courses = await prisma.course.findMany({
        where: {
            isLaunched: true,
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }),
            ...(minPrice && { price: { gte: parseInt(minPrice) } }),
            ...(maxPrice && { price: { lte: parseInt(maxPrice) } }),
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
    const { title, description, price, slug, thumbnailUrl } = req.body;
    if (
        !title ||
        !description ||
        !price ||
        isNaN(price) ||
        !slug ||
        !thumbnailUrl
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Title, description, slug, thumbnail URL and price are required",
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
    if (!validateUrl(thumbnailUrl)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid URL",
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
            thumbnailPath: thumbnailUrl,
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

const newCourseVideoHandler = async (req, res) => {
    const { title, description, url, duration, courseId } = req.body;

    if (!title || !description || !url || !duration || !courseId) {
        return res.status(400).json({
            success: false,
            message:
                "Title, description, URL, duration and course ID are required",
            data: null,
        });
    }

    if (!validateUrl(url)) {
        return res.status(400).json({
            success: false,
            message: "Invalid URL. Must be a valid HTTPS URL",
            data: null,
        });
    }

    if (isNaN(duration) || duration <= 0) {
        return res.status(400).json({
            success: false,
            message: "Duration must be a positive number",
            data: null,
        });
    }

    const courseExists = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!courseExists) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
        });
    }

    const highestIndex = await prisma.video.findFirst({
        where: { courseId },
        orderBy: { index: "desc" },
        select: { index: true },
    });

    const newIndex = (highestIndex?.index ?? -1) + 1;

    const video = await prisma.video.create({
        data: {
            title,
            description,
            url,
            duration: parseInt(duration),
            courseId,
            index: newIndex,
        },
        select: {
            id: true,
        },
    });

    return res.json({
        success: true,
        message: "Video added successfully",
        data: {
            id: video.id,
        },
    });
};

const getCourseHandler = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: "Course slug is required",
            data: null,
        });
    }

    const course = await prisma.course.findUnique({
        where: { slug, isLaunched: true },
        include: {
            videos: {
                select: {
                    title: true,
                    description: true,
                    index: true,
                    duration: true,
                },
                orderBy: {
                    index: "desc",
                },
            },
        },
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
        });
    }

    return res.json({
        success: true,
        message: "Course fetched successfully",
        data: {
            course,
        },
    });
};

const getUserCoursesHandler = async (req, res) => {
    const userCourses = await prisma.courseUser.findMany({
        where: {
            userId: req.user.id,
        },
        include: {
            course: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    thumbnailPath: true,
                    price: true,
                    updatedAt: true,
                },
            },
        },
    });

    return res.json({
        success: true,
        message: "User courses fetched successfully",
        data: {
            courses: userCourses.map((uc) => uc.course),
        },
    });
};

const getUserCourseVideosHandler = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        return res.status(400).json({
            success: false,
            message: "Course slug is required",
            data: null,
        });
    }

    // Get course and check if user has access
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            users: {
                where: {
                    userId: req.user.id,
                },
            },
            videos: {
                orderBy: {
                    index: "asc",
                },
            },
        },
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
        });
    }

    if (course.users.length === 0) {
        return res.status(403).json({
            success: false,
            message: "You don't have access to this course",
            data: null,
        });
    }

    return res.json({
        success: true,
        message: "Course videos fetched successfully",
        data: {
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
                description: course.description,
                thumbnailPath: course.thumbnailPath,
                videos: course.videos,
            },
        },
    });
};

const getCourseVideoHandler = async (req, res) => {
    const { slug, videoId } = req.params;

    if (!slug || !videoId) {
        return res.status(400).json({
            success: false,
            message: "Course slug and video ID are required",
            data: null,
        });
    }

    // Get course and check if user has access
    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            users: {
                where: {
                    userId: req.user.id,
                },
            },
        },
    });

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
        });
    }

    if (course.users.length === 0) {
        return res.status(403).json({
            success: false,
            message: "You don't have access to this course",
            data: null,
        });
    }

    // Get the video
    const video = await prisma.video.findFirst({
        where: {
            id: videoId,
            courseId: course.id,
        },
    });

    if (!video) {
        return res.status(404).json({
            success: false,
            message: "Video not found",
            data: null,
        });
    }

    return res.json({
        success: true,
        message: "Video fetched successfully",
        data: {
            video,
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
            },
        },
    });
};

export {
    getAllCoursesHandler,
    newCourseHandler,
    newCourseVideoHandler,
    getCourseHandler,
    getUserCoursesHandler,
    getUserCourseVideosHandler,
    getCourseVideoHandler,
};
