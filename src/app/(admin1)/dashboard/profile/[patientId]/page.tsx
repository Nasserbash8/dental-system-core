import dynamic from "next/dynamic";
import dbConnect from '@/utils/dbConnect';
import Patient from "@/models/patients"; 

const PageBreadcrumb = dynamic(()=> import('@/components/ui/common/PageBreadCrumb'))
const DownloadExcelButton = dynamic(()=> import('@/components/ui/tables/excelButton/page'))
const Treatments = dynamic(()=> import('@/components/ui/user-profile/treatments'))
const UserInfoCard = dynamic(()=> import('@/components/ui/user-profile/UserInfoCard'))
const UserMetaCard = dynamic(()=> import('@/components/ui/user-profile/UserMetaCard'))
const UserImages = dynamic(()=> import('@/components/ui/user-profile/UserImages'))

interface Params {
  patientId: string;
}

export default async function Profile({ params }: { params: Promise<Params> }) {
  const { patientId } = await params;


  await dbConnect();
  

  const patientData = await Patient.findOne({ patientId: patientId }).lean();

  if (!patientData) {
    return <div>لم يتم العثور على المريض</div>;
  }

  const patient = JSON.parse(JSON.stringify(patientData));

  return (
    <div>
      <PageBreadcrumb pageTitle="البروفايل" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mt-6 flex justify-end">
          <DownloadExcelButton patient={patient} />
        </div>
        <div className="space-y-6">
          <UserMetaCard patient={patient} />
          <UserInfoCard patient={patient} />
          <UserImages patient={patient}/>
          <Treatments patient={patient} />
        </div>
      </div>
    </div>
  );
}