const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
        return userData;
      }

      throw new AuthenticationError('User is not logged in');
    }
  },

  Mutation: {
    
    userLogin: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Credentials are invalid');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Credentials are invalid');
      }

      const token = signToken(user);
      return { token, user }

    },

    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };

    },

    saveBook: async (parent, { input }, context) => {

      if (context.user) {
        const userUpdated = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );

        return userUpdated;
      }
      throw new AuthenticationError("User needs to be logged in!");
    },

    removeBook: async (parent, { bookId }, context) => {

      if (context.user) {
        const userUpdated = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );

        return userUpdated;
      };

      throw new AuthenticationError("User needs to be logged in!");
    }
  }
};

module.exports = resolvers;
