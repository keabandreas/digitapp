import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { encryptPassword } from '../src/lib/encryption';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const encryptedPasswordPath = path.join(process.cwd(), 'secret', 'encrypted_password.txt');

rl.question('Enter the new password: ', (password) => {
  // Encrypt the password
  const encryptedPassword = encryptPassword(password);

  // Save the encrypted password
  fs.writeFileSync(encryptedPasswordPath, encryptedPassword);

  console.log('Password encrypted and saved successfully.');
  rl.close();
});
