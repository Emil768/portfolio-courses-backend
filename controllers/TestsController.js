import TestModel from "../models/Test.js";
import UserModel from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";

export const getAll = async (req, res) => {
  try {
    const tests = await TestModel.find()
      .sort({ viewsCount: -1 })
      .populate("user")
      .populate("likes.likeBy")
      .exec();
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

export const getActionsUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    await TestModel.find()
      .populate("user")
      .lean()
      .exec(function (err, tests) {
        const allPublish = tests.filter(
          ({ user }) => user._id.toString() === req.params.id
        );

        const allComments = tests
          .map((item) => {
            return {
              ...item,
              comments: item.comments.filter(
                ({ postedBy }) => postedBy.toString() === req.params.id
              ),
            };
          })
          .filter((elem) => elem.comments.length > 0);

        const allLikes = tests
          .map((item) => {
            return {
              ...item,
              likes: item.likes.filter(
                ({ likeBy }) => likeBy.toString() === req.params.id
              ),
            };
          })
          .filter((elem) => elem.likes.length > 0);

        const allScore = tests
          .map((item) => {
            return {
              ...item,
              score: item.score.filter(
                ({ scoreBy }) => scoreBy.toString() === req.params.id
              ),
            };
          })
          .filter((elem) => elem.score.length > 0);

        if (err) {
          res.status(500).json({
            message: "Не удалось найти прогресс",
          });
        }

        res.json({
          user: userData,
          allLikes,
          allComments,
          allPublish,
          allScore,
        });
      });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось получить прогресс",
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

    const test = await TestModel.findById(testId);

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

export const likeTest = async (req, res) => {
  try {
    const { testId } = req.body;

    TestModel.findByIdAndUpdate(
      {
        _id: testId,
      },
      {
        $push: {
          likes: { likeBy: req.userId, createdAt: new Date() },
        },
      },

      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось поставить нравится",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Не удалось поставить нравится",
          });
        }

        res.json(doc);
      }
    )
      .populate("user")
      .populate("likes.likeBy");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось поставить нравится",
    });
  }
};

export const unlikeTest = async (req, res) => {
  try {
    const { testId } = req.body;

    TestModel.findByIdAndUpdate(
      {
        _id: testId,
      },
      {
        $pull: {
          likes: { likeBy: req.userId },
        },
      },
      {
        returnDocument: "after",
      },
      (err, doc) => {
        if (err) {
          return res.status(500).json({
            message: "Не удалось поставить не нравится",
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: "Не удалось поставить не нравится",
          });
        }

        res.json(doc);
      }
    )
      .populate("user")
      .populate("likes.likeBy");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось поставить не нравится",
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { text, testId } = comment;

    const newComment = {
      text,
      postedBy: req.userId,
      createdAt: new Date(),
    };

    TestModel.findByIdAndUpdate(
      {
        _id: testId,
      },
      {
        $push: {
          comments: newComment,
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
      (comment) => comment.id.toString() === req.params.id
    );

    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    test.comments = test.comments.map((item) => {
      if (item.id.toString() === req.params.id) {
        item.text = req.body.text;
        item.createdAt = new Date();
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
      (comment) => comment.id.toString() === req.params.id
    );

    if (!comment)
      return res.status(404).json({ message: "Комментарий не найден" });

    test.comments = test.comments.filter(
      ({ id }) => id.toString() !== req.params.id
    );

    await (await test.save()).populate("comments.postedBy");

    res.json(test.comments);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось удалить комментарий",
    });
  }
};

export const getTopScore = async (req, res) => {
  try {
    const test = await TestModel.findById({ _id: req.params.id }).populate(
      "score.scoreBy"
    );
    const topScore = test.score.sort((a, b) =>
      a.totalScore > b.totalScore ? -1 : 1
    );

    res.json(topScore);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось удалить комментарий",
    });
  }
};

export const getScoreUser = async (req, res) => {
  try {
    const { totalScore } = req.body;
    const newTotal = {
      scoreBy: req.userId,
      createdAt: new Date(),
      totalScore,
    };

    await TestModel.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { score: { scoreBy: req.userId } } }
    );

    const tests = await TestModel.findById({ _id: req.params.id });
    tests.score.push(newTotal);

    await (await tests.save()).populate("score.scoreBy");

    res.json(tests);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обработать результат",
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = req.params.name;
    TestModel.find({ "category.value": category }, (err, doc) => {
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
    })
      .populate("user")
      .populate("likes.likeBy");
  } catch (err) {
    res.status(500).json({
      message: "Не удалось отобразить категорию",
    });
  }
};

export const sortByViews = async (req, res) => {
  try {
    const tests = await TestModel.find()
      .sort({ viewsCount: -1 })
      .populate("user")
      .populate("likes.likeBy");

    res.json(tests);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось отобразить категорию",
    });
  }
};

export const sortByDate = async (req, res) => {
  try {
    const tests = await TestModel.find()
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("likes.likeBy");

    res.json(tests);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось отобразить категорию",
    });
  }
};

export const sortByLikes = async (req, res) => {
  try {
    const tests = await TestModel.find()
      .sort({ likes: -1 })
      .populate("user")
      .populate("likes.likeBy");
    res.json(tests);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось отобразить категорию",
    });
  }
};
