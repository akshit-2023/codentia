import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import executionRoute from "./routes/executeCode.route.js";
import submissionRoutes from "./routes/submission.route.js";

dotenv.config();

const app = express();

// app.use in Express.js is used to define middleware functions that are executed for every request to the app, or for specific routes.

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hey guys! Welcome to Codentia!!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 8080");
});
