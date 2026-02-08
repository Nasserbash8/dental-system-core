import dbConnect from '@/utils/dbConnect';
import Patient from "@/models/patients";
import nextDynamic from "next/dynamic";

const PageBreadcrumb = nextDynamic(() => import('@/components/ui/common/PageBreadCrumb'));
const BasicTableOne = nextDynamic(() => import('@/components/ui/tables/BasicTableOne'));

export const dynamic = 'force-dynamic';

export default async function Patients() {
  try {
    await dbConnect();


    const allPatients = await Patient.find({}).sort({ createdAt: -1 }).lean();
    const serializedPatients = JSON.parse(JSON.stringify(allPatients));

    return (
      <div>
        <PageBreadcrumb pageTitle="المرضى" />
        <div className="space-y-6">
          <BasicTableOne tabledata={serializedPatients} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Database Error:", error);
    return <div>خطأ في الاتصال بالقاعدة</div>;
  }
}