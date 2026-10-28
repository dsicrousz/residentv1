/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { BookOutlined } from "@ant-design/icons";
import {
  createSelection,
  deleteSelection,
  getSelectionsBySessionAndFormation,
  type Inscrit,
  type Results,
} from "../services/selection";
import { getFormation } from "../services/formation";
import { getAnneeUniversitaireResults } from "../services/anneeUniversitaire";
import type { Results as ResultsType } from "../types/annee_universitaire";
import CodificationWorkspace from "../components/CodificationWorkspace";

const getFormationInfo = (tab: any = [], idfor: string) => {
  const { totalParDepartement } = tab;
  const allFormations = totalParDepartement?.map((departement: any) => departement.formations).flat();
  return allFormations?.find((formation: any) => formation._id === idfor);
};

export default function InscritPedagogique() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: formation, isLoading: loadingFormations } = useQuery<any>({
    queryKey: ['formation', params.idfor],
    queryFn: () => getFormation(params.idfor!),
    enabled: params.idfor !== undefined,
  });

  const { data: results, isLoading: loadingResults } = useQuery<ResultsType>({
    queryKey: ['results', params.id],
    queryFn: () => getAnneeUniversitaireResults(params.id!),
    enabled: !!params.id,
  });

  const { data: selections, isLoading: loadingSelections } = useQuery<Results>({
    queryKey: ['selections', params.idfor],
    queryFn: () => getSelectionsBySessionAndFormation(params.id!, params.idfor!),
    enabled: params.idfor !== undefined,
  });

  const { mutate: mutateCreateSelection, isPending: loadingCreateSelection } = useMutation({
    mutationFn: (data: any) => createSelection(data),
    onSuccess: () => {
      message.success('Sélection effectuée');
      queryClient.invalidateQueries({ queryKey: ['selections', params.idfor] });
    },
    onError: () => {
      message.error('Erreur lors de la sélection');
    },
  });

  const { mutate: mutateDeleteSelection, isPending: loadingDeleteSelection } = useMutation({
    mutationFn: (id: string) => deleteSelection(id),
    onSuccess: () => {
      message.success('Sélection supprimée');
      queryClient.invalidateQueries({ queryKey: ['selections', params.idfor] });
    },
    onError: () => {
      message.error('Erreur lors de la suppression de la sélection');
      message.error("Veuillez vérifier s'il n'a pas de dossier actif");
    },
  });

  const handleCreateSelection = (data: Inscrit) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { is_codified, ...rest } = data;
    mutateCreateSelection({
      inscription: rest,
      formation: params.idfor!,
      anneeUniversitaire: params.id!,
    });
  };

  const formationInfo = getFormationInfo(results, params.idfor!);

  return (
    <CodificationWorkspace
      title={formation?.nom || 'Chargement de la formation...'}
      subtitleBadge="Codification Pédagogique"
      heroIcon={<BookOutlined />}
      backLabel="Retour aux départements"
      onBack={() => navigate(-1)}
      loading={
        loadingSelections ||
        loadingFormations ||
        loadingDeleteSelection ||
        loadingCreateSelection ||
        loadingResults
      }
      selectionsData={selections}
      filterFormationId={params.idfor}
      quotaTargets={{
        nbLitTotal: formationInfo?.nb_lit || 0,
        nbLitFilles: formationInfo?.nb_lit_f || 0,
        nbLitGarcons: formationInfo?.nb_lit_g || 0,
      }}
      onSelectInscrit={handleCreateSelection}
      onRemoveSelection={(selectionId) => mutateDeleteSelection(selectionId)}
      inscritsCardTitle="Candidats inscrits à la formation"
      selectionsCardTitle="Étudiants retenus (Pédagogique)"
    />
  );
}
