import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import protectedRoute from './routes/protectedRoute'
import connect from './db/connect'
import errorHandlerMiddleware from './middlewares/errorHandler'


dotenv.config()
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/protected', protectedRoute);
app.use(errorHandlerMiddleware())

const port = process.env.PORT || 8080

const start = async () => {
  try {
    await connect();
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();