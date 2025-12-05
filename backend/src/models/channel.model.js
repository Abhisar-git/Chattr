// models/channel.model.js
import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // User who created the channel
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Members of the channel
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Index for faster channel listing/searching
channelSchema.index({ name: 1 });

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
