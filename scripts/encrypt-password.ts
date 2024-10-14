import fs from 'fs';
import path from 'path';
import { encryptPassword } from '../src/lib/encryption';

const passwordPath = path.join(process.cwd(), 'secret', 'password.txt');
const encryptedPasswordPath = path.join(process.cwd(), 'secret', 'encrypted_password.txt');

// Read the plain text password
const password = fs.readFileSync(passwordPath, 'utf8').trim();

// Encrypt the password
const encryptedPassword = encryptPassword(password);

// Save the encrypted password
fs.writeFileSync(encryptedPasswordPath, encryptedPassword);

console.log('Password encrypted and saved successfully.');
