// test-bcrypt.js
const bcrypt = require('bcryptjs');

const inputPassword = 'Duma8298733$#3';
const storedHash = '$2b$10$GlElVZa4ttBR7uBXLme9D.JEdQl.Ji9JeoFxHwTkRBYqkDdDwvMsu';

bcrypt.compare(inputPassword, storedHash).then(isMatch => {
  console.log('🔑 Input password:', inputPassword);
  console.log('🔒 Stored hash:', storedHash);
  console.log('✅ Match:', isMatch);
});

