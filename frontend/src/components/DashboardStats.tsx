import { Briefcase, DollarSign, Activity, AlertTriangle } from 'lucide-react';

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

interface DashboardStatsProps {
  projects: Project[];
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  const totalProjects = projects.length;

  const totalBudget = projects.reduce((acc, project) => {
    return acc + Number(project.budget);
  }, 0);

  const activeProjects = projects.filter(
    (p) => p.status === 'EM_ANDAMENTO'
  ).length;

  const highRiskProjects = projects.filter(
    (p) => p.risk === 'ALTO'
  ).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      title: 'Total de Projetos',
      value: totalProjects,
      description: 'Projetos cadastrados',
      icon: Briefcase,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Orçamento Total',
      value: formatCurrency(totalBudget),
      description: 'Capital total alocado',
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Em Execução',
      value: activeProjects,
      description: 'Projetos em andamento',
      icon: Activity,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Risco Crítico',
      value: highRiskProjects,
      description: 'Classificados com Risco Alto',
      icon: AlertTriangle,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-border/80 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </span>
            <div className={`rounded-xl border p-2 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
