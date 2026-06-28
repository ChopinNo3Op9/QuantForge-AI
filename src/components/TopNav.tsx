import { cn } from '../lib/utils';
import { FlaskConical, LineChart, Cpu, Briefcase, FileText } from 'lucide-react';

const tabs = [
  { id: 'lab', label: 'Strategy Lab', icon: FlaskConical },
  { id: 'analysis', label: 'Backtester & Analysis', icon: LineChart },
  { id: 'optimizer', label: 'Optimizer', icon: Cpu },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function TopNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) {
  return (
    <div className="bg-[#161b22] border-b border-[#30363d] px-4 overflow-x-auto hide-scrollbar sticky top-0 z-10">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive 
                  ? "border-[#00FFAA] text-[#00FFAA]" 
                  : "border-transparent text-[#8b949e] hover:text-[#c9d1d9] hover:border-[#30363d]"
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
