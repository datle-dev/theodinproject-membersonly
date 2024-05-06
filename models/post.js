const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  added: { type: Date, required: true },
});

module.exports = mongoose.model('Post', PostSchema);
