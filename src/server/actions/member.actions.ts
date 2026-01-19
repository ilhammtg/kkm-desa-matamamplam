"use server";

import { prisma } from "@/server/db/prisma";

import { getServerAuthSession } from "@/server/auth/session";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function checkPermission() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  const role = session.user.role;
  if (role !== Role.SUPERADMIN && role !== Role.PDD) {
    throw new Error("Forbidden: Only PDD and SuperAdmin can manage members.");
  }
  return session;
}

export async function getMembers() {
   // Flat list for table management
   return prisma.member.findMany({
    include: {
      position: {
        include: {
            division: true
        }
      }
    },
    orderBy: {
        createdAt: "desc"
    }
  });
}

export async function createMember(data: {
  name: string;
  npm: string;
  major: string;
  positionId: string;
  photoUrl?: string;
}) {
  await checkPermission();
  
  const member = await prisma.member.create({
    data: {
      name: data.name,
      npm: data.npm,
      major: data.major,
      positionId: data.positionId,
      photoUrl: data.photoUrl,
    },
  });

  revalidatePath("/dashboard/members");
  revalidatePath("/"); // Update landing page
  return member;
}

export async function updateMember(id: string, data: {
  name?: string;
  npm?: string;
  major?: string;
  positionId?: string;
  photoUrl?: string;
}) {
  await checkPermission();

  const { divisionId, ...updateData } = data as any; 
  console.log("Update Member Payload:", updateData); // DEBUG LOG

  const member = await prisma.member.update({
    where: { id },
    data: {
      name: updateData.name,
      npm: updateData.npm,
      major: updateData.major,
      positionId: updateData.positionId,
      photoUrl: updateData.photoUrl,
    },
  });

  revalidatePath("/dashboard/members");
  revalidatePath("/");
  return member;
}

export async function deleteMember(id: string) {
  await checkPermission();

  await prisma.member.delete({
    where: { id },
  });

  revalidatePath("/dashboard/members");
  revalidatePath("/");
}

// Fetch helper for form selects
export async function getPositionsAndDivisions() {
    // We need flattened positions grouped by division for Select
    const divisions = await prisma.division.findMany({
        include: {
            positions: {
                orderBy: { level: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });
    return divisions;
}

export async function getOrgStructure() {
  return prisma.division.findMany({
    include: {
      positions: {
        orderBy: { level: "asc" },
        include: {
          members: true,
        },
      },
    },
    orderBy: {
        createdAt: "asc"
    }
  });
}
