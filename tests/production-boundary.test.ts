import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

async function findProductionImportsToTestSupport(directory: string): Promise<string[]> {
  const violations: string[] = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      violations.push(...(await findProductionImportsToTestSupport(entryPath)));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".ts")) {
      continue;
    }

    const source = await readFile(entryPath, "utf8");
    const importPattern =
      /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)["']([^"']+)["']/g;

    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier) {
        continue;
      }

      const resolvedSpecifier = specifier.startsWith(".")
        ? resolve(dirname(entryPath), specifier)
        : specifier;
      const normalizedSpecifier = resolvedSpecifier.replaceAll("\\", "/");

      if (/(?:^|\/)tests\/support(?:\/|$)/.test(normalizedSpecifier)) {
        violations.push(`${entryPath} -> ${specifier}`);
      }
    }
  }

  return violations;
}

describe("production/test module boundary", () => {
  it("rejects imports from src/ into tests/support/", async () => {
    await expect(findProductionImportsToTestSupport(sourceRoot)).resolves.toEqual([]);
  });
});
