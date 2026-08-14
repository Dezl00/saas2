const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const item = await prisma.menuItem.findFirst({
    where: { name: { contains: 'بيتزا تشيكن رانش' } },
    include: { sizes: true, addons: true }
  });
  console.log(JSON.stringify(item, null, 2));
}
main().finally(() => prisma.$disconnect());
