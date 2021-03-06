module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find();
    },
    note: async (parent, { id }, { models }) => {
        return await models.Note.findById(id);
    },
    user: async (parent, { username }, { models }) => {
        return await models.User.fimdOne({username})
    },
    users: async (parent, args, { models }) => {
        return await models.User.find({});
    },
    me: async (parent, args, { models, user }) => {
        return models.User.findById(user.id)
    }
}