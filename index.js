import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import {
  loginValidation,
  registerValidation,
  testCreateValidation,
} from "./validations.js";

import { UserController, TestController } from "./controllers/index.js";

import { checkAuth, handlerValidationError } from "./utils/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:wwwwww@cluster0.n7ggb6x.mongodb.net/tests?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB OK!");
  })
  .catch((err) => console.log("DB ERROR!", err));

const app = express();

app.use(express.json());
app.use(cors());

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

//Получение пользователя
app.get("/auth/me/:id", UserController.authUser);

//Загрузка аватарок
app.post("/uploads", UserController.uploads);

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

app.post("/comments", checkAuth, TestController.createComment);
app.post("/comments/:id", checkAuth, TestController.removeComment);
app.post("/comments/edit/:id", checkAuth, TestController.updateComment);

app.delete("/tests/:id", checkAuth, TestController.remove);

app.get("/category/:name", TestController.getCategory);

app.listen(3001, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Port starting in 3001...");
});
