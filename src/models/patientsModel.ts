import type { Patient, Prisma } from "../../generated/prisma/client.js";

type PatientWithHistory = Prisma.PatientGetPayload<{
  include: {
    appointments: {
      include: {
        doctor: {
          include: {
            specialty: true;
          };
        };
      };
    };
  };
}>;

type PatientsModelClient = {
  patient: {
    create(args: { data: Prisma.PatientCreateInput }): Promise<Patient>;
    findMany(args: {
      orderBy: Prisma.PatientOrderByWithRelationInput[];
    }): Promise<Patient[]>;
    findUnique(args: {
      where: Prisma.PatientWhereUniqueInput;
      include: {
        appointments: {
          include: {
            doctor: {
              include: {
                specialty: true;
              };
            };
          };
          orderBy: Prisma.AppointmentOrderByWithRelationInput;
        };
      };
    }): Promise<PatientWithHistory | null>;
  };
};

export const createPatientsModel = (client: PatientsModelClient) => ({
  createPatient: (data: Prisma.PatientCreateInput) => {
    return client.patient.create({ data });
  },

  getAllPatients: () => {
    return client.patient.findMany({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });
  },

  getPatientById: (id: string) => {
    return client.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: {
              include: {
                specialty: true,
              },
            },
          },
          orderBy: {
            scheduledAt: "desc",
          },
        },
      },
    });
  },
});
