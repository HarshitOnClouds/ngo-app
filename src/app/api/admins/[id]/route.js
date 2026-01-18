import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    await requireOwner();

    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    // Delete the admin
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Admin deleted successfully", adminId: id },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("DELETE /api/admins/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
