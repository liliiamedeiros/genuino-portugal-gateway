import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'client' | 'appointment' | 'newsletter' | 'project';
  className?: string;
}

const statusConfig = {
  client: {
    active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
    inactive: { label: 'Inativo', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
    archived: { label: 'Arquivado', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  },
  appointment: {
    scheduled: { label: 'Agendado', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    confirmed: { label: 'Confirmado', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
    completed: { label: 'Concluído', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
    cancelled: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
    no_show: { label: 'Não Compareceu', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
  },
  newsletter: {
    active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
    unsubscribed: { label: 'Cancelado', className: 'bg-red-500/10 text-red-700 dark:text-red-400' },
    bounced: { label: 'Bounce', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
    draft: { label: 'Rascunho', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
    scheduled: { label: 'Agendado', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    sent: { label: 'Enviado', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  },
  project: {
    active: { label: 'Ativo', className: 'bg-green-500/10 text-green-700 dark:text-green-400' },
    sold: { label: 'Vendido', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    reserved: { label: 'Reservado', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400' },
    inactive: { label: 'Inativo', className: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
  },
};

export const StatusBadge = ({ status, type, className }: StatusBadgeProps) => {
  const typeConfig = statusConfig[type];
  const config = typeConfig?.[status as keyof typeof typeConfig] as { label: string; className: string } | undefined;
  
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
