import { payementsApi } from './api';
import type { Payement, CreatePayement, UpdatePayement } from '../types/payement';

// Get all payments
export const getPayementsByAnneeUniversitaireId = async (anneeUniversitaireId: string): Promise<Payement[]> => {
  return await payementsApi.get(`anneeUniversitaire/${anneeUniversitaireId}`).json();
};

// Get payments by dossier ID
export const getPayementsByDossierId = async (dossierId: string): Promise<Payement[]> => {
  return await payementsApi.get(`dossier/${dossierId}`).json();
};

// Get payment by ID
export const getPayementById = async (id: string): Promise<Payement> => {
  return await payementsApi.get(`${id}`).json();
};

// Create a new payment
export const createPayement = async (payement: CreatePayement): Promise<Payement> => {
  return await payementsApi.post('', { json: payement }).json();
};

// Update a payment
export const updatePayement = async (id: string, payement: UpdatePayement): Promise<Payement> => {
  return await payementsApi.patch(`${id}`, { json: payement }).json();
};

// Delete a payment
export const deletePayement = async (id: string): Promise<void> => {
  return await payementsApi.delete(`${id}`).json();
};

