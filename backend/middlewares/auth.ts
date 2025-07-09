import { Request, Response, NextFunction } from "express";
import config from "../config.js";
import { ERROR_MESSAGES } from "../constants.js";

/**
 * Middleware to authenticate requests using an API key.
 * The API key should be provided in the Authorization header as a Bearer token.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(403).json({ error: "No API key provided" });
        return;
    }
    const token = authHeader.substring(7); // Removing 'Bearer '

    if (token !== config.apiKey) {
        res.status(403).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
        return;
    }
    next();
};

export default authMiddleware;