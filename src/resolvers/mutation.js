const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError} = require('apollo-server-express');
const mongoose = require('mongoose');
const gravatar = require('../util/gravatar');
const { model } = require('mongoose');

module.exports = {
    //CREATE A NOTE
    newNote: async (parent, { content }, { models, user }) => {
        if(!user) {
            throw new AuthenticationError('You must be signed in to create a note')
        }
        return await models.Note.create({
            content,
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    //UPDATE A NOTE
    updateNote: async (parent, {id, content}, { models }) => {
        return await models.Note.findOneAndUpdate(
            {_id:id}, 
            {$set: {content:content}},
            {new: true} );
    },
    //DELETE ONE NOTE
    deleteNote: async (parent, {id}, { models, user }) => {
        try {
            await models.Note.fideOneAndRemove({_id: id});
            return true;
        } catch (error){
            return false;
        }
    },
    //DELETE ALL NOTES
    deleteAllNotes: async (parent, args, {models}) => {
        try{
            await models.Note.deleteMany({})
            return true;
        } catch (error){
            console.log(error)
            return false;
        }
        
    },
    //REGISTRATION
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
    },
    //SING IN
    signIn: async (parent, {username, email, password}, {models}) => {
        if(email) {
            email = email.trim().toLowerCase();
        }
        const user = await models.User.findOne({$or: [{email}, {username}]});
        if(!user) {
            throw new AuthenticationError('Error signing in'); 
        }
        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) {
            throw new AuthenticationError('Error signing in');
        }
        return jwt.sign({ id: user._id},process.env.JWT_SECRET)
    }
}