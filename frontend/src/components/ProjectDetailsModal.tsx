import { useState } from 'react';
import { X, Calendar, DollarSign, Brain, Trash2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: string | number;
  description?: string | null;
  status: string;
  risk: string;
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
}

export function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  onDelete,
  onStatusChange,
}: ProjectDetailsModalProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ALTO':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      case 'MEDIO':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20';
      default:
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EM_ANALISE':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20';
      case 'APROVADO':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'EM_ANDAMENTO':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'ENCERRADO':
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700';
      default: // CANCELADO
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  const getAvailableTransitions = (status: string) => {
    switch (status) {
      case 'EM_ANALISE':
        return [
          { status: 'APROVADO', label: 'Aprovar Projeto', style: 'bg-purple-600 hover:bg-purple-500 text-white' },
          { status: 'CANCELADO', label: 'Cancelar Projeto', style: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25' },
        ];
      case 'APROVADO':
        return [
          { status: 'EM_ANDAMENTO', label: 'Iniciar Projeto', style: 'bg-blue-600 hover:bg-blue-500 text-white' },
          { status: 'CANCELADO', label: 'Cancelar Projeto', style: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25' },
        ];
      case 'EM_ANDAMENTO':
        return [
          { status: 'ENCERRADO', label: 'Encerrar Projeto', style: 'bg-zinc-600 hover:bg-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white' },
          { status: 'CANCELADO', label: 'Cancelar Projeto', style: 'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25' },
        ];
      default:
        return [];
    }
  };

  const transitions = getAvailableTransitions(project.status);
  const isDeletionBlocked = project.status === 'EM_ANDAMENTO' || project.status === 'ENCERRADO';

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    setError(null);
    try {
      await onStatusChange(project.id, newStatus);
    } catch (err: any) {
      setError(err.message || 'Falha ao alterar status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDeleteClick = async () => {
    if (isDeletionBlocked) return;
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este projeto?')) return;

    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(project.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar projeto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestAiAnalysis = async () => {
    setIsLoadingAi(true);
    setAnalysis(null);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3333/projects/${project.id}/ai-analysis`);
      if (!res.ok) throw new Error('Falha ao processar análise com IA.');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Falha ao conectar com o serviço de IA.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRiskColor(project.risk)}`}>
                RISCO {project.risk}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Descrição */}
          {project.description && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Descrição do Projeto
              </h3>
              <p className="text-sm text-foreground/90 bg-muted/30 border border-border p-4 rounded-2xl">
                {project.description}
              </p>
            </div>
          )}

          {/* Datas e Orçamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <span className="text-2xs font-medium text-muted-foreground block uppercase tracking-wider">
                  Início
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(project.startDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <span className="text-2xs font-medium text-muted-foreground block uppercase tracking-wider">
                  Previsão de Término
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatDate(project.endDate)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
              <DollarSign className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <div>
                <span className="text-2xs font-medium text-muted-foreground block uppercase tracking-wider">
                  Orçamento
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(project.budget)}
                </span>
              </div>
            </div>
          </div>

          {/* Seção de Transições de Status */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
              Fluxo de Status do Projeto
            </h3>
            {transitions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {transitions.map((t, idx) => (
                  <button
                    key={idx}
                    disabled={isChangingStatus}
                    onClick={() => handleStatusChange(t.status)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md active:scale-[0.98] disabled:opacity-50 transition-all duration-200 ${t.style}`}
                  >
                    {t.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                Este projeto atingiu o status terminal de **{getStatusLabel(project.status)}**. Nenhuma outra alteração de status é permitida.
              </div>
            )}
          </div>

          {/* Seção de Análise IA do Gemini */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Diagnóstico de Viabilidade com Inteligência Artificial
              </h3>
              <button
                onClick={handleRequestAiAnalysis}
                disabled={isLoadingAi}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
              >
                <Brain className="h-4 w-4" />
                {isLoadingAi ? 'Analisando...' : 'Solicitar Análise de IA'}
              </button>
            </div>

            {/* AI Analysis Result */}
            {isLoadingAi && (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center animate-pulse">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <Sparkles className="relative h-6 w-6 text-primary" />
                </div>
                <h4 className="mt-4 text-sm font-semibold text-foreground">Gemini está analisando o projeto...</h4>
                <p className="mt-1 text-xs text-muted-foreground">Isso pode levar alguns segundos de processamento.</p>
              </div>
            )}

            {!isLoadingAi && analysis && (
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-5 overflow-x-auto max-h-[400px] overflow-y-auto">
                <ReactMarkdown
                  components={{
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2 border-b border-border pb-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold text-primary mt-4 mb-1.5 uppercase tracking-wider" {...props} />,
                    p: ({node, ...props}) => <p className="text-sm text-foreground/95 leading-relaxed mb-3" {...props} />,
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4 rounded-xl border border-border">
                        <table className="w-full border-collapse" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => <th className="border-b border-border bg-muted px-4 py-3 text-left text-xs font-semibold text-foreground" {...props} />,
                    td: ({node, ...props}) => <td className="border-b border-border px-4 py-3 text-xs text-foreground/90" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-3 text-sm text-foreground/90" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-3 text-sm text-foreground/90" {...props} />,
                    li: ({node, ...props}) => <li className="text-sm" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary bg-muted px-4 pr-2 py-2 rounded-r-xl my-3 text-xs text-muted-foreground" {...props} />,
                  }}
                >
                  {analysis}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Deletar Projeto (Rodapé do Modal) */}
          <div className="border-t border-border pt-4 flex items-center justify-between mt-6">
            <div>
              {isDeletionBlocked && (
                <div className="flex items-center gap-1.5 text-2xs font-semibold text-red-500">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Projetos em andamento ou encerrados não podem ser excluídos.</span>
                </div>
              )}
            </div>
            <button
              disabled={isDeleting || isDeletionBlocked}
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 px-4 py-2.5 text-xs font-bold text-destructive disabled:opacity-30 disabled:hover:bg-destructive/10 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Excluindo...' : 'Excluir Projeto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
