import TestModel from "../models/Test.js";

export const getAll = async (req, res) => {
  try {
    const tests = await TestModel.find().populate("user").exec();
    res.json(tests);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать тест",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const testId = req.params.id;

    TestModel.findByIdAndUpdate(
      {
        _id: testId,
      },
      {
        $inc: {
          viewsCount: 1,
        },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось вернуть статью",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Статья не найдена",
          });
        }

        res.json(doc);
      }
    )
      .populate("user")
      .populate("comments.postedBy");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать тест",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new TestModel({
      title: req.body.title,
      text: req.body.text,
      category: req.body.category,
      backgroundImage: req.body.backgroundImage,
      ques: req.body.ques,
      user: req.userId,
    });

    const test = await doc.save();

    res.json(test);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать тест",
    });
  }
};

export const update = async (req, res) => {
  try {
    const testId = req.params.id;

    await TestModel.findOneAndUpdate(
      {
        _id: testId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        category: req.body.category,
        backgroundImage: req.body.backgroundImage,
        ques: req.body.ques,
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить тест",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const post = await TestModel.findByIdAndDelete(req.params.id);
    if (!post) return res.json({ message: "Такого поста не существует" });

    res.json({ message: "Пост был удален." });
  } catch (error) {
    res.json({ message: "Что-то пошло не так." });
  }
};

export const createComment = async (req, res) => {
  try {
    const { testId, text } = req.body;

    const comment = {
      text,
      postedBy: req.userId,
    };

    TestModel.findByIdAndUpdate(
      {
        _id: testId,
      },
      {
        $push: {
          comments: comment,
        },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось вернуть комментарий",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Комментарий не найден",
          });
        }

        const { comments } = doc;
        const newComment = comments.slice(-1);
        res.json(...newComment);
      }
    ).populate("comments.postedBy");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать комментарий",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = req.params.name;

    TestModel.find({ category }, (err, doc) => {
      if (err) {
        res.status(500).json({
          message: "Не удалось найти категорию",
        });
      }

      if (!doc) {
        return res.status(500).json({
          message: "Заметки не найдены",
        });
      }
      res.json(doc);
    }).populate("user");
  } catch (err) {
    res.status(500).json({
      message: "Не удалось отобразить категорию",
    });
  }
};
