// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    // Optional soft delete flag (useful but not required by assignment)
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast channel pagination (get recent messages in a channel)
messageSchema.index({ channelId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
