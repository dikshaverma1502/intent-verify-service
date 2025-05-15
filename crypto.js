const crypto = require('crypto');
const fs = require('fs');

// Generate a 2048-bit RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

// Export the keys to PEM format
const privateKeyPem = privateKey.export({
  format: 'pem',
  type: 'pkcs1',
});

const publicKeyPem = publicKey.export({
  format: 'pem',
  type: 'spki',
});

// Save the keys to PEM files
fs.writeFileSync('privateKey.pem', privateKeyPem);
fs.writeFileSync('publicKey.pem', publicKeyPem);

console.log('Keys generated and saved to privateKey.pem and publicKey.pem');
