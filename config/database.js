const mongoose = require('mongoose');

require('dotenv').config();

// connect to database
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log(`mongoose connection readyState = ${mongoose.connection.readyState}`);
}

module.exports = mongoose.connection;
