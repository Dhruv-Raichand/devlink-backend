const mongoose = require("mongoose");

const connectionSchema = mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        mesaage: "{VALUE} is not a valid status",
      },
    },
  },
  { timestamps: true }
);

connectionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionSchema.pre("save", function (next) {
  // Check if the fromUserId is same as toUserId
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send request to yourself!");
  }

  next();
});

module.exports = mongoose.model("ConnectionModel", connectionSchema);
