import { z } from "zod";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dailyCutoffQuerySchema = z
  .object({
    date: z
      .string({ message: "La fecha es obligatoria" })
      .regex(isoDateRegex, {
        message: "La fecha debe tener el formato YYYY-MM-DD",
      })
      .refine((value) => {
        const parts = value.split("-");

        if (parts.length !== 3) {
          return false;
        }

        const [yearText, monthText, dayText] = parts;
        const year = Number(yearText);
        const month = Number(monthText);
        const day = Number(dayText);

        if ([year, month, day].some((part) => Number.isNaN(part))) {
          return false;
        }

        const parsed = new Date(Date.UTC(year, month - 1, day));

        return (
          parsed.getUTCFullYear() === year &&
          parsed.getUTCMonth() === month - 1 &&
          parsed.getUTCDate() === day
        );
      }, {
        message: "La fecha no es válida",
      }),
  })
  .strict();

export type DailyCutoffQueryInput = z.output<typeof dailyCutoffQuerySchema>;
