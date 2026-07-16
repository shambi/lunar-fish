import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const PARAGRAPHS = [
  'РИБО е прогноза за риболов, базирана на лунна фаза, солунарна активност, атмосферни условия и сезонни данни.',
  'Прогнозата е ориентир, не гаранция — природата не се вписва напълно в алгоритъм.',
  'Създадено е специално за български рибари, на територията на страната. В момента фокусът е върху най-разпространените сладководни риби в реки и водоеми.',
  'Може да ти е полезно да те ориентира кога да тръгнеш, да ти припомни кои размери куки са подходящи за коя риба, прогноза за времето и солунарна активност за деня.',
];

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm border-border"
        style={{ background: '#0B0F1A', padding: '24px 20px' }}
      >
        <DialogTitle
          className="font-display"
          style={{ fontSize: '22px', fontWeight: 700, color: '#dee4e3', margin: 0 }}
        >
          За РИБО
        </DialogTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
          {PARAGRAPHS.map((text, i) => (
            <p
              key={i}
              className="font-sans text-body"
              style={{ color: 'rgba(222,228,227,0.85)', margin: 0 }}
            >
              {text}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
