import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

const COOKIE_NAME = "vault_session";
const USER_EXPIRY = "7d";
const ADMIN_EXPIRY = "24h";

export interface UserPayload extends JWTPayload {
  role: "user" | "admin";
  passId?: string;
}

export async function signUserToken(passId: string): Promise<string> {
  return new SignJWT({ role: "user", passId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(USER_EXPIRY)
    .sign(JWT_SECRET);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as UserPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
