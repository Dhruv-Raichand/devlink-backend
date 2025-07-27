const mongoose  = require("mongoose");

const connectionSchema = mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    status: {
        type: String,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            mesaage: "{VALUE} is not a valid status"
        }
    }
}, { timestamps: true });
module.exports = mongoose.model("ConnectionModel", connectionSchema);