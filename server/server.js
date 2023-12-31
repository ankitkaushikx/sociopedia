import dotenv from "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db.js";

// ROUTES IMPORT
import authRoutes from "./routes/authRoutes.js"; // Import authRoutes
import { register } from "./controllers/auth.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { createPost } from "./controllers/post.js";
import { verifyToken } from "./middleware/auth.js";
/* CONFIGURATIONS   */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Creating an Express App */
const app = express();

/* Enable the app to parse (read) json data in body request */
app.use(express.json());
/* Middleware to add headers to our HTTP request -- make our app secure */
app.use(helmet());

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("short"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: ["https://sociopedia-sooty.vercel.app/"],
    methods: ["POST", "GET", "PATCH"],
    credentials: true,
  })
);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* ROUTES */
// Mount authRoutes at the path "/auth"

// ROUTES WITH FILES
app.get("/", (req, res) => {
  res.json("Hello");
});
app.post("/posts", verifyToken, upload.single("picture"), createPost);
app.post("/auth/register", upload.single("picture"), register);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);

/* DATABASE AND SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("--------SERVER STARTED SUCCESSFULLY AT", PORT);
});
await connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("--------SERVER STARTED SUCCESSFULLY AT", PORT);
    });
  })
  .catch((error) => {
    console.error("DATABASE OR SERVER ERROR\n", error);
  });
