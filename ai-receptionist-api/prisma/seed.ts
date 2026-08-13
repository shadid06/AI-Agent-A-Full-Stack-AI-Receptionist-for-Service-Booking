import "dotenv/config";
import { PrismaClient, Industry, StaffRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.create({
    data: {
      slug: "demo-wellness-care",
      name: "Demo Wellness & Care",
      industry: Industry.SPA,
      description: "Demo business for the AI Receptionist open-source project.",
      timezone: "Asia/Dhaka",
      phone: "+8801700000000",
      email: "demo@example.com",
      address: "Dhaka, Bangladesh",
      services: {
        create: [
          {
            name: "Relaxation Massage",
            description: "60-minute relaxation massage.",
            durationMin: 60,
            price: "2500.00"
          },
          {
            name: "Deep Tissue Massage",
            description: "60-minute deep tissue massage.",
            durationMin: 60,
            price: "3000.00"
          },
          {
            name: "Consultation",
            description: "30-minute general consultation.",
            durationMin: 30,
            price: "1000.00"
          }
        ]
      },
      staff: {
        create: [
          {
            name: "Ava Rahman",
            role: StaffRole.THERAPIST,
            email: "ava@example.com",
            availability: {
              create: [
                { dayOfWeek: 0, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
                { dayOfWeek: 6, startTime: "10:00", endTime: "18:00" }
              ]
            }
          },
          {
            name: "Nadia Karim",
            role: StaffRole.THERAPIST,
            email: "nadia@example.com",
            availability: {
              create: [
                { dayOfWeek: 0, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 1, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 2, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 3, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 4, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 5, startTime: "12:00", endTime: "20:00" },
                { dayOfWeek: 6, startTime: "12:00", endTime: "20:00" }
              ]
            }
          }
        ]
      }
    },
    include: { services: true, staff: true }
  });

  console.log("\nDemo business created:");
  console.log(`BUSINESS_ID=${business.id}`);
  console.log(`Name=${business.name}`);
  console.log("\nCopy BUSINESS_ID into .env as DEFAULT_BUSINESS_ID if desired.\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
