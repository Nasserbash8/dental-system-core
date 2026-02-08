'use client'

import { ToothShape } from '@/icons'

const SMILE_GROUPS: Record<string, string[]> = {
    U6:  ["LU1", "LU2", "LU3", "RU1", "RU2", "RU3"],
    U8:  ["LU1", "LU2", "LU3", "LU4", "RU1", "RU2", "RU3", "RU4"],
    U10: ["LU1", "LU2", "LU3", "LU4", "LU5", "RU1", "RU2", "RU3", "RU4", "RU5"],
    D6:  ["LD1", "LD2", "LD3", "RD1", "RD2", "RD3"],
    D8:  ["LD1", "LD2", "LD3", "LD4", "RD1", "RD2", "RD3", "RD4"],
    D10: ["LD1", "LD2", "LD3", "LD4", "LD5", "RD1", "RD2", "RD3", "RD4", "RD5"],
};

interface DentalMapProps {
    treatedTeeth: { id: string; value: string; customTreatment?: string }[];
}

export const DentalMap = ({ treatedTeeth }: DentalMapProps) => {
    const quadrants = ['LU', 'RU', 'LD', 'RD'] as const;
    const treatmentIds = treatedTeeth.map(t => t.id);

    const renderQuadrant = (quadrant: string) => {
        const isLeft = quadrant.includes('L');
        
        const teeth = Array.from({ length: 8 }, (_, i) => ({
            id: `${quadrant}${i + 1}`,
            number: i + 1
        })).sort((a, b) => isLeft ? b.number - a.number : a.number - b.number);

        return (
            <div key={quadrant} className="flex gap-1 flex-wrap items-center justify-center">
                {teeth.map((tooth) => {
                    const toothData = treatedTeeth.find(t => t.id === tooth.id);
                    
                    const isSelected = 
                        treatmentIds.includes(tooth.id) || 
                        treatmentIds.includes(`${quadrant}A`) || 
                        Object.keys(SMILE_GROUPS).some(gid => 
                            treatmentIds.includes(gid) && SMILE_GROUPS[gid].includes(tooth.id)
                        );
                    
                    const hasCustom = !!toothData?.customTreatment;

                    return (
                        <div key={tooth.id} className="flex flex-col items-center space-y-1 relative">
                            <span className="text-[10px] text-gray-600">{tooth.id}</span>
                            <div className="relative">
                                <ToothShape
                                    fill="#d1922b"
                                    stroke="#d1922b"
                                    className={`w-5 h-7 md:w-8 md:h-10 sm:w-7 sm:h-9 ${isSelected ? '' : 'fill-gray-100'}`}
                                />
                                {hasCustom && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="py-4 text-center space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {['LU', 'RU'].map(renderQuadrant)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {['LD', 'RD'].map(renderQuadrant)}
            </div>
        </div>
    );
};