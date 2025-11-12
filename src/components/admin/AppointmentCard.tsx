import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';

interface AppointmentCardProps {
  appointment: {
    id: string;
    title: string;
    appointment_date: string;
    duration_minutes: number;
    appointment_type: string;
    status: string;
    location?: string;
    clients?: {
      full_name: string;
    };
    projects?: {
      title_pt: string;
      location: string;
    };
  };
  onEdit?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const typeLabels: Record<string, string> = {
  viewing: 'Visita',
  meeting: 'Reunião',
  call: 'Chamada',
  video_call: 'Videochamada',
};

export const AppointmentCard = ({ appointment, onEdit, onStatusChange }: AppointmentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{appointment.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {format(new Date(appointment.appointment_date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
          <StatusBadge status={appointment.status} type="appointment" />
        </div>

        <div className="space-y-2">
          {appointment.clients && (
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>{appointment.clients.full_name}</span>
            </div>
          )}

          {appointment.projects && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{appointment.projects.title_pt}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs">
            <Badge variant="outline" className="text-xs">
              {typeLabels[appointment.appointment_type] || appointment.appointment_type}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{appointment.duration_minutes}min</span>
            </div>
          </div>
        </div>

        {(onEdit || onStatusChange) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(appointment.id)}
                className="flex-1"
              >
                Editar
              </Button>
            )}
            {onStatusChange && appointment.status === 'scheduled' && (
              <Button
                size="sm"
                onClick={() => onStatusChange(appointment.id, 'confirmed')}
                className="flex-1"
              >
                Confirmar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
