import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { FishEntry, SmartTackleResult } from '@/lib/fish-database';

interface FishModalProps {
  fish: FishEntry | null;
  tackle: SmartTackleResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FishModal({ fish, tackle, open, onOpenChange }: FishModalProps) {
  if (!fish || !tackle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border bg-card/95 backdrop-blur-xl text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-display text-xl">
            <span className="text-3xl">{fish.icon}</span>
            {fish.nameBg}
          </DialogTitle>
          <DialogDescription className="text-secondary-foreground text-sm leading-relaxed">
            {fish.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoChip label="Местообитание" value={fish.habitat} icon="🏞️" />
            <InfoChip label="Сезон" value={fish.bestSeason} icon="📅" />
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
              🎯 Умни такъми за днес
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <TackleItem label="Куки" value={tackle.hookSize} icon="🪝" />
              <TackleItem label="Влакно" value={`${tackle.lineDiameter}мм`} icon="🧵" />
              <TackleItem label="Тип влакно" value={tackle.lineType} icon="🔗" />
              <TackleItem label="Захранка/Стръв" value={tackle.groundbait} icon="🪱" />
            </div>
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
            <h4 className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              💡 Професионален съвет
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{tackle.proTip}</p>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center italic">
            Изчислено на база реални условия
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoChip({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-md bg-secondary/50 px-2.5 py-2 border border-border">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{icon} {label}</span>
      <p className="text-xs text-foreground font-medium mt-0.5">{value}</p>
    </div>
  );
}

function TackleItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground">{icon} {label}</span>
      <span className="text-xs text-foreground font-medium">{value}</span>
    </div>
  );
}
