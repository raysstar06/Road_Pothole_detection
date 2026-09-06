"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function registerUserAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const neighborhood = formData.get("neighborhood") as string

  if (!name || !email || !password) {
    return { success: false, error: "Please fill in all required fields." }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." }
  }

  const normalizedEmail = email.toLowerCase().trim()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  })

  if (existingUser) {
    return { success: false, error: "An account with this email already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "CITIZEN",
      neighborhood: neighborhood?.trim() || "Downtown",
      civicPoints: 0
    }
  })

  return { success: true }
}
