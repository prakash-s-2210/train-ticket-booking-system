// Importing necessary packages and modules
import express from "express"; // web framework
import connectDB from "./mongodb/connect.js";
import cors from "cors"; // middleware for enabling Cross-Origin Resource Sharing
import * as dotenv from "dotenv"; // package for managing environment variables
import helmet from "helmet"; // middleware for securing HTTP headers
import router from "./routes/index.js";


//CONFIGURATIONS AND SETUP
dotenv.config(); // load environment variables from .env file
const app = express(); // create express app
app.use(express.json()); // middleware for parsing JSON request bodies
app.use(helmet()); // middleware for setting various security-related HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // middleware for enabling CORS with cross-origin policy
app.use(cors()); // middleware for enabling CORS with default options

app.get("/", (req, res) => {
  res.send({ message: "Hello World!" }); // root endpoint
});

// /* ROUTES */
app.use("/train", router); // use ticket routes
 
//MONGOOSE SETUP
const PORT = process.env.PORT || 6001; // set server port

const startServer = async () => {
  try {
      connectDB(process.env.MONGO_URL, () => {
      console.log("MongoDB connected, starting server...");
      app.listen(PORT, () => console.log("Server started on port http://localhost:8080")
      );
    });
  } catch (error) {
      console.log(error);
  }
};
startServer();