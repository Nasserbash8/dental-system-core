import dynamic from 'next/dynamic';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from '@/utils/authOptions';
import dbConnect from '@/utils/dbConnect';
import Patient from "@/models/patients"; 
import Container from '@/components/layout/viewsLayout/Container';

const PatientTabs = dynamic(() => import("@/components/ui/user-profile/PatientTabs"));

interface PageParams {
  params: Promise<{ patientId: string }>;
}

export default async function MyAccount({ params }: PageParams) {
  const session = await getServerSession(authOptions);
  const { patientId } = await params;

  // Authentication Guard
  if (!session) {
    redirect("/login");
  }

  // Authorization Guard: Ensure users can only access their own data
  if (session.user.id !== patientId) {
    redirect(`/profile/${session.user.id}`);
  }

  let patient = null;

  try {
    await dbConnect();
    const patientData = await Patient.findOne({ patientId }).lean();

    if (!patientData) {
      redirect('/signOut');
    }

    // Serialize data for Client Components
    patient = JSON.parse(JSON.stringify(patientData));
    
  } catch (error) {
    console.error('Data fetching error:', error);
    redirect('/signOut');
  }

  return (
    <Container>
      <PatientTabs patient={patient} />
    </Container>
  );
}