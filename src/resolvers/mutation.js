const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError} = require('apollo-server-express');
const gravatar = require('../util/gravatar');

module.exports = {
    newNote: async (parent, { content }, { models }) => {
        return await models.Note.create({
            content,
            author: "Adam Scott"
        });
    },
    updateNote: async (parent, {id, content}, { models }) => {
        return await models.Note.findOneAndUpdate(
            {_id:id}, 
            {$set: {content:content}},
            {new: true} );
    },
    deleteNote: async (parent, {id}, { models }) => {
        try{
            await models.Note.fideOneAndRemove({_id: id});
            return true;
        } catch (error){
            return false;
        }
    },
    signUp: async (paremt, {username, email, password}, {models}) => {
        email = email.trim().toLowerCase();
        const hashed = await bcrypt.hash(password, 10);
        const avatar = gravatar(email);
        try {
            const user = await models.User.create({
                username,
                email,
                password: hashed,
                avatar
            });
            return jwt.sign({id: user._id}, process.env.JWT_SECRET);
        } catch (error) {
            console.log(error);
            throw new Error('Error creating account')
        }
    }
}