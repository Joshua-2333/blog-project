// seed.js
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    // 1) Ensure admin user exists
    const adminEmail = "irad@gmail.com";
    const adminUsername = "Irad";
    const adminPassword = "Odyssey";

    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = await prisma.user.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      console.log("Admin user created:", adminUser.username);
    } else {
      console.log("Admin user already exists:", adminUser.username);
    }

    // 2) Add default posts
    const defaultPosts = [
      {
        title: "Welcome to the Blog!",
        content:
          "This is the first admin post. Enjoy the content and feel free to comment.",
      },
      {
        title: "Rules & Guidelines",
        content:
          "Please keep comments respectful. Admin will moderate and approve content.",
      },
      {
        title: "Chicago Bears Beat the Packers!",
        content:
          "In a thrilling game, the Chicago Bears defeated the Packers. Fans are excited and talking about the future of the team.",
      },
      {
        title: "Chicago Bears vs Rams",
        content:
          "A high-stakes matchup is coming up between the Chicago Bears and the Los Angeles Rams. Who will win? Let’s discuss predictions!",
      },
      {
        title: "Super Bowl Predictions",
        content:
          "The Super Bowl is around the corner. Here are some predictions on who might make it and who has the best chance to win.",
      },
      {
        title: "NFL Week 1 Highlights",
        content:
          "Week 1 was full of surprises! Let’s break down the biggest plays, biggest upsets, and top performers.",
      },
      {
        title: "Top 5 Quarterbacks This Season",
        content:
          "Ranking the top quarterbacks so far this season. Who’s leading and who needs to step up?",
      },
    ];

    for (const post of defaultPosts) {
      const existing = await prisma.post.findUnique({
        where: { id: 0 }, // temporary, replaced below
      });
    }

    for (const post of defaultPosts) {
      // Check if post already exists by title
      const existing = await prisma.post.findFirst({
        where: { title: post.title },
      });

      if (!existing) {
        await prisma.post.create({
          data: {
            title: post.title,
            content: post.content,
            authorId: adminUser.id,
            published: true,
          },
        });

        console.log("Post added:", post.title);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
