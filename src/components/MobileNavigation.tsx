import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Target, 
  Activity, 
  FileText, 
  Table, 
  Calendar, 
  Brain,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navigationItems = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'metrics', label: 'Métricas', icon: Target },
  { value: 'patterns', label: 'Padrões', icon: Activity },
  { value: 'report', label: 'Relatório', icon: FileText },
  { value: 'table', label: 'Tabela', icon: Table },
  { value: 'calendar', label: 'Calendário', icon: Calendar },
  { value: 'insights', label: 'Insights', icon: Brain },
];

export function MobileNavigation({ activeTab, onTabChange, className }: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <div className={cn("mobile-nav sm:hidden", className)}>
        <div className="flex items-center justify-around px-2 py-1">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                className={cn(
                  "mobile-nav-item touch-target flex-1",
                  isActive && "active"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs truncate">{item.label}</span>
              </button>
            );
          })}
          
          {/* More button for additional tabs */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="mobile-nav-item touch-target flex-1"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-xs">Mais</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer for additional navigation items */}
      {isDrawerOpen && (
        <>
          <div 
            className="mobile-drawer-overlay sm:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="mobile-drawer sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Navegação</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                className="touch-target"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                
                return (
                  <button
                    key={item.value}
                    onClick={() => handleTabChange(item.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border",
                      "touch-target transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-card hover:bg-muted border-border"
                    )}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}