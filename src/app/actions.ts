"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession,
  createSession,
  validateCredentials,
} from "@/lib/auth";
import { prisma, requireSettings, subscriptionPayloadFromFormData } from "@/lib/data";
import type { ThemeMode } from "@prisma/client";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateCredentials(username, password)) {
    redirect("/?error=invalid_login");
  }

  await createSession();
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createSubscriptionAction(formData: FormData) {
  const payload = subscriptionPayloadFromFormData(formData);

  await prisma.subscription.create({
    data: payload,
  });

  revalidatePath("/");
}

export async function updateSubscriptionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const payload = subscriptionPayloadFromFormData(formData);

  await prisma.subscription.update({
    where: { id },
    data: payload,
  });

  revalidatePath("/");
}

export async function deleteSubscriptionAction(formData: FormData) {
  const id = Number(formData.get("id"));

  await prisma.subscription.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function toggleSubscriptionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const isActive = String(formData.get("isActive")) === "true";

  await prisma.subscription.update({
    where: { id },
    data: {
      isActive: !isActive,
    },
  });

  revalidatePath("/");
}

export async function updateSettingsAction(formData: FormData) {
  const settings = await requireSettings();
  const usdToKrwRate = Number(formData.get("usdToKrwRate"));
  const themeMode = String(formData.get("themeMode")) as ThemeMode;

  await prisma.settings.update({
    where: { id: settings.id },
    data: {
      usdToKrwRate,
      themeMode,
    },
  });

  revalidatePath("/");
}
