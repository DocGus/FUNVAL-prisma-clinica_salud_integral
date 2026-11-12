import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  hash: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: { hash: mocks.hash },
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: {
    $transaction: async (
      callback: (tx: {
        user: {
          count: typeof mocks.count;
          create: typeof mocks.create;
        };
      }) => Promise<unknown>,
    ) => {
      return callback({
        user: {
          count: mocks.count,
          create: mocks.create,
        },
      });
    },
    $disconnect: vi.fn(),
  },
}));

import { bootstrapGerencia } from "../src/scripts/bootstrapGerencia.js";

describe("bootstrap gerencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the first GERENCIA user when no users exist", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.create.mockResolvedValue({
      id: "user-id",
      email: "gerencia@example.com",
      role: "GERENCIA",
    });

    const result = await bootstrapGerencia("Gerencia@Example.com", "supersecure123");

    expect(mocks.count).toHaveBeenCalledTimes(1);
    expect(mocks.hash).toHaveBeenCalledWith("supersecure123", 12);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        email: "gerencia@example.com",
        passwordHash: "hashed-password",
        role: "GERENCIA",
      },
    });
    expect(result).toEqual({
      id: "user-id",
      email: "gerencia@example.com",
      role: "GERENCIA",
    });
  });

  it("rejects bootstrap when at least one user already exists", async () => {
    mocks.count.mockResolvedValue(1);

    await expect(
      bootstrapGerencia("gerencia@example.com", "supersecure123"),
    ).rejects.toThrow(
      "No se puede inicializar la primera cuenta GERENCIA porque ya existe al menos un usuario",
    );
  });

  it("does not expose the password hash in the bootstrap result", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.create.mockResolvedValue({
      id: "user-id",
      email: "gerencia@example.com",
      role: "GERENCIA",
    });

    const result = await bootstrapGerencia("gerencia@example.com", "supersecure123");

    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("password");
  });

  it("propagates database errors during bootstrap", async () => {
    mocks.count.mockResolvedValue(0);
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.create.mockRejectedValue(new Error("db exploded"));

    await expect(
      bootstrapGerencia("gerencia@example.com", "supersecure123"),
    ).rejects.toThrow("db exploded");
  });
});
