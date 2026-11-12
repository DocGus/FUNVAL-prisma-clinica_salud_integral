import type { Prisma } from "../../generated/prisma/client.js";

const specialtySelect = {
  id: true,
  name: true,
} satisfies Prisma.SpecialtySelect;

type Specialty = Prisma.SpecialtyGetPayload<{
  select: typeof specialtySelect;
}>;

type SpecialtiesModelClient = {
  specialty: {
    findMany(args: {
      orderBy: Prisma.SpecialtyOrderByWithRelationInput[];
      select: typeof specialtySelect;
    }): Promise<Specialty[]>;
  };
};

export const createSpecialtiesModel = (client: SpecialtiesModelClient) => ({
  getSpecialties: () => {
    return client.specialty.findMany({
      orderBy: [{ name: "asc" }],
      select: specialtySelect,
    });
  },
});
