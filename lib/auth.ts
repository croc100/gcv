import { jwtVerify, SignJWT } from "jose";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "gcv-dev-secret-change-in-prod");

export interface AuthPayload {
  token: string;
  login: string;
  avatar: string;
}

export async function signAuth(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(await secret());
}

export async function verifyAuth(jwt: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(jwt, await secret());
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export const COOKIE_NAME = "gcv_auth";
