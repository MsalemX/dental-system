"use client";

import { useState, useEffect } from 'react';
import { DentalChart, ToothData, getDentalChart, updateDentalChart } from '../lib/data';

interface DentalChartComponentProps {
    patientId: string;
    patientName: string;
}

const TEETH_POSITIONS = [
    // Upper right (18-11)
    { id: '18', x: 50, y: 20 }, { id: '17', x: 70, y: 20 }, { id: '16', x: 90, y: 20 }, { id: '15', x: 110, y: 20 },
    { id: '14', x: 130, y: 20 }, { id: '13', x: 150, y: 20 }, { id: '12', x: 170, y: 20 }, { id: '11', x: 190, y: 20 },
    // Upper left (21-28)
    { id: '21', x: 250, y: 20 }, { id: '22', x: 270, y: 20 }, { id: '23', x: 290, y: 20 }, { id: '24', x: 310, y: 20 },
    { id: '25', x: 330, y: 20 }, { id: '26', x: 350, y: 20 }, { id: '27', x: 370, y: 20 }, { id: '28', x: 390, y: 20 },
    // Lower right (48-41)
    { id: '48', x: 50, y: 120 }, { id: '47', x: 70, y: 120 }, { id: '46', x: 90, y: 120 }, { id: '45', x: 110, y: 120 },
    { id: '44', x: 130, y: 120 }, { id: '43', x: 150, y: 120 }, { id: '42', x: 170, y: 120 }, { id: '41', x: 190, y: 120 },
    // Lower left (31-38)
    { id: '31', x: 250, y: 120 }, { id: '32', x: 270, y: 120 }, { id: '33', x: 290, y: 120 }, { id: '34', x: 310, y: 120 },
    { id: '35', x: 330, y: 120 }, { id: '36', x: 350, y: 120 }, { id: '37', x: 370, y: 120 }, { id: '38', x: 390, y: 120 },
];

const CONDITION_COLORS = {
    healthy: '#10b981',
    cavity: '#ef4444',
    filling: '#f59e0b',
    crown: '#8b5cf6',
    extraction: '#6b7280',
    implant: '#06b6d4',
    bridge: '#ec4899',
};

export default function DentalChartComponent({ patientId, patientName }: DentalChartComponentProps) {
    const [chart, setChart] = useState<DentalChart | null>(null);
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const existingChart = getDentalChart(patientId);
        if (existingChart) {
            setChart(existingChart);
        } else {
            // Initialize empty chart
            const newChart: DentalChart = {
                patientId,
                teeth: {},
            };
            setChart(newChart);
        }
    }, [patientId]);

    const handleToothClick = (toothId: string) => {
        setSelectedTooth(toothId);
        setIsModalOpen(true);
    };

    const handleSaveToothData = (toothData: ToothData) => {
        if (!chart) return;

        const updatedChart = {
            ...chart,
            teeth: {
                ...chart.teeth,
                [toothData.toothId]: toothData,
            },
        };

        setChart(updatedChart);
        updateDentalChart(patientId, updatedChart);
        setIsModalOpen(false);
    };

    const getToothColor = (toothId: string) => {
        const toothData = chart?.teeth[toothId];
        return toothData ? CONDITION_COLORS[toothData.condition] : '#e5e7eb';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl">
                <h3 className="text-2xl font-black text-slate-800 mb-6">خريطة الأسنان التفاعلية</h3>
                <p className="text-slate-500 mb-8">انقر على السن لإضافة أو تعديل حالته وإجراءاته</p>

                {/* Dental Chart SVG */}
                <div className="relative bg-slate-50 rounded-2xl p-8 overflow-hidden">
                    <svg width="450" height="160" className="w-full h-auto">
                        {/* Upper arch */}
                        <path d="M 40 40 Q 220 10 400 40" stroke="#d1d5db" strokeWidth="2" fill="none" />
                        {/* Lower arch */}
                        <path d="M 40 140 Q 220 170 400 140" stroke="#d1d5db" strokeWidth="2" fill="none" />

                        {/* Teeth */}
                        {TEETH_POSITIONS.map((tooth) => (
                            <g key={tooth.id}>
                                <rect
                                    x={tooth.x - 8}
                                    y={tooth.y - 8}
                                    width="16"
                                    height="16"
                                    fill={getToothColor(tooth.id)}
                                    stroke="#374151"
                                    strokeWidth="1"
                                    rx="2"
                                    className="cursor-pointer hover:stroke-2 transition-all"
                                    onClick={() => handleToothClick(tooth.id)}
                                />
                                <text
                                    x={tooth.x}
                                    y={tooth.y + 20}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill="#6b7280"
                                >
                                    {tooth.id}
                                </text>
                            </g>
                        ))}
                    </svg>

                    {/* Legend */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg p-3 shadow-lg border">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">دليل الألوان</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            {Object.entries(CONDITION_COLORS).map(([condition, color]) => (
                                <div key={condition} className="flex items-center gap-1">
                                    <div
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: color }}
                                    ></div>
                                    <span className="text-slate-600">
                                        {condition === 'healthy' ? 'سليم' :
                                            condition === 'cavity' ? 'تسوس' :
                                                condition === 'filling' ? 'حشوة' :
                                                    condition === 'crown' ? 'تاج' :
                                                        condition === 'extraction' ? 'قلع' :
                                                            condition === 'implant' ? 'زرعة' : 'جسر'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooth Details Modal */}
            {isModalOpen && selectedTooth && (
                <ToothModal
                    toothId={selectedTooth}
                    toothData={chart?.teeth[selectedTooth]}
                    onSave={handleSaveToothData}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

interface ToothModalProps {
    toothId: string;
    toothData?: ToothData;
    onSave: (data: ToothData) => void;
    onClose: () => void;
}

function ToothModal({ toothId, toothData, onSave, onClose }: ToothModalProps) {
    const [condition, setCondition] = useState(toothData?.condition || 'healthy');
    const [notes, setNotes] = useState(toothData?.notes || '');
    const [procedures, setProcedures] = useState(toothData?.procedures || []);

    const handleSave = () => {
        const data: ToothData = {
            toothId,
            condition: condition as any,
            procedures,
            notes,
        };
        onSave(data);
    };

    const addProcedure = () => {
        const newProcedure = {
            id: `proc_${Date.now()}`,
            type: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        };
        setProcedures([...procedures, newProcedure]);
    };

    const updateProcedure = (index: number, field: string, value: string) => {
        const updated = [...procedures];
        updated[index] = { ...updated[index], [field]: value };
        setProcedures(updated);
    };

    const removeProcedure = (index: number) => {
        setProcedures(procedures.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-800 mb-6">السن رقم {toothId}</h3>

                <div className="space-y-6">
                    {/* Condition */}
                    <div>
                        <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 block">حالة السن</label>
                        <select
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as ToothData['condition'])}
                            className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 font-bold text-slate-700"
                        >
                            <option value="healthy">سليم</option>
                            <option value="cavity">تسوس</option>
                            <option value="filling">حشوة</option>
                            <option value="crown">تاج</option>
                            <option value="extraction">قلع</option>
                            <option value="implant">زرعة</option>
                            <option value="bridge">جسر</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 block">ملاحظات</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-24 bg-slate-50 border-0 rounded-2xl p-4 font-bold text-slate-700 resize-none"
                            placeholder="أضف ملاحظات حول السن..."
                        />
                    </div>

                    {/* Procedures */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">الإجراءات السابقة</label>
                            <button
                                onClick={addProcedure}
                                className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                            >
                                إضافة إجراء
                            </button>
                        </div>
                        <div className="space-y-3">
                            {procedures.map((proc, index) => (
                                <div key={proc.id} className="bg-slate-50 p-4 rounded-2xl space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="نوع الإجراء"
                                            value={proc.type}
                                            onChange={(e) => updateProcedure(index, 'type', e.target.value)}
                                            className="h-10 bg-white border-0 rounded-xl px-3 font-bold text-slate-700 text-sm"
                                        />
                                        <input
                                            type="date"
                                            value={proc.date}
                                            onChange={(e) => updateProcedure(index, 'date', e.target.value)}
                                            className="h-10 bg-white border-0 rounded-xl px-3 font-bold text-slate-700 text-sm"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="ملاحظات الإجراء"
                                        value={proc.notes}
                                        onChange={(e) => updateProcedure(index, 'notes', e.target.value)}
                                        className="w-full h-10 bg-white border-0 rounded-xl px-3 font-bold text-slate-700 text-sm"
                                    />
                                    <button
                                        onClick={() => removeProcedure(index)}
                                        className="text-rose-500 text-sm font-bold hover:text-rose-700"
                                    >
                                        حذف الإجراء
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        className="flex-1 h-14 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                        حفظ التغييرات
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 bg-slate-100 text-slate-500 font-black h-14 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}