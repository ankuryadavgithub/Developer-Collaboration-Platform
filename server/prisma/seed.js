import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // You can set these in your .env file, or it will fall back to these safe defaults for development
  const adminEmail = process.env.ADMIN_EMAIL || "admin@devhub.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
  const adminUsername = process.env.ADMIN_USERNAME || "SuperAdmin";

  // Look for any existing Platform Admin
  const existingAdmin = await prisma.user.findFirst({
    where: { platformRole: "PLATFORM_ADMIN" },
  });

  if (!existingAdmin) {
    console.log("No PLATFORM_ADMIN found. Creating default admin...");

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        platformRole: "PLATFORM_ADMIN",
        profileCompleted: true,
      },
    });

    console.log(`✅ Platform Admin created successfully!`);
    console.log(`Username: ${admin.username} | Email: ${admin.email}`);
  } else {
    console.log("✅ Platform Admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
