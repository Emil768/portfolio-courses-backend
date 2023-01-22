import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import {
  loginValidation,
  registerValidation,
  testCreateValidation,
} from "./validations.js";

import { UserController, TestController } from "./controllers/index.js";

import { checkAuth, handlerValidationError } from "./utils/index.js";

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("DB OK!");
  })
  .catch((err) => console.log("DB ERROR!", err));

const app = express();

app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

//Авторизация
app.post(
  "/auth/login",
  loginValidation,
  handlerValidationError,
  UserController.login
);

//Регистрация
app.post(
  "/auth/register",
  registerValidation,
  handlerValidationError,
  UserController.register
);

//Проверка на авторизацию
app.get("/auth/me", checkAuth, UserController.authMe);

//Загрузка аватарок
app.post("/uploads", upload.single("picture"), UserController.uploads);

//Роуты с тестами
app.get("/tests", TestController.getAll);
app.get("/tests/:id", TestController.getOne);
app.post(
  "/tests",
  checkAuth,
  testCreateValidation,
  handlerValidationError,
  TestController.create
);
app.patch(
  "/tests/:id",
  checkAuth,
  handlerValidationError,
  TestController.update
);

app.patch("/like", checkAuth, TestController.likeTest);

app.get("/getActionsUser/:id", TestController.getActionsUser);

app.patch("/unlike", checkAuth, TestController.unlikeTest);

app.post("/getScore/:id", checkAuth, TestController.getScoreUser);
app.get("/getTopScore/:id", TestController.getTopScore);

app.post("/comments", checkAuth, TestController.createComment);
app.post("/comments/:id", checkAuth, TestController.removeComment);
app.post("/comments/edit/:id", checkAuth, TestController.updateComment);

app.delete("/tests/:id", checkAuth, TestController.remove);

app.get("/sort/date", TestController.sortByDate);
app.get("/sort/likes", TestController.sortByLikes);
app.get("/sort/views", TestController.sortByViews);

app.get("/category/:name", TestController.getCategory);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Port starting in 3001...");
});
