import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

const appointmentsBySpecialtyQuery = Prisma.sql`
  SELECT
    s.id::text AS "specialtyId",
    s.name AS "specialty",
    COUNT(a.id)::int AS "totalAppointments"
  FROM "specialties" s
  LEFT JOIN "doctors" d ON d."specialtyId" = s.id
  LEFT JOIN "appointments" a ON a."doctorId" = d.id
  GROUP BY s.id, s.name
  ORDER BY s.name ASC
`;

const getMexicoCityOffsetMinutes = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const match = formatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")
    ?.value?.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (!match) {
    return -6 * 60;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
};

const getMexicoCityDateRange = (dateString: string) => {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    throw new Error("La fecha del corte diario es inválida");
  }

  const [yearText, monthText, dayText] = parts;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if ([year, month, day].some((part) => Number.isNaN(part))) {
    throw new Error("La fecha del corte diario es inválida");
  }

  const localNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  const offsetMinutes = getMexicoCityOffsetMinutes(localNoon);
  const offsetMs = offsetMinutes * 60 * 1000;

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMs);
  const endExclusive = new Date(
    Date.UTC(year, month - 1, day + 1, 0, 0, 0) - offsetMs,
  );

  return { start, endExclusive };
};

const buildDailyCutoffQuery = (start: Date, endExclusive: Date) => Prisma.sql`
  SELECT
    COUNT(*) FILTER (WHERE a.status = 'COMPLETADA')::int AS "completed",
    COUNT(*) FILTER (WHERE a.status = 'CANCELADA')::int AS "cancelled"
  FROM "appointments" a
  WHERE a."startAt" >= ${start}::timestamptz
    AND a."startAt" < ${endExclusive}::timestamptz
`;

export type SpecialtyVolumeRow = {
  specialtyId: string;
  specialty: string;
  totalAppointments: number;
};

export type DailyCutoffRow = {
  completed: number;
  cancelled: number;
};

export const createReportsModel = () => ({
  getAppointmentsBySpecialty: async (): Promise<SpecialtyVolumeRow[]> => {
    const rows = await prisma.$queryRaw<Array<{
      specialtyId: string;
      specialty: string;
      totalAppointments: bigint;
    }>>(appointmentsBySpecialtyQuery);

    return rows.map((row) => ({
      specialtyId: row.specialtyId,
      specialty: row.specialty,
      totalAppointments: Number(row.totalAppointments ?? 0),
    }));
  },

  getDailyCutoff: async (
    date: string,
  ): Promise<{ date: string; completed: number; cancelled: number; total: number }> => {
    const { start, endExclusive } = getMexicoCityDateRange(date);
    const rows = await prisma.$queryRaw<Array<DailyCutoffRow>>(
      buildDailyCutoffQuery(start, endExclusive),
    );

    const result = rows[0] ?? { completed: 0, cancelled: 0 };
    const completed = Number(result.completed ?? 0);
    const cancelled = Number(result.cancelled ?? 0);

    return {
      date,
      completed,
      cancelled,
      total: completed + cancelled,
    };
  },
});
