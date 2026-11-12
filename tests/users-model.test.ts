import type { Prisma, User } from "../generated/prisma/client.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUsersModel } from "../src/models/usersModel.js";

type UserModelClient = {
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

const mocks = vi.hoisted(() => ({
  create: vi.fn<UserModelClient["user"]["create"]>(),
  count: vi.fn<UserModelClient["user"]["count"]>(),
  findUnique: vi.fn<UserModelClient["user"]["findUnique"]>(),
  findFirst: vi.fn<UserModelClient["user"]["findFirst"]>(),
}));

describe("users model", () => {
  const userClient = {
    user: {
      create: mocks.create,
      count: mocks.count,
      findUnique: mocks.findUnique,
      findFirst: mocks.findFirst,
    },
  } satisfies UserModelClient;
  const usersModel = createUsersModel(userClient);

  const user: User = {
    id: "a13c3378-e2a3-4408-b19e-4c9a7fd661a8",
    email: "manager@example.com",
    passwordHash: "hashed-password",
    role: "GERENCIA",
    doctorId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user through Prisma", async () => {
    const data: Prisma.UserCreateInput = {
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    };
    mocks.create.mockResolvedValue(user);

    await expect(usersModel.createUser(data)).resolves.toEqual(user);
    expect(mocks.create).toHaveBeenCalledWith({ data });
  });

  it("counts users", async () => {
    mocks.count.mockResolvedValue(0);

    await expect(usersModel.countUsers()).resolves.toBe(0);
    expect(mocks.count).toHaveBeenCalledWith();
  });

  it("retrieves a user by email", async () => {
    mocks.findUnique.mockResolvedValue(user);

    await expect(usersModel.getUserByEmail(user.email)).resolves.toEqual(user);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it("returns null when no user exists for the email", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      usersModel.getUserByEmail("missing@example.com"),
    ).resolves.toBeNull();
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "missing@example.com" },
    });
  });

  it("retrieves a user by UUID", async () => {
    mocks.findUnique.mockResolvedValue(user);

    await expect(usersModel.getUserById(user.id)).resolves.toEqual(user);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });

  it("returns null when no user exists for the UUID", async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(
      usersModel.getUserById("b13c3378-e2a3-4408-b19e-4c9a7fd661a8"),
    ).resolves.toBeNull();
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { id: "b13c3378-e2a3-4408-b19e-4c9a7fd661a8" },
    });
  });

  it("retrieves the first manager account", async () => {
    mocks.findFirst.mockResolvedValue(user);

    await expect(usersModel.getFirstManager()).resolves.toEqual(user);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { role: "GERENCIA" },
    });
  });

  it("returns null when no manager account exists", async () => {
    mocks.findFirst.mockResolvedValue(null);

    await expect(usersModel.getFirstManager()).resolves.toBeNull();
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { role: "GERENCIA" },
    });
  });
});
