const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  admin: { type: Boolean, required: true },
  member: { type: Boolean, required: true },
});

module.exports = mongoose.model('User', UserSchema);
