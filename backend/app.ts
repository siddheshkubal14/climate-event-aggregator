import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { graphqlHTTP } from "express-graphql";
import { Router } from "express";

import schema from "./graphql/schema.js";
import { logger } from "./utils/logger.js";
import { ERROR_MESSAGES } from "./constants.js";

import authMiddleware from "./middlewares/auth.js";
import errorHandler from "./middlewares/errorHandler.js";
import corsOptions from "./middlewares/corsOptions.js";


export default async (): Promise<Application> => {
    const app = express();

    // Middleware
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    });
    app.use(limiter);

    // Router setup
    const router = Router();

    // Healthcheck
    router.get("/healthcheck", (req, res) => {
        res.status(200).json({ message: "healthy" });
    });

    // Middleware chain

    // Authentication middleware
    // Note: This should be applied to all routes that require authentication
    // To allow unauthenticated access to some routes, we can apply authMiddleware selectively
    router.use(authMiddleware);
    router.use("/graphql", graphqlHTTP({
        schema,
        graphiql: true,
    }));

    // Attaching router and error handler
    app.use("/", router);
    app.use(errorHandler);


    return app;
};

// Global exception handling
process.on("uncaughtException", (error: Error) => {
    logger.log("error", "Uncaught Exception", error);
});

process.on("unhandledRejection", (reason: unknown) => {
    logger.log("error", "Unhandled Rejection", reason);
});
