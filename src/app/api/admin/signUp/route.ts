import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Admin from "@/models/admins";

/**
 * POST: Create a new administrative user.
 * This route is used for initial setup and admin management.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { email, password } = await req.json();

    // Basic validation to ensure required fields are provided
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." }, 
        { status: 400 }
      );
    }

    // Logic assumes the Admin model handles password hashing via pre-save hooks
    const newAdmin = new Admin({ email, password }); 
    await newAdmin.save();

    return NextResponse.json({ 
      success: true, 
      message: "Admin created successfully." 
    });

  } catch (error: any) {
    // Return a generic error message to the client
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}