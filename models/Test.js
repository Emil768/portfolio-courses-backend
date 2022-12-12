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
      type: String,
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },

    backgroundImage: {
      type: String,
      required: true,
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

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        text: String,
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: { type: String, default: new Date() },
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
