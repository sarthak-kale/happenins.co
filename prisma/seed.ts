import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting developer database seed execution...");

  // Clean old entries in safe order if running explicit developer seed
  await prisma.auditLog.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.ticketTier.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizerProfile.deleteMany();
  await prisma.institutionDomain.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create standard attendee user
  await prisma.user.create({
    data: {
      id: "usr_alice123",
      email: "pacific2306@gmail.com",
      fullName: "Pacific Guest",
      passwordHash,
      role: "USER",
    },
  });

  // 2. Create organizer user and verified profile
  const organizerUser = await prisma.user.create({
    data: {
      id: "usr_bob_org",
      email: "organizer@happenins.com",
      fullName: "Bob Sullivan",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  await prisma.organizerProfile.create({
    data: {
      userId: organizerUser.id,
      companyName: "Metropolis Community Arts",
      logoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=120&q=80",
      website: "https://metropoliscommunityarts.org",
      isVerified: true,
    },
  });

  // 3. Create administrator user
  await prisma.user.create({
    data: {
      id: "usr_admin_charlie",
      email: "admin@happenins.com",
      fullName: "Charlie Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 4. Seed default institutions
  const defaults = [
    {
      name: "Ramdeobaba University (RBU Nagpur)",
      slug: "ramdeobaba-university",
      type: "UNIVERSITY",
      logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80",
      primaryDomain: "rbunagpur.in",
      additionalDomains: ["student.rbunagpur.in", "rknec.edu"],
    },
    {
      name: "Indian Institute of Technology Bombay (IIT Bombay)",
      slug: "iit-bombay",
      type: "UNIVERSITY",
      logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80",
      primaryDomain: "iitb.ac.in",
      additionalDomains: ["student.iitb.ac.in"],
    },
    {
      name: "Visvesvaraya National Institute of Technology (VNIT Nagpur)",
      slug: "vnit-nagpur",
      type: "COLLEGE",
      logoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80",
      primaryDomain: "vnit.ac.in",
      additionalDomains: ["student.vnit.ac.in"],
    },
  ];

  for (const item of defaults) {
    const inst = await prisma.institution.create({
      data: {
        name: item.name,
        slug: item.slug,
        type: item.type,
        logoUrl: item.logoUrl,
        primaryDomain: item.primaryDomain,
        isVerified: true,
      },
    });

    await prisma.institutionDomain.create({
      data: {
        institutionId: inst.id,
        domain: item.primaryDomain,
        isVerified: true,
      },
    });

    for (const dom of item.additionalDomains) {
      await prisma.institutionDomain.create({
        data: {
          institutionId: inst.id,
          domain: dom,
          isVerified: true,
        },
      });
    }
  }

  console.log("Database seeded successfully with default identities and institutions!");
}

main()
  .catch((e) => {
    console.error("Error during database seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
