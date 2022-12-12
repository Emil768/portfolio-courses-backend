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
    const testId = req.params.id;

    TestModel.findByIdAndDelete(
      {
        _id: testId,
      },
      (err, doc) => {
        if (err) {
          res.status(500).json({
            message: "Не удалось удалить тест",
          });
        }

        if (!doc) {
          return res.status(500).json({
            message: "Тест не найдена",
          });
        }
        res.json(doc);
      }
    );
  } catch (err) {
    res.status(500).json({
      message: "Не удалось удалить тест",
    });
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

export const updateComment = async (req, res) => {
  try {
    const test = await TestModel.findById(req.body.testId);

    const comment = test.comments.find(
      (comment) => comment.id === req.params.id
    );

    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    test.comments = test.comments = test.comments.map((item) => {
      if (item.id === req.params.id) {
        item.text = req.body.text;
      }
      return item;
    });

    await (await test.save()).populate("comments.postedBy");

    res.json(test.comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить комментарий",
    });
  }
};

export const removeComment = async (req, res) => {
  try {
    const test = await TestModel.findById(req.body.testId);

    const comment = test.comments.find(
      (comment) => comment.id === req.params.id
    );

    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    test.comments = test.comments.filter(({ id }) => id !== req.params.id);

    await (await test.save()).populate("comments.postedBy");

    res.json(test.comments);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось удалить комментарий",
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
