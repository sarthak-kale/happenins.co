import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Refuse to create demo identities in any database other than our isolated local setup.
const url = new URL(process.env.DATABASE_URL || "postgresql://invalid/invalid");
if (url.hostname !== "127.0.0.1" || url.port !== "5433" || url.pathname !== "/happenins_local") {
  throw new Error("Local demo seeding requires the isolated happenins_local database on 127.0.0.1:5433.");
}

const prisma = new PrismaClient();
const password = "local-demo-2026";

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  const accounts: Array<{ id: string; email: string; fullName: string; role: UserRole }> = [
    { id: "local_attendee", email: "attendee@happenins.test", fullName: "Local Attendee", role: "USER" },
    { id: "local_organizer", email: "organizer@happenins.test", fullName: "Local Organizer", role: "ORGANIZER" },
    { id: "local_admin", email: "admin@happenins.test", fullName: "Local Admin", role: "ADMIN" },
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: { ...account, passwordHash, isEmailVerified: true, emailVerifiedAt: new Date() },
    });
  }

  const organizer = await prisma.user.findUniqueOrThrow({ where: { email: "organizer@happenins.test" } });
  const profile = await prisma.organizerProfile.upsert({
    where: { userId: organizer.id },
    update: {},
    create: { id: "local_organizer_profile", userId: organizer.id, companyName: "Happenins Local Demo", isVerified: true },
  });

  await prisma.event.upsert({
    where: { slug: "local-community-meetup" },
    update: {},
    create: {
      id: "local_demo_event",
      organizerId: profile.id,
      title: "Local Community Meetup",
      slug: "local-community-meetup",
      description: "A free local demo event. Try reserving a ticket, viewing its QR pass, and using the organizer dashboard.",
      category: "Tech Meetups",
      locationType: "VENUE",
      venue: "Local Demo Hall",
      city: "Metropolis",
      status: "PUBLISHED",
      startsAt: new Date(Date.now() + 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      ticketTiers: { create: [{ id: "local_demo_tier", name: "Free Admission", price: 0, capacity: 100 }] },
    },
  });

  console.log("Local demo accounts and free event are ready. Existing records were left unchanged.");
  console.log("Accounts: attendee@happenins.test, organizer@happenins.test, admin@happenins.test");
  console.log(`Demo password: ${password}`);
}

main().catch((error) => {
  console.error("Local seed failed:", error.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
