import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Penggunaan: npm run hash-password <password_kamu>');
  console.error('Contoh: npm run hash-password "RahasiaSuper3827"');
  process.exit(1);
}

const saltRounds = 12;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n=== HASH PASSWORD BCRYPT BERHASIL DIBUAT ===');
console.log('Salin baris berikut ke file server/.env Anda:');
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
