import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidateTag } from 'next/cache';
import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import jwt from "jsonwebtoken";
import { parse } from 'cookie';

import dbConnect from '@/utils/dbConnect';
import Patient from '@/models/patients';
import cloudinary from '@/utils/cloudinary';

// --- Interfaces ---
interface Session {
  sessionId: string;
  sessionDate: Date;
  payments: number;
  paymentCurrency: string;
  paymentsDate: Date;
}

interface PatientImage {
  _id: string;
  src: string;
  date: Date;
}

/**
 * Verifies if the requester has administrative privileges via JWT
 */
async function verifyAdmin(req: NextRequest) {
  const cookies = parse(req.headers.get('cookie') || '');
  const token = cookies['admin-token'];

  if (!token) throw new Error("UNAUTHORIZED");

  try {
    return jwt.verify(token, process.env.ADMIN_SECRET as string);
  } catch (err) {
    throw new Error("UNAUTHORIZED");
  }
}

/* ==========================================================
   PATCH: Update Patient Records
   Handles: Basic Info, Nested Treatments, Sessions, and Images
========================================================== */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    await verifyAdmin(req);
    await dbConnect();

    const { patientId } = await params;
    const contentType = req.headers.get("content-type") || "";
    
    let bodyData: any = {};
    let formData: FormData | null = null;

    // Handle Multipart (with images) or standard JSON
    if (contentType.includes("multipart/form-data")) {
      formData = await req.formData();
      formData.forEach((value, key) => {
        try {
          // Attempt to parse JSON strings (for arrays/objects sent via FormData)
          bodyData[key] = JSON.parse(value.toString());
        } catch {
          bodyData[key] = value.toString();
        }
      });
    } else {
      bodyData = await req.json();
    }

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }

    // 1. Update Basic Demographics
    const basicFields = ['name', 'phone', 'age', 'work', 'illnesses', 'medicines'];
    basicFields.forEach(field => {
      if (bodyData[field] !== undefined) patient[field] = bodyData[field];
    });

    // 2. Add New Treatment
    if (bodyData.newTreatmentData) {
      patient.treatments.push({
        treatmentId: uuidv4(),
        ...bodyData.newTreatmentData,
        currency: bodyData.newTreatmentData.currency || "USD",
        sessions: []
      });
    }

    // 3. Manage Sessions within a specific Treatment
    if (bodyData.treatmentId && (bodyData.newSessionData || bodyData.updateSessionData)) {
      const treatment = patient.treatments.find((t: any) => t.treatmentId === bodyData.treatmentId);
      if (treatment) {
        if (bodyData.newSessionData) {
          treatment.sessions.push({
            ...bodyData.newSessionData,
            sessionId: uuidv4(),
            sessionDate: new Date(bodyData.newSessionData.sessionDate || Date.now()),
          });
        } else if (bodyData.updateSessionData) {
          const session = treatment.sessions.find((s: any) => s.sessionId === bodyData.updateSessionData.sessionId);
          if (session) Object.assign(session, bodyData.updateSessionData);
        }
      }
    }

    // 4. Handle Image Uploads
    if (formData && formData.getAll("newImages").length > 0) {
      const imageFiles = formData.getAll("newImages") as File[];
      for (const file of imageFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempPath = path.join(tmpdir(), `${uuidv4()}-${file.name}`);
        await fs.writeFile(tempPath, buffer);

        const result = await cloudinary.uploader.upload(tempPath, { folder: "patients" });
        patient.images.push({ src: result.secure_url, date: new Date() });
        await fs.unlink(tempPath);
      }
    }

    // 5. Image Deletion Logic
    if (Array.isArray(bodyData.deleteImageIds)) {
      for (const id of bodyData.deleteImageIds) {
        const img = patient.images.find((i: any) => i._id.toString() === id);
        if (img) {
          const publicId = img.src.split("/").pop()?.split(".")[0];
          await cloudinary.uploader.destroy(`patients/${publicId}`).catch(() => null);
        }
      }
      patient.images = patient.images.filter((img: any) => !bodyData.deleteImageIds.includes(img._id.toString()));
    }

    if (bodyData.nextSessionDate) patient.nextSessionDate = new Date(bodyData.nextSessionDate);

    await patient.save();
    revalidateTag("patient");

    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/* ==========================================================
   DELETE & GET Operations
========================================================== */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    await verifyAdmin(req);
    await dbConnect();
    const { patientId } = await params;

    const deleted = await Patient.findOneAndDelete({ patientId });
    if (!deleted) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    await verifyAdmin(req);
    await dbConnect();
    const { patientId } = await params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}