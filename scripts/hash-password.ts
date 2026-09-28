import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash: ', (password) => {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log('\n--- BCRYPT HASH ---');
  console.log(hash);
  console.log('-------------------\n');
  console.log('Copy the hash above and set it as ADMIN_PASSWORD_HASH in your .env file.');
  rl.close();
});
