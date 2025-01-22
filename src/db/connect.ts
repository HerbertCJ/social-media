import mongoose from "mongoose";

const connect = async () => {
  try {
    const connection = await mongoose.connect('mongodb://admin:admin@localhost:27017/social-media?authSource=admin&retryWrites=true')

    if (connection) {
      console.log('Connected to the database')
    }

  } catch (err) {
    console.log('Error while connecting to the database', err)
  }
}

export default connect;
