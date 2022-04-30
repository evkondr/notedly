// index.js
// This is the main entry point of our application
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken')
const db = require('./db');
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const getToken = token => {
    if(token){
        try {
            return jwt.verify(token, process.env.JWT_SECRET)
        } catch (e) {
            throw new Error('Session invalid');
        }
    }
}
//Connect to DB
db.connect(DB_HOST);

//Connect to ApolloServer
const server = new ApolloServer({typeDefs, resolvers, context: ({req}) => {
    const token = req.headers.authorization;
    const user = getToken(token);
    console.log(user)
    return { models, user}
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