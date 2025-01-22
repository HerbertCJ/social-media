const Repository = {
  findOne: async (model, email) => {
    const data = await model.findOne({ email });

    return data
  },
  save: async (user) => {
    return await user.save();
  }
}

export default Repository