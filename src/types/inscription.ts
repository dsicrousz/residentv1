import type { Etudiant } from "./etudiant";

export interface Inscription {
    _id: string;
    etudiant: Etudiant;
    session:string;
    formation:string;
    active:boolean;
}