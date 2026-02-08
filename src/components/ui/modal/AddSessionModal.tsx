'use client';
import React, { useState } from 'react';
import Modal from '.';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '../button/Button';
import DatePicker from '@/components/form/date-picker';
import { useRouter } from 'next/navigation';
import Select from "@/components/form/Select";

interface Session {
  sessionId: string;
  sessionDate: Date;
  Payments: string;
  paymentCurrency: string;
  PaymentsDate: Date;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  treatmentId: string;
};

export default function AddSessionModal({ isOpen, onClose, patientId, treatmentId }: Props) {
  const router = useRouter();

  const [formSession, setFormSession] = useState<Omit<Session, 'sessionId'>>({
    sessionDate: new Date(),
    Payments: '',
    paymentCurrency: 'SYP',
    PaymentsDate: new Date(),
  });

  const [sessionErrors, setSessionErrors] = useState<{ [key: string]: string }>({});
  const [isSavingSession, setIsSavingSession] = useState(false);

  const currencyOptions = [
    { value: "SYP", label: "SYP (Syrian Pound)" },
    { value: "USD", label: "USD (Dollar)" },
    { value: "EUR", label: "EUR (Euro)" },
  ];

  const handleSessionChange = (field: keyof typeof formSession, value: any) => {
    setFormSession((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formSession.sessionDate) errors.sessionDate = 'Session date is required';
    if (!formSession.Payments) errors.Payments = 'Payment amount is required';
    if (!formSession.PaymentsDate) errors.PaymentsDate = 'Payment date is required';
    return errors;
  };

  const handleSaveSession = async () => {
    if (isSavingSession) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setSessionErrors(errors);
      return;
    }

    setSessionErrors({});
    setIsSavingSession(true);

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentId,
          newSessionData: formSession,
        }),
      });

      if (res.ok) {
        setIsSavingSession(false);
        onClose();
        router.push(`/dashboard/profile/${patientId}`);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      setIsSavingSession(false);
    }
  };

  return (
    <Modal isFullscreen isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h4 className="text-xl font-semibold mb-4">Add Treatment Session</h4>

        <div className="mb-4">
          <DatePicker
            id="session-date"
            label="Session Date"
            value={[new Date(formSession.sessionDate)]}
            onChange={(d) => handleSessionChange('sessionDate', d[0])}
          />
          {sessionErrors.sessionDate && <p className="text-red-500 text-sm">{sessionErrors.sessionDate}</p>}
        </div>

        <div className="mb-4">
          <Label>Payment and Currency</Label>
          <div className="flex items-center gap-2">
            <div className="flex-grow">
              <Input
                value={formSession.Payments}
                onChange={(e) => handleSessionChange('Payments', e.target.value)}
                placeholder="Amount"
              />
            </div>

            <div className="w-36">
              <Select
                options={currencyOptions}
                defaultValue={formSession.paymentCurrency}
                onChange={(value) => handleSessionChange('paymentCurrency', value)}
              />
            </div>
          </div>
          {sessionErrors.Payments && (
            <p className="text-red-500 text-sm mt-1">{sessionErrors.Payments}</p>
          )}
        </div>

        <div className="mb-4">
          <DatePicker
            id="payments-date"
            label="Payment Date"
            value={[new Date(formSession.PaymentsDate)]}
            onChange={(d) => handleSessionChange('PaymentsDate', d[0])}
          />
          {sessionErrors.PaymentsDate && <p className="text-red-500 text-sm">{sessionErrors.PaymentsDate}</p>}
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSaveSession}
            disabled={isSavingSession}
            className={`w-full ${isSavingSession ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSavingSession ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}