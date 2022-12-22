import mongoose from "mongoose";

const TestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      value: String,
      label: String,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },

    backgroundImage: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    ques: [
      {
        title: String,
        imageURL: {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
        answers: [
          {
            answer: String,
            correct: Boolean,
          },
        ],
      },
    ],

    score: [
      {
        scoreBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        totalScore: Number,
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],

    likes: [
      {
        likeBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: {
          type: Date,
          createdAt: {
            type: Date,
            default: new Date(),
          },
        },
      },
    ],

    comments: [
      {
        text: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Test", TestSchema);
