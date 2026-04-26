import { cookies } from "next/headers";

const SESSION_COOKIE = "my-subscription-session";
const SESSION_VALUE = "authenticated";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Kk16040&";

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
