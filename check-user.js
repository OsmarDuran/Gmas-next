
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'test.employee@gmas.local';
    const user = await prisma.usuario.findUnique({
        where: { email },
        include: { rol: true }
    });
    console.log(JSON.stringify(user, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
