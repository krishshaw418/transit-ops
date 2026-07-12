import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is up and running." });
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}...`);
})
