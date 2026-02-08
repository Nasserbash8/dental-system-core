'use client'

import React from "react";
import dynamic from "next/dynamic";
import teethData from "../../../../public/multiOptions/teeth.json";
import { Plus, Trash2 } from "lucide-react";
import { useTeethLogic } from "@/hooks/useTeethLogic";

const MultiSelect = dynamic(() => import("@/components/form/MultiSelect"));

interface Tooth { id: string; value: string; }
interface CustomTreatment { id: string; value: string; customTreatment: string; }

interface TeethSelectorProps {
    onSelectionChange: (selectedTeeth: Tooth[], customTreatments: CustomTreatment[]) => void;
    initialSelected?: Tooth[];
    enableCustomTreatments?: boolean;
}

const TeethSelector: React.FC<TeethSelectorProps> = ({ 
    onSelectionChange, 
    initialSelected = [], 
    enableCustomTreatments = false 
}) => {
    const {
        selectedTeeth,
        customTreatments,
        handleTeethChange,
        addCustomTreatment,
        updateCustomTreatment,
        removeCustomTreatment
    } = useTeethLogic(initialSelected, onSelectionChange);

    return (
        <div className="space-y-4">
            <MultiSelect
                label="Select Teeth"
                options={teethData}
                defaultSelected={initialSelected.map(t => t.id)}
                onChange={handleTeethChange}
            />

            {enableCustomTreatments && selectedTeeth.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <button
                        type="button"
                        onClick={addCustomTreatment}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md text-sm hover:bg-brand-700 transition"
                    >
                        <Plus size={16} /> Add custom treatment per tooth
                    </button>

                    <div className="mt-4 space-y-4">
                        {customTreatments.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                <div className="md:col-span-4">
                                    <label className="block text-xs text-gray-500 mb-1">Tooth</label>
                                    <select
                                        value={item.id}
                                        onChange={(e) => updateCustomTreatment(index, "id", e.target.value)}
                                        className="w-full border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-brand-500"
                                    >
                                        {selectedTeeth.map((t) => (
                                            <option 
                                                key={t.id} 
                                                value={t.id}
                                                disabled={customTreatments.some((ct, i) => ct.id === t.id && i !== index)}
                                            >
                                                {t.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-7">
                                    <label className="block text-xs text-gray-500 mb-1">Custom Treatment</label>
                                    <input
                                        type="text"
                                        value={item.customTreatment}
                                        onChange={(e) => updateCustomTreatment(index, "customTreatment", e.target.value)}
                                        className="w-full border p-2 rounded text-sm outline-none focus:ring-1 focus:ring-brand-500"
                                        placeholder="e.g. Root canal, extraction..."
                                    />
                                </div>

                                <div className="md:col-span-1 flex justify-center">
                                    <button 
                                        type="button"
                                        onClick={() => removeCustomTreatment(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeethSelector;