
import { prisma } from "../src/server/db/prisma";

async function main() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      status: true,
    },
  });
  const fs = require('fs');
  fs.writeFileSync('posts.json', JSON.stringify(posts, null, 2));
  console.log("Written to posts.json");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
