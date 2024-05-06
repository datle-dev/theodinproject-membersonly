const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const PostSchema = new Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  added: { type: Date, required: true },
});

PostSchema.virtual('dateFormatted').get(function () {
  return DateTime.fromJSDate(this.added).toLocaleString(DateTime.DATETIME_SHORT);
});

module.exports = mongoose.model('Post', PostSchema);
