import { prisma } from "../src/config/prisma.js";

const seedData = [
  {
    name: "Medicina General",
    doctors: [
      {
        firstName: "Laura",
        lastName: "Martinez",
        professionalLicense: "FUNVAL-MG-001",
      },
      {
        firstName: "Carlos",
        lastName: "Ramirez",
        professionalLicense: "FUNVAL-MG-002",
      },
    ],
  },
  {
    name: "Pediatria",
    doctors: [
      {
        firstName: "Sofia",
        lastName: "Hernandez",
        professionalLicense: "FUNVAL-PED-001",
      },
      {
        firstName: "Daniel",
        lastName: "Lopez",
        professionalLicense: "FUNVAL-PED-002",
      },
    ],
  },
  {
    name: "Cardiologia",
    doctors: [
      {
        firstName: "Elena",
        lastName: "Torres",
        professionalLicense: "FUNVAL-CAR-001",
      },
      {
        firstName: "Miguel",
        lastName: "Castillo",
        professionalLicense: "FUNVAL-CAR-002",
      },
    ],
  },
] as const;

const main = async () => {
  try {
    for (const specialtyData of seedData) {
      const specialty = await prisma.specialty.upsert({
        where: { name: specialtyData.name },
        update: {},
        create: { name: specialtyData.name },
      });

      for (const doctorData of specialtyData.doctors) {
        await prisma.doctor.upsert({
          where: { professionalLicense: doctorData.professionalLicense },
          update: {
            specialty: { connect: { id: specialty.id } },
          },
          create: {
            ...doctorData,
            specialty: { connect: { id: specialty.id } },
          },
        });
      }
    }

    console.log("Seed completed: 3 specialties and 6 doctors ensured.");
  } finally {
    await prisma.$disconnect();
  }
};

await main();
