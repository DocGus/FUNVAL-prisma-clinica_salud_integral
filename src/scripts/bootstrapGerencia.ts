import * as readline from "node:readline/promises";
import bcrypt from "bcryptjs";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

const getPasswordFromPrompt = async (): Promise<string> => {
  if (process.stdin.isTTY && "setRawMode" in process.stdin) {
    return await new Promise((resolve, reject) => {
      let value = "";

      process.stdout.write("Contraseña: ");
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const onData = (chunk: Buffer | string) => {
        const character = chunk.toString();

        if (character === "\r" || character === "\n") {
          process.stdin.removeListener("data", onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(value);
          return;
        }

        if (character === "\u0003") {
          process.stdin.removeListener("data", onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          reject(new Error("La entrada fue cancelada"));
          return;
        }

        if (character === "\u007f" || character === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          return;
        }

        value += character;
        process.stdout.write("* ");
      };

      process.stdin.on("data", onData);
    });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const input = await rl.question("Contraseña: ");
  rl.close();

  return input;
};

export const bootstrapGerencia = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("El correo de la cuenta GERENCIA es obligatorio");
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  return prisma.$transaction(
    async (tx) => {
      const userCount = await tx.user.count();

      if (userCount > 0) {
        throw new Error(
          "No se puede inicializar la primera cuenta GERENCIA porque ya existe al menos un usuario",
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: "GERENCIA",
        },
      });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
};

const main = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const email = (await rl.question("Correo de la primera cuenta GERENCIA: ")).trim();
    const password = await getPasswordFromPrompt();

    const user = await bootstrapGerencia(email, password);

    console.log(
      `Cuenta GERENCIA creada correctamente para ${user.email}.`,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido al crear la cuenta GERENCIA";

    console.error(`Error: ${message}`);
    process.exitCode = 1;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
