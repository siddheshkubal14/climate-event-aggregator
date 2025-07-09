import { CorsOptions } from "cors";
import config from "../config.js";

/**
 * CORS options for the application.
 * This configuration allows requests from specified origins.
 * If the origin is not allowed, it will return an error.
 */
const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || config.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

export default corsOptions;