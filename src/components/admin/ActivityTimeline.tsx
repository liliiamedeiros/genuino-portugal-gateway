import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  UserPlus, 
  Edit, 
  Calendar, 
  FileText, 
  Tag, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: any;
  created_at: string;
  user_id?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const getActivityIcon = (action: string) => {
  const iconMap: Record<string, any> = {
    client_created: UserPlus,
    client_updated: Edit,
    appointment_created: Calendar,
    appointment_updated: Clock,
    appointment_confirmed: CheckCircle,
    appointment_cancelled: XCircle,
    appointment_completed: CheckCircle,
    note_added: FileText,
    tags_updated: Tag,
    status_changed: AlertCircle,
  };
  
  return iconMap[action] || FileText;
};

const getActivityColor = (action: string) => {
  const colorMap: Record<string, string> = {
    client_created: 'text-blue-500',
    client_updated: 'text-yellow-500',
    appointment_created: 'text-green-500',
    appointment_confirmed: 'text-green-500',
    appointment_cancelled: 'text-red-500',
    appointment_completed: 'text-gray-500',
    note_added: 'text-purple-500',
    tags_updated: 'text-orange-500',
    status_changed: 'text-blue-500',
  };
  
  return colorMap[action] || 'text-gray-500';
};

const getActivityDescription = (activity: Activity) => {
  const descriptions: Record<string, string> = {
    client_created: 'Cliente criado',
    client_updated: 'Perfil atualizado',
    appointment_created: 'Agendamento criado',
    appointment_updated: 'Agendamento atualizado',
    appointment_confirmed: 'Agendamento confirmado',
    appointment_cancelled: 'Agendamento cancelado',
    appointment_completed: 'Agendamento concluído',
    note_added: 'Nota adicionada',
    tags_updated: 'Tags atualizadas',
    status_changed: 'Status alterado',
  };
  
  let description = descriptions[activity.action] || activity.action;
  
  if (activity.details?.title) {
    description += `: ${activity.details.title}`;
  }
  
  return description;
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.action);
        const color = getActivityColor(activity.action);
        
        return (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${color} bg-muted`}>
                <Icon className="h-4 w-4" />
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-border mt-2" />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <p className="font-medium text-sm">
                {getActivityDescription(activity)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(activity.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
              {activity.details && Object.keys(activity.details).length > 1 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {JSON.stringify(activity.details, null, 2)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
