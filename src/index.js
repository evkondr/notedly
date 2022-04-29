// index.js
// This is the main entry point of our application
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const { ApolloServer } = require('apollo-server-express');
const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

//Connect to DB
db.connect(DB_HOST);

//Connect to ApolloServer
const server = new ApolloServer({typeDefs, resolvers, context: () => {
    return { models }
}});

//Apply middleware
server.applyMiddleware({app, path: '/api'});

//Basic route
app.get('/', (req, res) => {
    res.send(`hello world!`)
});

//Start server
app.listen({port}, ()=> {
    console.log(`GraphQL Server running at
    http://localhost:${port}${server.graphqlPath}`)
});