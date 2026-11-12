import type { Prisma } from "../../generated/prisma/client.js";

const doctorDirectorySelect = {
  id: true,
  firstName: true,
  lastName: true,
  professionalLicense: true,
  email: true,
  specialty: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.DoctorSelect;

type DoctorDirectoryEntry = Prisma.DoctorGetPayload<{
  select: typeof doctorDirectorySelect;
}>;

type DoctorsModelClient = {
  doctor: {
    findMany(args: {
      where?: Prisma.DoctorWhereInput;
      select: typeof doctorDirectorySelect;
    }): Promise<DoctorDirectoryEntry[]>;
  };
};

export const createDoctorsModel = (client: DoctorsModelClient) => ({
  getDoctors: (specialty?: string) => {
    return client.doctor.findMany({
      ...(specialty
        ? {
            where: {
              specialty: {
                is: {
                  name: {
                    equals: specialty,
                    mode: "insensitive",
                  },
                },
              },
            },
          }
        : {}),
      select: doctorDirectorySelect,
    });
  },
});
