import { parseISO, format } from "date-fns";
import { redis } from "../utils/redisClient.js";
import { logger } from "../utils/logger.js";

interface Candlestick {
    open: number;
    close: number;
    min: number;
    max: number;
}

/**
 * Generates a key for hourly aggregation based on the timestamp.
 * 
 * @param timestamp - The ISO string timestamp to generate the key from.
 * @returns A string representing the hour in "yyyy-MM-dd-HH" format.
 */
function getHourlyKey(timestamp: string): string {
    const date = parseISO(timestamp);
    date.setMinutes(0, 0, 0);
    return format(date, "yyyy-MM-dd-HH");
}


/**
 * Aggregates a temperature event for a specific city into a candlestick format.
 * 
 * @param event - The event containing city, timestamp, and temperature.
 * @returns A promise that resolves when the event is aggregated.
 */
export async function aggregateEvent(event: {
    city: string;
    timestamp: string;
    temperature: number;
}) {
    try {

        if (!event?.city || !event?.timestamp || typeof event?.temperature !== "number") {
            throw new Error("Invalid event data");
        }

        const { city, timestamp, temperature } = event;
        const hourKey = getHourlyKey(timestamp);
        const redisKey = `candlestick:${city}`;

        const existing = await redis.hget(redisKey, hourKey);
        if (!existing) {
            const record: Candlestick = {
                open: temperature,
                close: temperature,
                min: temperature,
                max: temperature,
            };
            await redis.hset(redisKey, hourKey, JSON.stringify(record));
        } else {
            const parsed: Candlestick = JSON.parse(existing);
            parsed.close = temperature;
            parsed.min = Math.min(parsed.min, temperature);
            parsed.max = Math.max(parsed.max, temperature);
            await redis.hset(redisKey, hourKey, JSON.stringify(parsed));
        }
    } catch (error) {
        logger.log("Error", "Error in aggregateEvent:", error);
    }
}



/**
 * Retrieves aggregated candlestick data for a given city.
 * 
 * @param city - The name of the city to retrieve data for.
 * @returns A promise that resolves to an object containing candlestick data indexed by hour.
 */
export async function getAggregatedData(city: string): Promise<Record<string, Candlestick>> {
    try {

        if (!city) {
            throw new Error("City is required");
        }

        const redisKey = `candlestick:${city}`;
        const data = await redis.hgetall(redisKey);
        const parsed: Record<string, Candlestick> = {};

        for (const [hour, json] of Object.entries(data)) {
            try {
                parsed[hour] = JSON.parse(json);
            } catch {
                continue;
            }
        }

        return parsed;
    } catch (error) {
        logger.log("error", "Error in getAggregatedData:", error);
        return {};
    }
}
