import { GraphQLSchema } from "graphql";
import RootQuery from "./resolvers.js";

const schema = new GraphQLSchema({ query: RootQuery });
export default schema;