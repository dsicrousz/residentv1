/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import {
  createSelection,
  deleteSelection,
  type Inscrit,
  getSelectionsSocialeByAnneeUniversitaireId,
} from "../services/selection";
import { getAnneeUniversitaireResults } from "../services/anneeUniversitaire";
import type { Results as ResultsType } from "../types/annee_universitaire";
import CodificationWorkspace from "../components/CodificationWorkspace";

export default function SelectionSociale() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: selections, isLoading: loadingSelections } = useQuery({
    queryKey: ['selections', id],
    queryFn: () => getSelectionsSocialeByAnneeUniversitaireId(id!),
    enabled: !!id,
  });

  const { data: results, isLoading: loadingResults } = useQuery<ResultsType>({
    queryKey: ['results', id],
    queryFn: () => getAnneeUniversitaireResults(id!),
    enabled: !!id,
  });

  const { mutate: mutateCreateSelection, isPending: loadingCreateSelection } = useMutation({
    mutationFn: (data: any) => createSelection(data),
    onSuccess: () => {
      message.success('Sélection effectuée');
      queryClient.invalidateQueries({ queryKey: ['selections', id] });
    },
    onError: () => {
      message.error('Erreur lors de la sélection');
      message.error("Veuillez vérifier s'il n'a pas de dossier actif ou s'il n'a pas déjà été sélectionné");
    },
  });

  const { mutate: mutateDeleteSelection, isPending: loadingDeleteSelection } = useMutation({
    mutationFn: (selectionId: string) => deleteSelection(selectionId),
    onSuccess: () => {
      message.success('Sélection supprimée');
      queryClient.invalidateQueries({ queryKey: ['selections', id] });
    },
    onError: () => {
      message.error('Erreur lors de la suppression de la sélection');
    },
  });

  const handleCreateSelection = (data: Inscrit) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_codified, formation, ...rest } = data;
    mutateCreateSelection({
      inscription: rest,
      formation: formation._id,
      anneeUniversitaire: id!,
      typeCodif: 'SOCIALE',
    });
  };

  return (
    <CodificationWorkspace
      title="Sélection Sociale des Étudiants"
      subtitleBadge="Volet Social"
      heroIcon={<TeamOutlined />}
      heroGradient="linear-gradient(135deg, #0f172a 0%, #065f46 100%)"
      backLabel="Retour à la session"
      onBack={() => navigate(`/dashboard/annee_universitaire/${id}`)}
      loading={loadingSelections || loadingDeleteSelection || loadingCreateSelection || loadingResults}
      selectionsData={selections}
      quotaTargets={{
        nbLitTotal: results?.calculs?.absoluSociale || 0,
        nbLitFilles: results?.calculs?.absoluSocFille || 0,
        nbLitGarcons: results?.calculs?.absoluSocGarcon || 0,
      }}
      onSelectInscrit={handleCreateSelection}
      onRemoveSelection={(selectionId) => mutateDeleteSelection(selectionId)}
      inscritsCardTitle="Liste générale des inscriptions"
      selectionsCardTitle="Sélections sociales retenues"
    />
  );
}
