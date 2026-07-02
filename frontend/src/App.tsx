import { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, RefreshCw, Layers, Edit2, Eye, Brain, Sparkles } from 'lucide-react';
import { DashboardStats } from './components/DashboardStats';
import { NewProjectModal } from './components/NewProjectModal';
import { ProjectDetailsModal } from './components/ProjectDetailsModal';
import { useTheme } from './components/ThemeProvider';
import ReactMarkdown from 'react-markdown';

// Imports oficiais do Shadcn v4 dashboard-01
import { AppSidebar } from './components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';
import { ChartAreaInteractive } from './components/chart-area-interactive';
import { AnimatedThemeToggler } from './components/ui/animated-theme-toggler';

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

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navegação
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  // Estados de Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Estados específicos da Aba de IA
  const [selectedProjectAiTab, setSelectedProjectAiTab] = useState<Project | null>(null);
  const [aiAnalysisTab, setAiAnalysisTab] = useState<string | null>(null);
  const [isLoadingAiTab, setIsLoadingAiTab] = useState(false);

  // Tema
  const { theme, setTheme } = useTheme();

  // Busca projetos na API
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3333/projects');
      if (!res.ok) throw new Error('Falha ao carregar a lista de projetos');
      const data = await res.json();
      setProjects(data);
      // Mantém sincronizado o projeto selecionado na aba de IA se houver
      if (selectedProjectAiTab) {
        const current = data.find((p: Project) => p.id === selectedProjectAiTab.id);
        if (current) setSelectedProjectAiTab(current);
      }
    } catch {
      setError(
        'Não foi possível conectar ao servidor do backend. Certifique-se de que o container PostgreSQL e o NestJS estão em execução (porta 3333).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca análise de IA ao selecionar um projeto na aba de IA
  useEffect(() => {
    if (selectedProjectAiTab && activeTab === 'ai-analysis') {
      setAiAnalysisTab(null);
      // Não limpa automaticamente a análise para evitar piscar tela se já temos, mas aqui resetamos
    }
  }, [selectedProjectAiTab, activeTab]);

  // Aplica filtros locais reativamente
  useEffect(() => {
    let result = [...projects];

    if (searchTerm.trim() !== '') {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (riskFilter !== 'ALL') {
      result = result.filter((p) => p.risk === riskFilter);
    }

    setFilteredProjects(result);
  }, [projects, searchTerm, statusFilter, riskFilter]);

  // Cria um projeto na API
  const handleCreateProject = async (data: any) => {
    const res = await fetch('http://localhost:3333/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Falha ao criar o projeto');
    }

    await fetchProjects();
  };

  // Edita um projeto na API
  const handleUpdateProject = async (data: any) => {
    if (!projectToEdit) return;

    const res = await fetch(`http://localhost:3333/projects/${projectToEdit.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Falha ao atualizar o projeto');
    }

    if (selectedProject?.id === projectToEdit.id) {
      const updatedRes = await fetch(`http://localhost:3333/projects/${projectToEdit.id}`);
      if (updatedRes.ok) {
        const updatedProj = await updatedRes.json();
        setSelectedProject(updatedProj);
      }
    }

    await fetchProjects();
  };

  // Altera status do projeto na API
  const handleStatusChange = async (id: string, newStatus: string) => {
    const res = await fetch(`http://localhost:3333/projects/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Falha ao alterar o status do projeto');
    }

    const updatedRes = await fetch(`http://localhost:3333/projects/${id}`);
    if (updatedRes.ok) {
      const updatedProj = await updatedRes.json();
      if (selectedProject?.id === id) {
        setSelectedProject(updatedProj);
      }
      if (selectedProjectAiTab?.id === id) {
        setSelectedProjectAiTab(updatedProj);
      }
    }

    await fetchProjects();
  };

  // Remove um projeto na API
  const handleDeleteProject = async (id: string) => {
    const res = await fetch(`http://localhost:3333/projects/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Não é permitido excluir este projeto');
    }

    await fetchProjects();
  };

  // Solicita análise de IA na aba dedicada
  const handleRequestAiAnalysisTab = async () => {
    if (!selectedProjectAiTab) return;
    setIsLoadingAiTab(true);
    setAiAnalysisTab(null);
    try {
      const res = await fetch(`http://localhost:3333/projects/${selectedProjectAiTab.id}/ai-analysis`);
      if (!res.ok) throw new Error('Falha ao processar análise com IA.');
      const data = await res.json();
      setAiAnalysisTab(data.analysis);
    } catch (err: any) {
      alert(err.message || 'Falha ao conectar com o serviço de IA.');
    } finally {
      setIsLoadingAiTab(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ALTO':
        return 'text-red-500 dark:text-red-400 border border-red-500/20 bg-red-500/5';
      case 'MEDIO':
        return 'text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 bg-yellow-500/5';
      default:
        return 'text-green-600 dark:text-green-400 border border-green-500/20 bg-green-500/5';
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

  const openEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(proj);
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (proj: Project) => {
    setSelectedProject(proj);
    setIsDetailsOpen(true);
  };

  return (
    <SidebarProvider>
      {/* Sidebar Adaptada */}
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conteúdo Principal */}
      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white transition-colors duration-300">
          {/* Glow ambient decorator */}
          <div className="absolute top-0 left-1/4 -z-10 h-[35vh] w-[50vw] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[150px] pointer-events-none" />

          {/* Header Oficial do Dashboard */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6 transition-all duration-300 sticky top-0 bg-background/80 backdrop-blur z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 h-4" />
              <h1 className="text-base font-semibold text-foreground capitalize">
                {activeTab === 'dashboard' && 'Visão Geral'}
                {activeTab === 'projects' && 'Gestão de Projetos'}
                {activeTab === 'ai-analysis' && 'Auditoria e Viabilidade de IA'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <AnimatedThemeToggler
                theme={theme === 'system' ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme as any}
                onThemeChange={(newTheme) => setTheme(newTheme)}
                variant="circle"
                className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              />

              <button
                onClick={() => {
                  setProjectToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 text-xs font-semibold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Novo Projeto
              </button>
            </div>
          </header>

          {/* Renderização Condicional baseada na aba ativa */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            
            {/* 1. ABA DE DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats agregados */}
                {!isLoading && !error && <DashboardStats projects={projects} />}

                {/* Grid principal do Dashboard */}
                <div className="grid gap-6 md:grid-cols-3 items-start">
                  
                  {/* Gráfico central expansivo (2/3) */}
                  <div className="md:col-span-2 space-y-4">
                    <ChartAreaInteractive />
                  </div>

                  {/* Projetos Críticos / Recentes (1/3) */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-sm font-bold text-foreground">Atenção Crítica</h3>
                      <p className="text-2xs text-muted-foreground mt-0.5">Projetos classificados com Risco Alto</p>
                    </div>
                    
                    <div className="space-y-3">
                      {isLoading ? (
                        <p className="text-xs text-muted-foreground">Buscando prioridades...</p>
                      ) : projects.filter(p => p.risk === 'ALTO').length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">Nenhum projeto de risco crítico no momento.</p>
                      ) : (
                        projects.filter(p => p.risk === 'ALTO').slice(0, 4).map(p => (
                          <div 
                            key={p.id}
                            onClick={() => openDetailsModal(p)}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-background hover:bg-muted/30 cursor-pointer transition-all duration-200"
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-foreground block truncate max-w-[150px]">{p.name}</span>
                              <span className="text-2xs text-muted-foreground block">
                                Orçamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(p.budget))}
                              </span>
                            </div>
                            <span className="rounded-full px-2 py-0.5 text-3xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">
                              {p.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 2. ABA DE PROJETOS (CRUD) */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                
                {/* Barra de Filtros */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card border border-border p-4 rounded-2xl">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar projetos pelo nome..."
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>

                  {/* Seletores */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                      >
                        <option value="ALL">Todos os Status</option>
                        <option value="EM_ANALISE">Em análise</option>
                        <option value="APROVADO">Aprovado</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="ENCERRADO">Encerrado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>

                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    >
                      <option value="ALL">Todos os Riscos</option>
                      <option value="BAIXO">Risco Baixo</option>
                      <option value="MEDIO">Risco Médio</option>
                      <option value="ALTO">Risco Alto</option>
                    </select>
                  </div>
                </div>

                {/* Tabela de Projetos */}
                <main>
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/20">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Carregando projetos do banco de dados...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                      <h3 className="mt-4 text-base font-bold text-foreground">Falha na Conexão</h3>
                      <p className="mt-2 text-sm text-red-500/90 max-w-lg">{error}</p>
                      <button
                        onClick={fetchProjects}
                        className="mt-6 flex items-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-foreground px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <>
                      {filteredProjects.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center flex flex-col items-center justify-center">
                          <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
                            <Layers className="h-8 w-8" />
                          </div>
                          <h3 className="mt-4 text-base font-bold text-foreground">Nenhum projeto cadastrado</h3>
                          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                            {searchTerm || statusFilter !== 'ALL' || riskFilter !== 'ALL'
                              ? 'Nenhum projeto corresponde aos critérios de filtragem selecionados.'
                              : 'Comece criando seu primeiro projeto preenchendo as informações cadastrais básicas.'}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  <th className="px-6 py-4">Nome do Projeto</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Risco</th>
                                  <th className="px-6 py-4">Orçamento</th>
                                  <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border text-sm text-foreground/90">
                                {filteredProjects.map((project) => (
                                  <tr
                                    key={project.id}
                                    onClick={() => openDetailsModal(project)}
                                    className="group cursor-pointer hover:bg-muted/30 transition-colors duration-150"
                                  >
                                    <td className="px-6 py-5 font-semibold text-foreground">
                                      {project.name}
                                    </td>
                                    <td className="px-6 py-5">
                                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-semibold ${getStatusColor(project.status)}`}>
                                        {getStatusLabel(project.status)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-5">
                                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-semibold uppercase ${getRiskColor(project.risk)}`}>
                                        {project.risk}
                                      </span>
                                    </td>
                                    <td className="px-6 py-5 font-semibold text-foreground">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(Number(project.budget))}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={(e) => openEditModal(project, e)}
                                          className="rounded-lg border border-input bg-background hover:bg-muted p-2 text-muted-foreground hover:text-foreground transition-all duration-200"
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          className="rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary/20 p-2 text-primary hover:text-primary-foreground transition-all duration-200"
                                        >
                                          <Eye className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </main>
              </div>
            )}

            {/* 3. ABA DE DIAGNÓSTICOS DE IA */}
            {activeTab === 'ai-analysis' && (
              <div className="grid gap-6 md:grid-cols-3 items-start">
                
                {/* Lista de Projetos (1/3) */}
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 block">Selecionar Projeto</h3>
                  
                  <div className="space-y-2 max-h-[250px] md:max-h-[500px] overflow-y-auto custom-scrollbar">
                    {projects.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2">Nenhum projeto cadastrado.</p>
                    ) : (
                      projects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProjectAiTab(p);
                            setAiAnalysisTab(null);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                            selectedProjectAiTab?.id === p.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border bg-background hover:bg-muted/30'
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground block truncate">{p.name}</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-3xs font-semibold rounded px-1.5 py-0.5 ${getStatusColor(p.status)}`}>
                              {getStatusLabel(p.status)}
                            </span>
                            <span className="text-3xs font-medium text-muted-foreground">
                              Risco {p.risk}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Exibição da Análise em Markdown (2/3) */}
                <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 min-h-[400px] shadow-sm flex flex-col justify-between">
                  {selectedProjectAiTab ? (
                    <div>
                      <div className="border-b border-border pb-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{selectedProjectAiTab.name}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Orçamento total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedProjectAiTab.budget))}</p>
                        </div>
                        
                        <button
                          onClick={handleRequestAiAnalysisTab}
                          disabled={isLoadingAiTab}
                          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 text-xs font-bold shadow-lg shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                        >
                          <Brain className="h-4 w-4" />
                          {isLoadingAiTab ? 'Processando Análise...' : 'Gerar Diagnóstico IA'}
                        </button>
                      </div>

                      {isLoadingAiTab ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="relative flex h-10 w-10 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                            <Sparkles className="relative h-6 w-6 text-primary" />
                          </div>
                          <h4 className="mt-4 text-sm font-semibold text-foreground">Gemini está analisando o projeto...</h4>
                          <p className="mt-1 text-xs text-muted-foreground max-w-xs">Gerando diagnóstico de risco e viabilidade com inteligência artificial.</p>
                        </div>
                      ) : aiAnalysisTab ? (
                        <div className="rounded-xl bg-muted/20 border border-border p-5 overflow-x-auto max-h-[350px] md:max-h-[500px] overflow-y-auto">
                          <ReactMarkdown
                            components={{
                              h2: ({...props}) => <h2 className="text-lg font-bold text-foreground mt-4 mb-2 border-b border-border pb-1" {...props} />,
                              h3: ({...props}) => <h3 className="text-sm font-bold text-primary mt-4 mb-1.5 uppercase tracking-wider" {...props} />,
                              p: ({...props}) => <p className="text-sm text-foreground/95 leading-relaxed mb-3" {...props} />,
                              table: ({...props}) => (
                                <div className="overflow-x-auto my-4 rounded-xl border border-border">
                                  <table className="w-full border-collapse" {...props} />
                                </div>
                              ),
                              th: ({...props}) => <th className="border-b border-border bg-muted px-4 py-3 text-left text-xs font-semibold text-foreground" {...props} />,
                              td: ({...props}) => <td className="border-b border-border px-4 py-3 text-xs text-foreground/90" {...props} />,
                              ul: ({...props}) => <ul className="list-disc pl-5 space-y-1 mb-3 text-sm text-foreground/90" {...props} />,
                              ol: ({...props}) => <ol className="list-decimal pl-5 space-y-1 mb-3 text-sm text-foreground/90" {...props} />,
                              li: ({...props}) => <li className="text-sm" {...props} />,
                              blockquote: ({...props}) => <blockquote className="border-l-4 border-primary bg-muted px-4 pr-2 py-2 rounded-r-xl my-3 text-xs text-muted-foreground" {...props} />,
                            }}
                          >
                            {aiAnalysisTab}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl bg-muted/10">
                          <Brain className="h-10 w-10 text-muted-foreground" />
                          <h4 className="mt-4 text-sm font-semibold text-foreground">Pronto para Diagnóstico</h4>
                          <p className="mt-1 text-xs text-muted-foreground max-w-xs">Clique no botão superior para solicitar que o Gemini gere a análise de viabilidade e risco deste projeto.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center m-auto">
                      <Sparkles className="h-10 w-10 text-muted-foreground" />
                      <h4 className="mt-4 text-sm font-semibold text-foreground">Nenhum Projeto Selecionado</h4>
                      <p className="mt-1 text-xs text-muted-foreground max-w-xs">Selecione um projeto na lista lateral para visualizar ou gerar o diagnóstico de viabilidade com inteligência artificial.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </SidebarInset>

      {/* Modais */}
      <NewProjectModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={projectToEdit ? handleUpdateProject : handleCreateProject}
        project={projectToEdit}
      />

      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onDelete={handleDeleteProject}
        onStatusChange={handleStatusChange}
      />
    </SidebarProvider>
  );
}
