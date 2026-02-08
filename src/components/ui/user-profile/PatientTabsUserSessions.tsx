'use client'

import { Handshake, CalendarDays, CircleDollarSign } from 'lucide-react'
import { Tooth, ToothClean } from '@/icons'
import { DentalMap } from '../teeth/DentalMap';

interface treatmentTooth {
    id: string;
    value: string;
    customTreatment?: string; 
}

interface Session {
    sessionId: string;
    sessionDate: Date;
    Payments: string;
    paymentCurrency?: string;
    PaymentsDate: Date;
}

interface Treatment {
    treatmentId: string;
    treatment: string;
    treatmentNames: { name: string }[];
    cost: number;
    currency?: string;
    teeth: treatmentTooth[];
    sessions: Session[];
}

interface PatientType {
    treatments: Treatment[];
}

type Props = {
    patient: PatientType;
};

function UserSessions({ patient }: Props) {

    return (
        <div className="sm-p-5 space-y-2">
            <h4 className="text-gray-900 text-2xl font-bold mb-10">
                Sessions & Treatments
            </h4>

            {patient.treatments.map((treatment, tIndex) => (
                <div key={tIndex} className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">

                    {/* Treatment Header Info */}
                    <div className="sm:flex items-center justify-between w-full gap-6 mb-10">
                        <div className="flex items-center gap-3 text-gray-900 mb-5 text-sm md:text-md font-semibold">
                            <ToothClean fill='#d1922b' stroke='#d1922b' strokeWidth={10} className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition font-semibold" />
                            <span>Treatment:</span>
                            <span className="text-[#666666] font-normal"> 
                                {treatment.treatmentNames.map((tn) => tn.name).join(" - ")}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
                            <CircleDollarSign className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                            <span>Total Cost:</span>
                            <span className="text-[#666666] font-normal">
                                {treatment.cost} {treatment.currency || "SYP"}
                            </span>
                        </div>
                    </div>

                    {/* Treated Teeth Visual Map */}
                    <div className="w-full gap-6 xl:flex-row mb-10">
                        <div className="flex items-center gap-3 text-gray-900 mb-5 text-sm md:text-md font-semibold">
                            <Tooth fill='#d1922b' stroke='#d1922b' strokeWidth={10} className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition font-semibold" />
                            <span>Treated Teeth:</span>
                        </div>

                        <div className="py-4 text-center space-y-8">
                             <DentalMap treatedTeeth={treatment.teeth} />
                        </div>
                    </div>

                    <h4 className="text-gray-900 text-lg font-bold mb-10">Sessions Log:</h4>

                    {/* Sessions Detail Grid */}
                    {treatment.sessions.map((session, sIndex) => (
                        <div key={session.sessionId || sIndex} className='mb-16 last:mb-0'>
                            <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold mb-5">
                                <Handshake className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                                <span>Session:</span>
                                <span className="text-[#666666] font-normal">{sIndex + 1}</span>
                            </div>

                            <div className="grid xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 w-full max-w-3xl mx-auto">
                                <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
                                    <CalendarDays className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                                    <span>Session Date:</span>
                                    <span className="text-[#666666] font-normal">
                                        {new Date(session.sessionDate).toLocaleDateString("en-US")}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
                                    <CircleDollarSign className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                                    <span>Payment:</span>
                                    <span className="text-[#666666] font-normal">
                                        {session.Payments} {session.paymentCurrency || "SYP"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-900 text-sm md:text-md font-semibold">
                                    <CalendarDays className="sm:w-6 sm:h-6 w-5 h-5 text-brand-800 hover:text-brand-600 transition" />
                                    <span>Payment Date:</span>
                                    <span className="text-[#666666] font-normal">
                                        {new Date(session.PaymentsDate).toLocaleDateString("en-US")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default UserSessions;