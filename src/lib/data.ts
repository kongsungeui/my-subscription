import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import type {
  BillingCycle,
  Currency,
  Prisma,
  Settings,
} from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prisma =
  globalThis.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export async function requireSettings() {
  const existing = await prisma.settings.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    return existing;
  }

  return prisma.settings.create({
    data: {
      id: 1,
      usdToKrwRate: 1350,
      themeMode: "LIGHT",
    },
  });
}

export async function getSettings() {
  return requireSettings();
}

export async function getDashboardData() {
  return prisma.subscription.findMany({
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getSummary() {
  const [settings, subscriptions] = await Promise.all([
    requireSettings(),
    getDashboardData(),
  ]);

  let monthlyTotalKrw = 0;
  let yearlyTotalKrw = 0;
  let activeCount = 0;

  for (const subscription of subscriptions) {
    if (!subscription.isActive) {
      continue;
    }

    activeCount += 1;

    const annualKrw =
      subscription.billingCycle === "YEARLY"
        ? convertToKrw(subscription.amountMinor, subscription.currency, settings)
        : convertToKrw(subscription.amountMinor, subscription.currency, settings) *
          12;

    yearlyTotalKrw += annualKrw;
    monthlyTotalKrw += annualKrw / 12;
  }

  return {
    activeCount,
    monthlyTotalKrw,
    yearlyTotalKrw,
  };
}

function convertToKrw(amountMinor: number, currency: Currency, settings: Settings) {
  if (currency === "KRW") {
    return amountMinor;
  }

  return Math.round((amountMinor * settings.usdToKrwRate) / 100);
}

export function parseAmountToMinor(rawAmount: string, currency: Currency) {
  const amount = Number(rawAmount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a positive number.");
  }

  if (currency === "KRW") {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

export function formatDisplayAmount(
  amountMinor: number,
  currency: Currency,
  includeSymbol = true,
) {
  if (currency === "USD") {
    const formatter = new Intl.NumberFormat("en-US", {
      style: includeSymbol ? "currency" : "decimal",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amountMinor / 100);
  }

  const formatter = new Intl.NumberFormat("ko-KR", {
    style: includeSymbol ? "currency" : "decimal",
    currency: "KRW",
    maximumFractionDigits: 0,
  });

  return formatter.format(amountMinor);
}

export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function subscriptionPayloadFromFormData(
  formData: FormData,
): Prisma.SubscriptionUncheckedCreateInput {
  const currency = String(formData.get("currency")) as Currency;
  const billingCycle = String(formData.get("billingCycle")) as BillingCycle;
  const memo = String(formData.get("memo") ?? "").trim();

  return {
    name: String(formData.get("name") ?? "").trim(),
    amountMinor: parseAmountToMinor(String(formData.get("amount") ?? ""), currency),
    currency,
    billingCycle,
    memo: memo || null,
    isActive: formData.get("isActive") === "on",
  };
}
