export interface AnneeUniversitaire {
    _id: string;
    nom: string;
    isActif: boolean;
}

export interface CreateAnneeUniversitaire {
    nom:string;
    isActif:boolean;
}

export interface UpdateAnneeUniversitaire {
    nom?:string;
    isActif?:boolean;
}

export interface Importations {
    anneeFrom:string;
    anneeTo:string;
}


export interface Results {
    totalParDepartement: never[],
    effectifFormation: never[],
    inscrits: never[],
    calculs: {totalLits:number,
    totalLitsPavillonGarcon:number,
    totalLitsPavillonFille:number,
    pourcentageLitsPavillonGarcon:number,
    pourcentageLitsPavillonFille:number,
    absoluPedagogique:number
    absoluSociale:number,
    absoluPedGarcon:number,
    absoluPedFille:number,
    absoluSocGarcon:number,
    absoluSocFille:number,
    effectifTotal:number},
    session:string
}

