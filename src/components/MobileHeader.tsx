import { Badge } from "@/components/ui/badge";
import { Activity, Calendar } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  lastUpdate: Date | null;
  totalRecords: number;
  className?: string;
}

export function MobileHeader({ lastUpdate, totalRecords, className }: MobileHeaderProps) {
  return (
    <div className={cn("mb-6 animate-fade-in", className)}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-primary to-accent rounded-xl sm:rounded-2xl shadow-lg hover-lift">
            <Activity className="text-white h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-health truncate">
              GlucoPulse
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg hidden sm:block">
              Monitoramento inteligente de glicemia
            </p>
            <p className="text-muted-foreground text-xs sm:hidden">
              Insights de glicemia
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Status Badges */}
      {lastUpdate && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Badge 
            variant="outline" 
            className="glass-subtle border-primary/30 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"
          >
            <Calendar className="w-3 h-3 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
            <span className="sm:hidden">
              {lastUpdate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </Badge>
          <Badge 
            className="bg-gradient-to-r from-success to-success/80 text-white border-0 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"
          >
            <Activity className="w-3 h-3 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{totalRecords} registros</span>
            <span className="sm:hidden">{totalRecords}</span>
          </Badge>
        </div>
      )}
    </div>
  );
}