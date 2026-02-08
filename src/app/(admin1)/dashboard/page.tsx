import { EcommerceMetrics } from "@/components/ui/ecommerce/EcommerceMetrics";
import nextDynamic from "next/dynamic";
import dbConnect from '@/utils/dbConnect';
import Patient from "@/models/patients"; 

export const dynamic = 'force-dynamic';

const MonthlyTarget = nextDynamic(() => import('@/components/ui/ecommerce/MonthlyTarget'));
const MonthlySalesChart = nextDynamic(() => import('@/components/ui/ecommerce/MonthlySalesChart'));
const StatisticsChart = nextDynamic(() => import('@/components/ui/ecommerce/StatisticsChart'));
const RecentOrders = nextDynamic(() => import('@/components/ui/ecommerce/RecentOrders'));

export default async function Ecommerce() {
  let patients = [];
  let totalPatients = 0;

  try {

    await dbConnect();
    
   
    const patientsData = await Patient.find({}).sort({ createdAt: -1 }).lean();
    
    
    patients = JSON.parse(JSON.stringify(patientsData));
    totalPatients = patients.length;

  } catch (err) {
    console.error('Database Error:', err);
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
     
        <EcommerceMetrics patients={patients} totalPatients={totalPatients}/>
        <MonthlySalesChart />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>
      <div className="col-span-12">
        <StatisticsChart />
      </div>
      <div className="col-span-12">
        <RecentOrders patients={patients} />
      </div>
    </div>
  );
}