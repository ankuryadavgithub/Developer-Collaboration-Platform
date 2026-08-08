import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const logActivity = async (
  workspaceId,
  userId,
  type,
  entityType,
  entityId,
  message,
) => {
  try {
    await prisma.activity.create({
      data: {
        workspaceId,
        userId,
        type,
        entityType,
        entityId,
        message,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We swallow the error so that a failed activity log doesn't crash the main API request!
  }
};
