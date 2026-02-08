"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Modal from ".";
import { useRouter } from "next/navigation";
import TeethSelector from "../teeth/teethSelector";
import Select from "@/components/form/Select";

interface Tooth {
  id: string;
  value: string;
}

interface CustomTooth extends Tooth {
  customTreatment?: string;
}

interface TreatmentName {
  name: string;
}

interface TreatmentData {
  treatmentId: string;
  treatment: string;
  treatmentNames: TreatmentName[];
  cost: number;
  currency: string;
  teeth: CustomTooth[];
  sessions: any[];
}

interface AddTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export default function AddTreatmentModal({
  isOpen,
  onClose,
  patientId,
}: AddTreatmentModalProps) {
  const router = useRouter();
  const [formTreatment, setFormTreatment] = useState<TreatmentData>({
    treatmentId: "",
    treatment: "",
    treatmentNames: [],
    cost: 0,
    currency: "SYP",
    teeth: [],
    sessions: [],
  });

  const [treatmentErrors, setTreatmentErrors] = useState<{ [key: string]: string }>({});
  const [isSavingTreatment, setIsSavingTreatment] = useState(false);

  const currencyOptions = [
    { value: "SYP", label: "SYP (Syrian Pound)" },
    { value: "USD", label: "USD (Dollar)" },
    { value: "EUR", label: "EUR (Euro)" },
  ];

  const handleTeethSelection = (
    selectedTeeth: Tooth[],
    customTreatments?: { id: string; value: string; customTreatment: string }[]
  ) => {
    const finalTeeth = selectedTeeth.map(tooth => {
      const custom = customTreatments?.find(ct => ct.id === tooth.id);
      return custom ? { ...tooth, customTreatment: custom.customTreatment } : tooth;
    });
    setFormTreatment(prev => ({ ...prev, teeth: finalTeeth }));
  };

  const handleTreatmentNamesChange = (value: string) => {
    const treatmentNamesArray = value.split("-").map(name => ({ name: name.trim() }));
    setFormTreatment(prev => ({ ...prev, treatmentNames: treatmentNamesArray }));
  };

  const handleSaveTreatment = async () => {
    if (isSavingTreatment) return;
    setIsSavingTreatment(true);

    const errors: { [key: string]: string } = {};
    if (!formTreatment.treatmentNames.length) errors.treatmentNames = "Treatment name is required";
    if (!formTreatment.cost) errors.cost = "Cost is required";
    if (!formTreatment.teeth.length) errors.teeth = "Please select teeth";

    if (Object.keys(errors).length > 0) {
      setTreatmentErrors(errors);
      setIsSavingTreatment(false);
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTreatmentData: formTreatment }),
      });

      if (res.ok) {
        onClose();
        router.push(`/dashboard/profile/${patientId}`);
      }
    } catch (err) {
      console.error("Error saving treatment:", err);
    } finally {
      setIsSavingTreatment(false);
    }
  };

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        <h4 className="text-xl font-semibold mb-4">Add New Treatment</h4>

        <div className="mb-4">
          <Label>Treatment Names</Label>
          <Input
            type="text"
            value={formTreatment.treatmentNames.map(tn => tn.name).join(" - ")}
            onChange={(e) => handleTreatmentNamesChange(e.target.value)}
            placeholder="e.g. Filling - Root Canal"
          />
          {treatmentErrors.treatmentNames && <p className="text-red-500 text-sm">{treatmentErrors.treatmentNames}</p>}
        </div>

        <div className="mb-4">
          <Label>Cost and Currency</Label>
          <div className="flex gap-2 items-center">
            <div className="flex-[3]">
              <Input
                type="number"
                value={formTreatment.cost}
                onChange={(e) => setFormTreatment({ ...formTreatment, cost: Number(e.target.value) })}
                placeholder="Amount"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Select
                options={currencyOptions}
                defaultValue={formTreatment.currency}
                onChange={(value) => setFormTreatment({ ...formTreatment, currency: value })}
              />
            </div>
          </div>
          {treatmentErrors.cost && <p className="text-red-500 text-sm mt-1">{treatmentErrors.cost}</p>}
        </div>
        
        <div className="mb-4">
          <TeethSelector
            initialSelected={[]}
            enableCustomTreatments
            onSelectionChange={handleTeethSelection}
          />
          {treatmentErrors.teeth && <p className="text-red-500 text-sm">{treatmentErrors.teeth}</p>}
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button
            onClick={handleSaveTreatment}
            disabled={isSavingTreatment}
            className={`w-full ${isSavingTreatment ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSavingTreatment ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}