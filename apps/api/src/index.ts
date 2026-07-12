import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.use("/api", routes);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
