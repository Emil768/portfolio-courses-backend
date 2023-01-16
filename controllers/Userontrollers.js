import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sharp from "sharp";

import UserModel from "../models/User.js";
import { cloudinary, bufferToStream } from "../utils/index.js";

export const uploads = async (req, res) => {
  try {
    console.log(req.file);
    const data = await sharp(req.file.buffer, { animated: true })
      .webp({ quality: 30 })
      .toBuffer();
    const stream = cloudinary.uploader.upload_stream((result, error) => {
      if (error) return console.error(error);
      return res.json(result);
    });

    bufferToStream(data).pipe(stream);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось загрузить файл",
    });
  }
};

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: {
        public_id: req.body.avatarUrl.public_id,
        url: req.body.avatarUrl.url,
      },
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        message: "Пользователь не найден",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      { expiresIn: "30d" }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(req.body);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};

export const authMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
