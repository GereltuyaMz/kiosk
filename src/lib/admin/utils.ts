import { getCurrentUser } from "@/lib/auth/actions";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const verifyAuthOrThrow = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Error("Insufficient permissions");
  }
  return { user, tenantId: user.tenant_id };
};

export const handleError = (error: unknown, defaultMessage: string): string => {
  console.error(defaultMessage, error);
  return error instanceof Error ? error.message : defaultMessage;
};
