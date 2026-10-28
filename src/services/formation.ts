import { formationApi } from "./api";

export const getFormation = (id: string) => formationApi.get(`${id}`).json();