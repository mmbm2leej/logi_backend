const bcrypt = require('bcrypt');

const password = "testpass";

// Generate Salt
const salt = bcrypt.genSaltSync(8);

// Hash Password
const hashedPass = bcrypt.hashSync(password, salt);

console.log(password);
console.log(hashedPass);