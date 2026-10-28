import type { Chambre } from "./chambre";
import type { AnneeUniversitaire } from "./annee_universitaire";
import type { Etudiant } from "./etudiant";
import type { Lit } from "./lit";

export interface Dossier {
  _id?: string;
  numero: string;
  chambreId: Chambre | string;
  litId: Lit | string;
  selectionId: {
    _id: string;
    inscription: {
      prenom: string;
      nom: string;
      genre: string;
      ncs: string;
      avatar: string;
      is_codified: boolean;
      nationalite: string;
      _id: string;
      telephone: string;
      email: string;
      cni: string;
    };
  };
  anneeUniversitaireId: AnneeUniversitaire | string;
  active?: boolean;
  caution?: number;
  taux_loyer_mensuelle?: number;
  createdAt?: string;
  updatedAt?: string;
  etudiant?: Etudiant;
}

export interface CreateDossier {
  chambreId: Chambre | string;
  litId?: Lit | string;
  selectionId: string;
  anneeUniversitaireId: AnneeUniversitaire | string;
  active?: boolean;
  caution?: number;
  taux_loyer_mensuelle?: number;
}

export interface UpdateDossier {
  _id?: string;
  chambreId?: Chambre | string;
  litId?: Lit | string;
  selectionId?: string;
  anneeUniversitaireId?: AnneeUniversitaire | string;
  active?: boolean;
  caution?: number;
  taux_loyer_mensuelle?: number;
}
