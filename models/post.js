const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const PostSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String, required: false },
  text: { type: String, required: true },
  added: { type: Date, required: true },
});

PostSchema.virtual('dateFormatted').get(function () {
  return DateTime.fromJSDate(this.added).toLocaleString(DateTime.DATETIME_SHORT);
});

module.exports = mongoose.model('Post', PostSchema);
