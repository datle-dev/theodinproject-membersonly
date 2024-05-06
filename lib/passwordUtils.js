const bcrypt = require('bcryptjs');

const genPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const genHash = await bcrypt.hash(password, salt);

  return {
    salt: salt,
    hash: genHash,
  };
}

const validPassword = async (password, hash, salt) => {
  const hashVerify = await bcrypt.compare(password, hash);

  return hash === hashVerify;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
