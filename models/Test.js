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

    ques: {
      type: Array,
      default: [
        {
          title: String,
          answers: {
            type: Array,
            default: [
              {
                answer: String,
                correct: Boolean,
              },
            ],
          },
        },
      ],
    },

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
