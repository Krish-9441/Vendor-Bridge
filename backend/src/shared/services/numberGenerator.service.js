import { Counter } from './counter.model.js';

/**
 * Generates a sequential human-readable identifier (e.g., RFQ-2026-0001)
 * @param {string} prefix - The prefix for the identifier (e.g., 'RFQ', 'PO', 'INV')
 * @returns {Promise<string>} The generated identifier
 */
export const generateSequenceNumber = async (prefix) => {
  const currentYear = new Date().getFullYear();
  const counterId = `${prefix}-${currentYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Pad sequence to 4 digits (e.g., 0001)
  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `${counterId}-${paddedSeq}`;
};
