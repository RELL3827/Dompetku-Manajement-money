import React from 'react';
import { Modal } from '../common/Modal';
import { FinancialCalculator } from './FinancialCalculator';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAmount?: (amount: number, defaultNotes?: string) => void;
  onNavigateToBudgets?: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onUseAmount,
  onNavigateToBudgets,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kalkulator & Alat Hitung Cepat"
      maxWidth="md"
    >
      <FinancialCalculator
        onUseAmount={(amt, notes) => {
          onClose();
          onUseAmount?.(amt, notes);
        }}
        onNavigateToBudgets={() => {
          onClose();
          onNavigateToBudgets?.();
        }}
      />
    </Modal>
  );
};
