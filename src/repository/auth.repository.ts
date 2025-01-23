import RefreshToken from "../models/RefreshToken";


const Repository = {
  findOneByEmail: async (model, email) => {
    return await model.findOne({ email });
  },
  findOne: async (model, uuid) => {
    return await model.findOne({ uuid });
  },
  findOneByUserId: async (model, userId) => {
    return await model.findOne({ userId });
  },
  save: async (user) => {
    return await user.save();
  },
  storeTokens: async (userId, refreshToken, expiresAt) => {
    return await RefreshToken.findOneAndUpdate({ userId }, { refreshToken, expiresAt }, { upsert: true, new: true })
  },
  deleteToken: async (model, userId) => {
    return await model.deleteOne({ userId });
  }
}

export default Repository