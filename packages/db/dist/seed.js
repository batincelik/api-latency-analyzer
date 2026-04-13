import { loadEnv } from '@ala/config';
import { prisma } from './index.js';
async function main() {
    loadEnv();
    await prisma.$connect();
    console.log('Seed complete (no default data).');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map