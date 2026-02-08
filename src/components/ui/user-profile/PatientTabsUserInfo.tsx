'use client'

import { Phone, HeartPulse, IdCard, Calendar1, Pill } from 'lucide-react'

interface Illness {
  illness: string;
}

interface Medicine {
  medicine: string;
}

interface Treatment {
  treatmentId: string;
  treatment: string;
  treatmentNames: { name: string }[];
  cost: number;
}

interface PatientType {
  name: string;
  age: number;
  work: string;
  phone: string;
  illnesses: Illness[];
  Medicines: Medicine[];
  nextSessionDate: string;
  treatments: Treatment[];
  code: string;
}

type Props = {
  patient: PatientType;
};

export default function UserInfoTabs({ patient }: Props) {
  return (
    <div className="sm-p-5 space-y-2">
      <div className="p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div>
          <div className="flex flex-col items-center w-full gap-6 mb-20">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                className="mx-auto w-[90px] h-[75px] object-cover rounded-full"
                src="/images/user-avatar.png"
                alt="User Avatar"
              />
            </div>

            <div className="order-3 xl:order-2 text-center w-full">
              <h4 className="text-gray-900 md:text-2xl text-xl font-bold mb-4">
                {patient.name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center justify-center xl:flex-row xl:gap-3">
                <p className="text-sm text-[#666666] dark:text-gray-400">
                  {patient.work}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-[#666666] dark:text-gray-400">
                  {patient.age} Years Old
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <div className="flex items-center gap-1 text-gray-900 text-md md:text-md font-bold">
                <IdCard className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                <span>Patient Code:</span>
              </div>
              <p className="text-[#666666] text-lg">{patient.code}</p>
            </div>
          </div>

          <div className="flex flex-col gap-10 w-full max-w-md">
            <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
              <Phone className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
              <span>Phone Number:</span>
              <span className="text-[#666666] font-normal">{patient.phone}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
              <Pill className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
              <span>Medicines:</span>
              {patient.Medicines.length === 0 ? (
                <p className="text-[#666666] font-normal">None</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {patient.Medicines.map((med, index) => (
                    <p key={index} className="text-[#666666] font-normal">
                      {med.medicine}{index < patient.Medicines.length - 1 ? ',' : ''}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
              <HeartPulse className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
              <span>Illnesses:</span>
              {patient.illnesses.length === 0 ? (
                <p className="text-[#666666] font-normal">None</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {patient.illnesses.map((illness, index) => (
                    <p key={index} className="text-[#666666] font-normal">
                      {illness.illness}{index < patient.illnesses.length - 1 ? ',' : ''}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
              <Calendar1 className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
              <span>Next Session:</span>
              <span className="text-[#666666] font-normal">
                {patient.nextSessionDate
                  ? new Date(patient.nextSessionDate).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not scheduled"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}