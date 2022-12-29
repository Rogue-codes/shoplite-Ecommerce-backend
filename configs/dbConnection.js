import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.URI;

export const connectDb = async () => {
    mongoose.set('strictQuery', true);
  const Connection = await mongoose
    .connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`mongo DB connection successful`.cyan.underline.bold);
    })
    .catch((err) => {
      console.log("an error occured: ", err.message);
    });
};

