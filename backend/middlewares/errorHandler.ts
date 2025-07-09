import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { ERROR_MESSAGES } from "../constants.js";

/**
 * Error handler middleware for Express applications.
 * This middleware catches errors thrown in the application and sends a standardized error response.
 * It logs the error details for debugging purposes.
 *
 * @param err - The error object caught by the middleware.
 * @param req - The request object.
 * @param res - The response object.
 * @param _next - The next function (not used here).
 */
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    logger.log("error", "Error caught by error handler:", err);
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
};

export default errorHandler;