export function requireTestDatabaseUrl(url: string | undefined): string {
  if (url === undefined || url.trim() === "") {
    throw new Error("TEST_DATABASE_URL is required for integration tests.");
  }

  let parsedUrl: URL;
  let databaseName: string;

  try {
    if (/%(?![0-9A-Fa-f]{2})/.test(url)) {
      throw new Error("Malformed percent escape.");
    }

    parsedUrl = new URL(url);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
    throw new Error("TEST_DATABASE_URL must use the PostgreSQL protocol.");
  }

  if (!parsedUrl.hostname) {
    throw new Error("TEST_DATABASE_URL must include a PostgreSQL host.");
  }

  try {
    databaseName = decodeURIComponent(parsedUrl.pathname.slice(1));
  } catch {
    throw new Error("TEST_DATABASE_URL must contain a valid encoded database name.");
  }

  if (!databaseName) {
    throw new Error("TEST_DATABASE_URL must include a database name.");
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error("TEST_DATABASE_URL must target a database whose name ends with _test.");
  }

  return url;
}

export function sanitizeTestDatabaseError(error: unknown, connectionUrl: string): Error {
  const parsedUrl = new URL(connectionUrl);
  let message = error instanceof Error ? error.message : String(error);

  message = message.replace(/(?:postgres(?:ql)?:\/\/)[^\s"'`]+/gi, "[PostgreSQL URL redacted]");
  message = redactValue(message, parsedUrl.username);
  message = redactValue(message, parsedUrl.password);

  let safeError: Error;
  if (error instanceof Error) {
    safeError = new Error(message);
    safeError.name = error.name;

    if ("code" in error && typeof error.code === "string") {
      Object.defineProperty(safeError, "code", {
        configurable: false,
        enumerable: true,
        value: error.code,
        writable: false,
      });
    }
  } else {
    safeError = new Error(message);
  }

  return safeError;
}

function redactValue(message: string, value: string): string {
  if (!value) {
    return message;
  }

  let decodedValue = value;
  try {
    decodedValue = decodeURIComponent(value);
  } catch {
    // Keep the encoded value if it is not valid percent-encoding.
  }

  for (const candidate of new Set([value, decodedValue])) {
    if (candidate) {
      message = message.replaceAll(candidate, "[REDACTED]");
    }
  }

  return message;
}
