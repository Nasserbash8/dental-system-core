import { useState, useCallback } from "react";
import teethData from "../../public/multiOptions/teeth.json";

interface Tooth {
  id: string;
  value: string;
}

interface CustomTreatment {
  id: string;
  value: string;
  customTreatment: string;
}

/**
 * Maps shorthand group IDs to specific tooth IDs.
 * LUA/RUA: Upper Quadrants | LDA/RDA: Lower Quadrants
 * U6/U8/U10: Upper Smile Groups | D6/D8/D10: Lower Smile Groups
 */
const toothGroups: Record<string, string[]> = {
  LUA: ["LU1", "LU2", "LU3", "LU4", "LU5", "LU6", "LU7", "LU8"],
  RUA: ["RU1", "RU2", "RU3", "RU4", "RU5", "RU6", "RU7", "RU8"],
  LDA: ["LD1", "LD2", "LD3", "LD4", "LD5", "LD6", "LD7", "LD8"],
  RDA: ["RD1", "RD2", "RD3", "RD4", "RD5", "RD6", "RD7", "RD8"],
  U6:  ["LU1", "LU2", "LU3", "RU1", "RU2", "RU3"],
  U8:  ["LU1", "LU2", "LU3", "LU4", "RU1", "RU2", "RU3", "RU4"],
  U10: ["LU1", "LU2", "LU3", "LU4", "LU5", "RU1", "RU2", "RU3", "RU4", "RU5"],
  D6:  ["LD1", "LD2", "LD3", "RD1", "RD2", "RD3"],
  D8:  ["LD1", "LD2", "LD3", "LD4", "RD1", "RD2", "RD3", "RD4"],
  D10: ["LD1", "LD2", "LD3", "LD4", "LD5", "RD1", "RD2", "RD3", "RD4", "RD5"],
};

export const useTeethLogic = (
  initialTeeth: Tooth[] = [],
  onSelectionChange: (selectedTeeth: Tooth[], customTreatments: CustomTreatment[]) => void
) => {
  const [selectedTeeth, setSelectedTeeth] = useState<Tooth[]>(initialTeeth);
  const [customTreatments, setCustomTreatments] = useState<CustomTreatment[]>([]);

  /**
   * Expands group selections (like "U10") into individual tooth IDs
   * and synchronizes the selection state.
   */
  const handleTeethChange = useCallback((values: Tooth[]) => {
    const expanded = values.flatMap(({ id }) => toothGroups[id] || [id]);
    const uniqueIds = Array.from(new Set(expanded));

    const finalTeeth = uniqueIds.map(id => {
      const match = teethData.find(t => t.id === id);
      return match ? { id: match.id, value: match.value } : { id, value: id };
    });

    setSelectedTeeth(finalTeeth);
    
    // Auto-remove custom treatments if the tooth is deselected
    const updatedCustom = customTreatments.filter(ct => uniqueIds.includes(ct.id));
    setCustomTreatments(updatedCustom);
    
    onSelectionChange(finalTeeth, updatedCustom);
  }, [customTreatments, onSelectionChange]);

  /**
   * Adds a new custom treatment entry for an available (selected but unassigned) tooth.
   */
  const addCustomTreatment = () => {
    const available = selectedTeeth.filter(t => !customTreatments.some(ct => ct.id === t.id));
    if (available.length > 0) {
      const newList = [...customTreatments, { ...available[0], customTreatment: "" }];
      setCustomTreatments(newList);
      onSelectionChange(selectedTeeth, newList);
    }
  };

  /**
   * Updates either the target tooth ID or the treatment text for a specific entry.
   */
  const updateCustomTreatment = (index: number, field: "id" | "customTreatment", value: string) => {
    const updated = [...customTreatments];
    if (field === "id") {
      const newTooth = selectedTeeth.find(t => t.id === value);
      if (newTooth) {
        updated[index] = { ...newTooth, customTreatment: updated[index].customTreatment };
      }
    } else {
      updated[index].customTreatment = value;
    }
    setCustomTreatments(updated);
    onSelectionChange(selectedTeeth, updated);
  };

  /**
   * Removes a specific custom treatment entry from the list.
   */
  const removeCustomTreatment = (index: number) => {
    const updated = customTreatments.filter((_, i) => i !== index);
    setCustomTreatments(updated);
    onSelectionChange(selectedTeeth, updated);
  };

  return {
    selectedTeeth,
    customTreatments,
    handleTeethChange,
    addCustomTreatment,
    updateCustomTreatment,
    removeCustomTreatment
  };
};