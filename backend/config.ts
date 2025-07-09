import dotenv from "dotenv";
dotenv.config();

// Configuration for the application
// This file contains environment variables and application settings
const config = {
    port: parseInt(process.env.PORT ?? "4000", 10),
    apiKey: process.env.API_KEY ?? "",
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",").map(origin => origin.trim()) || [],
};

export default config;
