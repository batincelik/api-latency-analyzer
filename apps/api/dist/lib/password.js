import bcrypt from 'bcryptjs';
export async function hashPassword(plain, rounds) {
    return bcrypt.hash(plain, rounds);
}
export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
//# sourceMappingURL=password.js.map