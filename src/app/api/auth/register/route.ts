import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    // Parse and validate body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      // Generic message to prevent email enumeration
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Registration error:", error)
    }
    return NextResponse.json(
      { error: "Registration failed. Please try again later." },
      { status: 500 }
    )
  }
}
