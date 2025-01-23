import mongoose from "mongoose";

const { Schema, model } = mongoose;

const refreshTokenSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  refreshToken: {
    index: true,
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const RefreshToken = model('RefreshToken', refreshTokenSchema);

export default RefreshToken;