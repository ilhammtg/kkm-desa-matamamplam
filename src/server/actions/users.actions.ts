"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Ensure current user is SUPERADMIN
async function checkSuperAdmin() {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized. Superadmin access required.");
  }
  return session;
}

// Get users listing
export async function getUsers() {
  await checkSuperAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return users;
}

// Create new user
export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role: Role;
}) {
  await checkSuperAdmin();

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(data.password || "User123!", 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      isActive: true,
    },
  });

  revalidatePath("/dashboard/users");
}

// Update user details
export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: Role; isActive?: boolean }
) {
  const session = await checkSuperAdmin();

  // Prevent editing self role/status to avoid lockout (basic protection)
  if (id === session.user.id && (data.role || data.isActive !== undefined)) {
     // Allow name/email update, but prevent demoting self or deactivating self
     if (data.role && data.role !== "SUPERADMIN") throw new Error("Cannot demote yourself.");
     if (data.isActive === false) throw new Error("Cannot deactivate yourself.");
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/users");
}

// Reset Password
export async function resetPassword(id: string, newPassword?: string) {
  await checkSuperAdmin();
  
  const passwordToSet = newPassword || "User123!";
  const passwordHash = await bcrypt.hash(passwordToSet, 10);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  revalidatePath("/dashboard/users");
}

// Toggle Active Status
export async function toggleUserStatus(id: string, isActive: boolean) {
  const session = await checkSuperAdmin();
  if (id === session.user.id) throw new Error("Cannot changes your own status");

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/dashboard/users");
}
