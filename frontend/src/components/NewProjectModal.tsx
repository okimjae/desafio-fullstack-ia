import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';

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

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    startDate: string;
    endDate: string;
    budget: number;
    description?: string;
  }) => Promise<void>;
  project?: Project | null;
}

export function NewProjectModal({ isOpen, onClose, onSubmit, project }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setStartDate(project.startDate.substring(0, 10));
      setEndDate(project.endDate.substring(0, 10));
      setBudget(Number(project.budget).toString());
      setDescription(project.description || '');
    } else {
      setName('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setDescription('');
    }
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'O nome do projeto é obrigatório';
    } else if (name.length < 3) {
      newErrors.name = 'O nome deve ter no mínimo 3 caracteres';
    }

    if (!startDate) {
      newErrors.startDate = 'A data de início é obrigatória';
    }

    if (!endDate) {
      newErrors.endDate = 'A data de término é obrigatória';
    } else if (startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'A data de término não pode ser anterior à de início';
    }

    if (!budget) {
      newErrors.budget = 'O orçamento é obrigatório';
    } else {
      const parsedBudget = Number(budget);
      if (isNaN(parsedBudget)) {
        newErrors.budget = 'Orçamento inválido';
      } else if (parsedBudget < 0) {
        newErrors.budget = 'O orçamento não pode ser negativo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        budget: Number(budget),
        description: description || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrors({
        submit: err.message || 'Ocorreu um erro ao salvar o projeto. Verifique os dados.',
      });
    } finally {
      setIsSubmitting(false);
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
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-bold text-foreground">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
          {errors.submit && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 dark:text-red-400">
              {errors.submit}
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Novo portal da empresa"
              className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                errors.name ? 'border-red-500/40 focus:ring-red-500/30' : 'border-border'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Descrição (Opcional)
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Escopo detalhado e metas..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background pl-4 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Cronograma (Datas) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Data de Início
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                    errors.startDate ? 'border-red-500/40 focus:ring-red-500/30' : 'border-border'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Previsão de Término
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                    errors.endDate ? 'border-red-500/40 focus:ring-red-500/30' : 'border-border'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Orçamento */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Orçamento Total (R$)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
              </div>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                  errors.budget ? 'border-red-500/40 focus:ring-red-500/30' : 'border-border'
                }`}
              />
            </div>
            {errors.budget && (
              <p className="mt-1 text-xs text-red-500">{errors.budget}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-input bg-background px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? 'Salvando...' : project ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
