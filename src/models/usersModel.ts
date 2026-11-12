import type { Prisma, User } from "../../generated/prisma/client.js";

type UsersModelClient = {
  user: {
    create(args: { data: Prisma.UserCreateInput }): Promise<User>;
    count(args?: { where?: Prisma.UserWhereInput }): Promise<number>;
    findUnique(args: {
      where: Prisma.UserWhereUniqueInput;
    }): Promise<User | null>;
    findFirst(args: {
      where: Prisma.UserWhereInput;
    }): Promise<User | null>;
  };
};

export const createUsersModel = (client: UsersModelClient) => ({
  createUser: (data: Prisma.UserCreateInput) => {
    return client.user.create({ data });
  },

  countUsers: () => {
    return client.user.count();
  },

  getUserByEmail: (email: string) => {
    return client.user.findUnique({ where: { email } });
  },

  getUserById: (id: string) => {
    return client.user.findUnique({ where: { id } });
  },

  getFirstManager: () => {
    return client.user.findFirst({ where: { role: "GERENCIA" } });
  },
});
