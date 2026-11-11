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
  getDoctors: (specialtyId?: string) => {
    return client.doctor.findMany({
      ...(specialtyId ? { where: { specialtyId } } : {}),
      select: doctorDirectorySelect,
    });
  },
});
