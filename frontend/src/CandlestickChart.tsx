import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { parseISO, format } from "date-fns";

export interface Candlestick {
    hour: string;
    open: number;
    close: number;
    min: number;
    max: number;
}

interface Props {
    data: Candlestick[];
    width?: number;
    height?: number;
}

const CandlestickChart: React.FC<Props> = ({ data, width = 700, height = 400 }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        if (!Array.isArray(data) || data.length === 0) return;

        const margin = { top: 40, right: 30, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const parsedData = data
            .map((d) => ({
                ...d,
                open: Number(d.open),
                close: Number(d.close),
                min: Number(d.min),
                max: Number(d.max),
            }))
            .filter((d) => /^\d{4}-\d{2}-\d{2}-\d{2}$/.test(d.hour))
            .sort((a, b) =>
                new Date(`${a.hour.replace(/-/g, "-")}T00:00:00`).getTime() -
                new Date(`${b.hour.replace(/-/g, "-")}T00:00:00`).getTime()
            );

        const hours = parsedData.map((d) => d.hour);

        if (hours.length < 6) {
            const last = hours[hours.length - 1] ?? "2025-07-06-00";
            const [y, m, d, h] = last.split("-");
            let hour = parseInt(h, 10);
            for (let i = 1; i <= 6 - hours.length; i++) {
                const paddedHour = String(hour + i).padStart(2, "0");
                hours.push(`${y}-${m}-${d}-${paddedHour}`);
            }
        }

        const x = d3.scaleBand().domain(hours).range([0, innerWidth]).padding(0.3);

        const yMin = d3.min(parsedData, (d) => d.min)!;
        const yMax = d3.max(parsedData, (d) => d.max)!;
        const range = yMax - yMin;
        const padding = range * 0.1 || 0.5;

        const y = d3.scaleLinear().domain([yMin - padding, yMax + padding]).range([innerHeight, 0]);

        const xAxis = d3.axisBottom(x).tickFormat((d) => {
            if (!d) return "";
            try {
                const [yyyy, MM, dd, HH] = (d as string).split("-");
                const iso = `${yyyy}-${MM}-${dd}T${HH}:00:00`;
                return format(parseISO(iso), "dd/MM HH'h'");
            } catch {
                return d;
            }
        });

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 60)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Date Time (DD/MM HH)");

        g.append("g").call(d3.axisLeft(y));

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -innerHeight / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Temperature (°C)");

        const barWidth = x.bandwidth();

        const candles = g
            .selectAll<SVGGElement, Candlestick>("g.candle")
            .data(parsedData.filter((d) => x(d.hour) !== undefined))
            .enter()
            .append("g")
            .attr("class", "candle");

        candles
            .append("rect")
            .attr("x", (d) => x(d.hour) ?? 0)
            .attr("y", (d) => {
                const h = Math.abs(y(d.open) - y(d.close));
                return h === 0 ? y(d.open) - 1 : y(Math.max(d.open, d.close));
            })
            .attr("width", barWidth)
            .attr("height", (d) => {
                const h = Math.abs(y(d.open) - y(d.close));
                return h === 0 ? 2 : h;
            })
            .attr("fill", (d) => (d.close > d.open ? "green" : "red"));

        // Wick: from body center to high/low
        candles
            .append("line")
            .attr("x1", (d) => (x(d.hour) ?? 0) + barWidth / 2)
            .attr("x2", (d) => (x(d.hour) ?? 0) + barWidth / 2)
            .attr("y1", (d) => {
                const openY = y(d.open);
                const closeY = y(d.close);
                const midY = (openY + closeY) / 2;
                return y(d.max) < midY ? y(d.max) : midY;
            })
            .attr("y2", (d) => {
                const openY = y(d.open);
                const closeY = y(d.close);
                const midY = (openY + closeY) / 2;
                return y(d.max) < midY ? midY : y(d.max);
            })
            .attr("stroke", "#000000")
            .attr("stroke-width", 3);

        candles
            .append("line")
            .attr("x1", (d) => (x(d.hour) ?? 0) + barWidth / 2)
            .attr("x2", (d) => (x(d.hour) ?? 0) + barWidth / 2)
            .attr("y1", (d) => {
                const openY = y(d.open);
                const closeY = y(d.close);
                const midY = (openY + closeY) / 2;
                return y(d.min) > midY ? y(d.min) : midY;
            })
            .attr("y2", (d) => {
                const openY = y(d.open);
                const closeY = y(d.close);
                const midY = (openY + closeY) / 2;
                return y(d.min) > midY ? midY : y(d.min);
            })
            .attr("stroke", "#000000")
            .attr("stroke-width", 3);
    }, [data, width, height]);

    return <svg ref={svgRef} style={{ width: "100%", height }} />;
};

export default CandlestickChart;
