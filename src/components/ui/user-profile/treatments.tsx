"use client";

import React, { useState } from "react";
import teethDataJson from "../../../../public/multiOptions/teeth.json";
import { useRouter } from "next/navigation";
import { Edit, Plus, Trash2 } from "lucide-react";
import EditTreatmentModal from "../modal/EditTreatmentModal";
import AddSessionModal from "../modal/AddSessionModal";
import UpdateSessionModal from "../modal/UpdateSessionModal";
import AddTreatmentModal from "../modal/AddNewtreatment";

interface Session {
  sessionId: string;
  sessionDate: Date;
  Payments: string;
  paymentCurrency?: string;
  PaymentsDate: Date;
}

interface Tooth {
  id: string;
  value: string;
  customTreatment?: string;
}

interface Treatment {
  treatmentId: string;
  treatment: string;
  treatmentNames: { name: string }[];
  cost: number;
  currency?: string;
  teeth: Tooth[];
  sessions: Session[];
}

interface PatientType {
  patientId: string;
  name: string;
  age: number;
  phone: string;
  work: string;
  info: string;
  treatments: Treatment[];
}

type Props = {
  patient: PatientType;
};

export default function Treatments({ patient }: Props) {
  const router = useRouter();
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedTreatmentIndex, setSelectedTreatmentIndex] = useState<number | null>(null);
  const [isUpdateSessionModalOpen, setIsUpdateSessionModalOpen] = useState(false);
  const [updateTreatmentIndex, setUpdateTreatmentIndex] = useState<number | null>(null);
  const [isEditTreatmentModalOpen, setIsEditTreatmentModalOpen] = useState(false);
  const [editTreatmentIndex, setEditTreatmentIndex] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [formEditTreatment, setFormEditTreatment] = useState<Treatment>({
    treatmentId: "",
    treatment: "",
    treatmentNames: [],
    cost: 0,
    teeth: [],
    sessions: [],
  });

  const openUpdateSessionModal = (tIndex: number, session: Session) => {
    setUpdateTreatmentIndex(tIndex);
    setSelectedTreatmentIndex(tIndex);
    setCurrentSession(session);
    setIsUpdateSessionModalOpen(true);
  };

  const openEditTreatmentModal = (index: number) => {
    const treatment = patient.treatments[index];

    setFormEditTreatment({
      treatmentId: treatment.treatmentId,
      treatment: treatment.treatment,
      treatmentNames: treatment.treatmentNames,
      cost: treatment.cost,
      teeth: treatment.teeth.map((t) => ({
        id: t.id,
        value: t.value,
        customTreatment: t.customTreatment || "",
      })),
      sessions: treatment.sessions,
    });

    setTimeout(() => {
      setIsEditTreatmentModalOpen(true);
      setEditTreatmentIndex(index);
    }, 50);
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return;
    try {
      const res = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.patientId, deleteTreatmentId: treatmentId }),
      });

      if (res.ok) {
        setSelectedTreatmentIndex(null);
        setEditTreatmentIndex(null);
        setUpdateTreatmentIndex(null);
        setIsUpdateSessionModalOpen(false);
        setIsEditTreatmentModalOpen(false);
        setCurrentSession(null);
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting treatment", err);
    }
  };

  const handleDeleteSession = async (treatmentId: string, sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const res = await fetch(`/api/patients/${patient.patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.patientId,
          deleteSession: { treatmentId, sessionId },
        }),
      });

      if (res.ok) {
        setCurrentSession(null);
        setUpdateTreatmentIndex(null);
        setIsUpdateSessionModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Error deleting session", err);
    }
  };

  return (
    <>
      <div className="p-5 border rounded-2xl dark:border-gray-800">
        <div className="flex flex-col md:flex-row lg:justify-between lg:gap-6 gap-4 justify-between p-5">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Treatments & Sessions
          </h4>
          <button
            onClick={() => setIsTreatmentModalOpen(true)}
            className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-brand-600 rounded hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add New Treatment
          </button>
        </div>

        {patient.treatments.map((treatment, tIndex) => (
          <div key={treatment.treatmentId} className="mb-6 p-4 border rounded-xl dark:border-gray-700">
            <div className="font-semibold text-gray-700 dark:text-white/90">{treatment.treatment}</div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Cost:</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {treatment.cost} {treatment.currency || "SYP"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Teeth:</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {(() => {
                    const treatmentTeeth = treatment.teeth;
                    const treatmentToothIds = treatmentTeeth.map((t) => t.id);

                    const QUADRANTS_MAP = {
                      RUA: { label: "Full Upper Right", ids: ["RU1", "RU2", "RU3", "RU4", "RU5", "RU6", "RU7", "RU8"] },
                      LUA: { label: "Full Upper Left", ids: ["LU1", "LU2", "LU3", "LU4", "LU5", "LU6", "LU7", "LU8"] },
                      RDA: { label: "Full Lower Right", ids: ["RD1", "RD2", "RD3", "RD4", "RD5", "RD6", "RD7", "RD8"] },
                      LDA: { label: "Full Lower Left", ids: ["LD1", "LD2", "LD3", "LD4", "LD5", "LD6", "LD7", "LD8"] },
                    };

                    const SMILE_GROUPS_MAP = {
                      U10: { label: "Upper Smile (10)", ids: ["LU1", "LU2", "LU3", "LU4", "LU5", "RU1", "RU2", "RU3", "RU4", "RU5"] },
                      D10: { label: "Lower Smile (10)", ids: ["LD1", "LD2", "LD3", "LD4", "LD5", "RD1", "RD2", "RD3", "RD4", "RD5"] },
                      U8: { label: "Upper Smile (8)", ids: ["LU1", "LU2", "LU3", "LU4", "RU1", "RU2", "RU3", "RU4"] },
                      D8: { label: "Lower Smile (8)", ids: ["LD1", "LD2", "LD3", "LD4", "RD1", "RD2", "RD3", "RD4"] },
                      U6: { label: "Upper Smile (6)", ids: ["LU1", "LU2", "LU3", "RU1", "RU2", "RU3"] },
                      D6: { label: "Lower Smile (6)", ids: ["LD1", "LD2", "LD3", "RD1", "RD2", "RD3"] },
                    };

                    const displayElements: React.ReactNode[] = [];
                    const coveredToothIds = new Set<string>();

                    Object.entries(QUADRANTS_MAP).forEach(([key, quad]) => {
                      if (quad.ids.every((id) => treatmentToothIds.includes(id))) {
                        displayElements.push(<span key={key} className="font-bold text-brand-700">{quad.label}</span>);
                        quad.ids.forEach((id) => coveredToothIds.add(id));
                      }
                    });

                    Object.entries(SMILE_GROUPS_MAP).forEach(([key, group]) => {
                      const isMatch = group.ids.every((id) => treatmentToothIds.includes(id));
                      const isAlreadyCovered = group.ids.every((id) => coveredToothIds.has(id));
                      if (isMatch && !isAlreadyCovered) {
                        displayElements.push(<span key={key} className="font-bold text-brand-700">{group.label}</span>);
                        group.ids.forEach((id) => coveredToothIds.add(id));
                      }
                    });

                    treatmentTeeth.forEach((tooth) => {
                      const hasCustom = tooth.customTreatment && tooth.customTreatment.trim() !== "";
                      if (!coveredToothIds.has(tooth.id) || hasCustom) {
                        displayElements.push(
                          <span key={tooth.id}>
                            {coveredToothIds.has(tooth.id) ? `Edit on ${tooth.value}` : tooth.value}
                            {hasCustom && <span className="text-brand-900 font-bold"> ({tooth.customTreatment})</span>}
                          </span>
                        );
                      }
                    });

                    return displayElements.map((item, index) => (
                      <React.Fragment key={index}>
                        {item}{index < displayElements.length - 1 && " , "}
                      </React.Fragment>
                    ));
                  })()}
                </p>
              </div>

              <div>
                <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Treatment Names:</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {treatment.treatmentNames.map((tn) => tn.name).join(" - ")}
                </p>
              </div>
            </div>

            <div className="md:flex gap-2">
              <button
                onClick={() => openEditTreatmentModal(tIndex)}
                className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-brand-600 rounded hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                Edit Treatment
              </button>
              <button
                onClick={() => handleDeleteTreatment(treatment.treatmentId)}
                className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-red-600 rounded hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Treatment
              </button>
            </div>

            {treatment.sessions.map((session, sIndex) => (
              <div key={sIndex} className="pl-4 border-l border-brand-700 my-16">
                <div className="md:flex justify-between items-center">
                  <div className="font-semibold text-lg text-brand-700 dark:text-white/90">
                    {sIndex + 1} - <strong>Session</strong>
                  </div>
                  <div className="md:flex gap-2">
                    <button
                      onClick={() => openUpdateSessionModal(tIndex, session)}
                      className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-brand-600 rounded hover:bg-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Session
                    </button>
                    <button
                      onClick={() => handleDeleteSession(treatment.treatmentId, session.sessionId)}
                      className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-red-600 rounded hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Session
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Session Date:</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {new Date(session.sessionDate).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Payment:</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {session.Payments} {session.paymentCurrency || "SYP"}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-lg text-black-500 font-bold dark:text-gray-400 mt-5">Payment Date:</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {new Date(session.PaymentsDate).toLocaleDateString("en-US")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setSelectedTreatmentIndex(tIndex);
                setIsSessionModalOpen(true);
              }}
              className="flex text-sm items-center gap-2 px-4 py-2 mt-5 text-white bg-brand-600 rounded hover:bg-gray-700"
            >
              <Plus className="w-4 h-4" />
              Add Session
            </button>
          </div>
        ))}
      </div>

      {/* Modals Section */}
      {isTreatmentModalOpen && (
        <AddTreatmentModal
          isOpen={isTreatmentModalOpen}
          onClose={() => setIsTreatmentModalOpen(false)}
          patientId={patient.patientId}
        />
      )}

      {selectedTreatmentIndex !== null && (
        <AddSessionModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          patientId={patient.patientId}
          treatmentId={patient.treatments[selectedTreatmentIndex].treatmentId}
        />
      )}

      {selectedTreatmentIndex !== null && patient.treatments[selectedTreatmentIndex] && (
        <UpdateSessionModal
          isOpen={isUpdateSessionModalOpen}
          onClose={() => setIsUpdateSessionModalOpen(false)}
          patientId={patient.patientId}
          treatmentId={patient.treatments[selectedTreatmentIndex].treatmentId}
          session={currentSession}
        />
      )}

      <EditTreatmentModal
        isOpen={isEditTreatmentModalOpen}
        onClose={() => setIsEditTreatmentModalOpen(false)}
        patientId={patient.patientId}
        treatment={formEditTreatment}
        onSave={() => {
          setIsEditTreatmentModalOpen(false);
          router.refresh();
        }}
        teethData={teethDataJson}
      />
    </>
  );
}