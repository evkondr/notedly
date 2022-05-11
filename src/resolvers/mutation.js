const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError} = require('apollo-server-express');
const mongoose = require('mongoose');
const gravatar = require('../util/gravatar');
const { model } = require('mongoose');

module.exports = {
    //Create a note
    newNote: async (parent, { content }, { models, user }) => {
        if(!user) {
            throw new AuthenticationError('You must be signed in to create a note')
        }
        return await models.Note.create({
            content,
            author: mongoose.Types.ObjectId(user.id)
        });
    },
    //Update a note
    updateNote: async (parent, {id, content}, { models, user }) => {
        if(!user) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }
        const note = await models.Note.findById(id);
        if(note && String(note.author) !== user.id) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }
        return await models.Note.findOneAndUpdate(
            {_id:id}, 
            {$set: {content}},
            {new: true} );
    },
    //Delete a note
    deleteNote: async (parent, {id}, { models, user }) => {
        if(!user) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }
        const note = await models.Note.findById(id)
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError('You don\'t have permissions to delete the note');
        }
        try {
            await note.remove();
            return true;
        } catch (error){
            return false;
        }
    },
    //Delete all notes
    deleteAllNotes: async (parent, args, {models}) => {
        try{
            await models.Note.deleteMany({})
            return true;
        } catch (error){
            console.log(error)
            return false;
        }
        
    },
    //Registration
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
    //Sign in
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
    },
    //Toggle favorite
    toggleFavorite: async (parent, { id }, { models, user }) => {
        if (!user) {
            throw new AuthenticationError();
        }
        const note = await models.Note.findById(id);
        const hasUser = note.favoritedBy.indexOf(user.id);
        if (hasUser >= 0) {
            return await models.Note.findByIdAndUpdate(id, {
                $pull: {
                    favoritedBy: mongoose.Types.ObjectId(user.id)
                },
                $inc: {
                    favoriteCount: -1
                }
            }, {
                new: true
            });
        } else {
            return await models.Note.findByIdAndUpdate(id, {
                $push: {
                    favoritedBy: mongoose.Types.ObjectId(user.id)
                },
                $inc: {
                    favoriteCount: 1
                }
            }, {
                new: true
            })
        }
    } 
}