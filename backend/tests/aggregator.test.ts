import { describe, it, beforeEach } from "mocha";
import { expect } from "chai";
import sinon from "sinon";
import { redis } from "../utils/redisClient.js";
import { aggregateEvent, getAggregatedData } from "../services/aggregator.js";


describe("Aggregator Service", () => {
    beforeEach(() => {
        sinon.restore();
    });

    it("should update existing candlestick entry", async () => {
        const city = "Berlin";

        // Existing entry before updates
        const existingCandlestick = {
            open: 22,
            close: 22,
            min: 22,
            max: 22,
        };

        // Stub Redis hget to return existing candlestick JSON
        const hgetStub = sinon.stub(redis, "hget").resolves(JSON.stringify(existingCandlestick));
        const hsetStub = sinon.stub(redis, "hset").resolves(1);
        const hgetallStub = sinon.stub(redis, "hgetall").resolves({
            "2025-07-07-10": JSON.stringify({
                open: 22,
                close: 21,
                min: 21,
                max: 24,
            }),
        });

        // Simulate first event - open at 22
        await aggregateEvent({ city, timestamp: "2025-07-07T10:00:00Z", temperature: 22 });
        // Second event updates max
        hgetStub.resolves(JSON.stringify({ open: 22, close: 22, min: 22, max: 22 }));
        await aggregateEvent({ city, timestamp: "2025-07-07T10:20:00Z", temperature: 24 });
        // Third event updates close and min
        hgetStub.resolves(JSON.stringify({ open: 22, close: 24, min: 22, max: 24 }));
        await aggregateEvent({ city, timestamp: "2025-07-07T10:45:00Z", temperature: 21 });

        expect(hsetStub.callCount).to.be.greaterThan(1);

        const data = await getAggregatedData(city);

        expect(data).to.have.property("2025-07-07-10");
        expect(data["2025-07-07-10"]).to.deep.equal({
            open: 22,
            close: 21,
            min: 21,
            max: 24,
        });

        hgetStub.restore();
        hsetStub.restore();
        hgetallStub.restore();
    });

    it("should return empty object for unknown city", async () => {
        const hgetallStub = sinon.stub(redis, "hgetall").resolves({});

        const data = await getAggregatedData("UnknownCity");
        expect(data).to.deep.equal({});

        hgetallStub.restore();
    });
});
