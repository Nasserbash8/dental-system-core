import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidateTag } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import jwt from "jsonwebtoken";
import { parse } from 'cookie';
import { getServerSession } from "next-auth";

import dbConnect from '@/utils/dbConnect';
import Patient from '@/models/patients';
import cloudinary from '@/utils/cloudinary';
import { authOptions } from '@/utils/authOptions';

// Interfaces for structured data
interface Treatment {
  treatmentId: string;
  treatmentNames: { name: string }[];
  cost: number;
  currency: string;
  teeth: { id: string; value: string; customTreatment?: string }[];
  sessions: {
    sessionId: string;
    sessionDate: Date;
    payments: number;
    paymentCurrency: string;
    paymentsDate: Date;
  }[];
}

/**
 * Auth Guard to protect routes from unauthorized access
 */
async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Generates a unique Alphanumeric Access Code for patients
 */
function generatePatientCode(): string {
  const letters = [...Array(2)]
    .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    .join('');
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${letters}-${numbers}`;
}

async function checkIfCodeExists(code: string): Promise<boolean> {
  const existing = await Patient.findOne({ code });
  return !!existing;
}

/* ==========================================================
   POST – Create New Patient Record
   Includes: Image upload to Cloudinary & JWT Admin Verification
========================================================== */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Admin Verification via JWT Token in Cookies
    const cookies = parse(req.headers.get('cookie') || '');
    const token = cookies['admin-token'];
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.ADMIN_SECRET as string);
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid Session' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name')?.toString() || '';
    const phone = formData.get('phone')?.toString() || '';
    const age = formData.get('age')?.toString() || '';

    // Validation
    if (!name || !phone || !age) {
      return NextResponse.json({ success: false, message: 'Required fields missing' }, { status: 400 });
    }

    // Process Image Uploads
    const images: { src: string; date: Date }[] = [];
    const imageFiles = formData.getAll('images') as File[];

    for (const imageFile of imageFiles) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const tempFilePath = path.join(tmpdir(), `${uuidv4()}-${imageFile.name}`);
      
      await fs.writeFile(tempFilePath, buffer);
      
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'patient_records',
      });

      images.push({ src: result.secure_url, date: new Date() });
      await fs.unlink(tempFilePath);
    }

    // Unique Access Code Generation
    let code = generatePatientCode();
    while (await checkIfCodeExists(code)) {
      code = generatePatientCode();
    }

    // Data Transformation
    const rawTreatments = JSON.parse(formData.get('treatments')?.toString() || '[]');
    const updatedTreatments = rawTreatments.map((t: any) => ({
      treatmentId: uuidv4(),
      treatmentNames: t.treatmentNames.map((n: any) => ({ name: (n.name ?? '').trim() })),
      cost: Number(t.cost) || 0,
      currency: t.currency || 'USD', 
      teeth: t.teeth || [],
      sessions: (t.sessions ?? []).map((s: any) => ({
        sessionId: uuidv4(),
        sessionDate: s.sessionDate ? new Date(s.sessionDate) : new Date(),
        payments: Number(s.payments) || 0,
        paymentCurrency: s.paymentCurrency || 'USD',
        paymentsDate: s.paymentsDate ? new Date(s.paymentsDate) : new Date(),
      })),
    }));

    const newPatient = new Patient({
      patientId: uuidv4(),
      name,
      phone,
      age,
      code,
      treatments: updatedTreatments,
      images,
      work: formData.get('work')?.toString(),
      info: formData.get('info')?.toString(),
      nextSessionDate: formData.get('nextSessionDate') ? new Date(formData.get('nextSessionDate') as string) : undefined,
    });

    const saved = await newPatient.save();
    revalidateTag('patients');

    return NextResponse.json({ success: true, data: saved });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/* ==========================================================
   GET – Paginated Patient List
========================================================== */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [patients, totalPatients] = await Promise.all([
      Patient.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Patient.countDocuments()
    ]);

    return NextResponse.json({
      success: true,
      data: patients,
      total: totalPatients,
      page,
      totalPages: Math.ceil(totalPatients / limit),
    });
  } catch (error: any) {
    const status = error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}