import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';
describe('password', () => {
    it('hashes and verifies', async () => {
        const hash = await hashPassword('correct horse battery staple', 10);
        expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
        expect(await verifyPassword('wrong', hash)).toBe(false);
    });
});
//# sourceMappingURL=password.test.js.map