import React, { useEffect, useState } from "react";
import axios from "axios";
import CandlestickChart, { Candlestick } from "./CandlestickChart";

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = `http://${import.meta.env.HOST || "localhost"}:${import.meta.env.PORT || 4000}/graphql`;

const cities = [
    { label: "Berlin", value: "Berlin" },
    { label: "New York", value: "NewYork" },
    { label: "Tokyo", value: "Tokyo" },
    { label: "Sao Paulo", value: "SaoPaulo" },
    { label: "Cape Town", value: "CapeTown" },
];

const isValidHour = (hour: string): boolean => /^\d{4}-\d{2}-\d{2}-\d{2}$/.test(hour);

/**
 * Main application component that fetches and displays climate temperature trends.
 * It allows users to select a city and view hourly candlestick data for that city.
 * The data is fetched from a GraphQL API and cached for performance.
 */
const App: React.FC = () => {
    const [city, setCity] = useState<string>("Berlin");
    const [data, setData] = useState<Candlestick[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cache, setCache] = useState<Record<string, Candlestick[]>>({});

    const fetchData = async (selectedCity: string) => {
        if (cache[selectedCity]) {
            setData(cache[selectedCity]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                API_URL,
                {
                    query: `{
                        candlesticks(city: "${selectedCity}") {
                            hour
                            open
                            close
                            min
                            max
                        }
                    }`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const rawData = response.data.data.candlesticks || [];
            const filteredData = rawData.filter(
                (d: any) =>
                    isValidHour(d.hour) &&
                    typeof d.open === "number" &&
                    typeof d.close === "number" &&
                    typeof d.min === "number" &&
                    typeof d.max === "number"
            );

            setData(filteredData);
            setCache((prev) => ({ ...prev, [selectedCity]: filteredData }));
        } catch (err) {
            setError("Failed to fetch weather data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(city);
        const interval = setInterval(() => fetchData(city), 10000);
        return () => clearInterval(interval);
    }, [city]);

    return (
        <div style={{ padding: 20, fontFamily: "sans-serif" }}>
            <h2>🌍 Climate Temperature Trends (Hourly)</h2>

            <label htmlFor="city">Select City:</label>
            <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ margin: "0 10px", padding: 5 }}
            >
                {cities.map(({ label, value }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && data.length === 0 && (
                <div className="no-data">
                    <p>
                        No data available for <b>{city}</b> yet.
                    </p>
                    <p>
                        The weather-simulator may not have temperature data for this city yet.
                        <br />
                        Please wait or try a different city.
                    </p>
                </div>
            )}

            {!loading && !error && data.length > 0 && <CandlestickChart data={data} />}
        </div>
    );
};

export default App;
