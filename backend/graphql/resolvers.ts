import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLFloat, GraphQLError } from "graphql";
import { getAggregatedData } from "../services/aggregator.js";

const CandlestickType = new GraphQLObjectType({
    name: "Candlestick",
    fields: {
        hour: { type: GraphQLString },
        open: { type: GraphQLFloat },
        close: { type: GraphQLFloat },
        min: { type: GraphQLFloat },
        max: { type: GraphQLFloat },
    },
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        candlesticks: {
            type: new GraphQLList(CandlestickType),
            args: { city: { type: GraphQLString } },
            async resolve(_, { city }) {
                try {


                    const data = await getAggregatedData(city);
                    if (!data || Object.keys(data).length === 0) {
                        const error = new GraphQLError(`No candlestick data found for "${city}"`);
                        (error as any).extensions = {
                            code: "NOT_FOUND",
                            http: { status: 404 },
                        };
                        throw error;
                    }
                    return Object.entries(data)
                        .sort(([a], [b]) => new Date(a.replace(/-/g, ":")).getTime() - new Date(b.replace(/-/g, ":")).getTime())
                        .map(([hour, values]) => ({ hour, ...values }));
                } catch (error) {
                    const err = new GraphQLError(`Error fetching data for "${city}": ${error}`);
                    (err as any).extensions = {
                        code: "INTERNAL_SERVER_ERROR",
                        http: { status: 500 },
                    };
                    throw err;
                }
            },
        },
    },
});

export default RootQuery;
