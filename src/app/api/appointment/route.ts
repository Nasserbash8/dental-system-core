import Appointment from '@/models/appointments';
import dbConnect from '@/utils/dbConnect';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

/**
 * Middleware-style helper to verify Admin JWT token from cookies
 */
async function verifyAdmin(req: NextRequest) {
  const cookies = parse(req.headers.get('cookie') || '');
  const token = cookies['admin-token'];

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    return jwt.verify(token, process.env.ADMIN_SECRET as string);
  } catch (err) {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * GET: Fetch all appointments sorted by date
 * Access: Admin Only
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await dbConnect();
    
    const appointments = await Appointment.find().sort({ appointmentDate: 1 });
    return NextResponse.json({ success: true, data: appointments });
  } catch (error: any) {
    const isAuthError = error.message === "UNAUTHORIZED";
    return NextResponse.json(
      { success: false, message: isAuthError ? "Access Denied" : "Internal Server Error" }, 
      { status: isAuthError ? 401 : 500 }
    );
  }
}

/**
 * POST: Schedule a new appointment
 * Access: Admin Only
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdmin(req);
    await dbConnect();
    
    const body = await req.json();
    const { name, phone, appointmentDate, notes, status } = body;

    // Basic Validation
    if (!phone || !appointmentDate) {
      return NextResponse.json(
        { success: false, message: 'Phone number and date are required' }, 
        { status: 400 }
      );
    }

    const newAppointment = await Appointment.create({
      name,
      phone,
      appointmentDate: new Date(appointmentDate),
      notes,
      status: status || 'pending',
    });

    // Trigger Next.js Cache Revalidation
    revalidateTag('appointment');
    
    return NextResponse.json({ success: true, data: newAppointment }, { status: 201 });
  } catch (error: any) {
    const isAuthError = error.message === "UNAUTHORIZED";
    return NextResponse.json(
      { success: false, message: isAuthError ? "Access Denied" : "Failed to create appointment" }, 
      { status: isAuthError ? 401 : 500 }
    );
  }
}