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

const FormulaIcon = ({ name }: { name: string }) => (
  <i className={`ti ${name}`} style={{ fontSize: '12px', flexShrink: 0 }} />
);

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm border-border"
        style={{ background: '#0B0F1A', padding: '24px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/ribo-fish-watermark.svg"
            alt=""
            aria-hidden="true"
            style={{ height: '26px', width: 'auto', filter: 'drop-shadow(0 0 9px #2eb5b7)', flexShrink: 0 }}
          />
          <DialogTitle
            className="font-display"
            style={{ fontSize: '22px', fontWeight: 700, color: '#dee4e3', margin: 0 }}
          >
            За РИБО
          </DialogTitle>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
          <p className="font-sans text-body" style={{ color: 'rgba(222,228,227,0.85)', margin: 0 }}>
            {PARAGRAPHS[0]}
          </p>

          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                gap: '1px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: '#2eb5b7',
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
                overflowX: 'auto',
              }}
            >
              <span>√( (</span>
              <FormulaIcon name="ti-moon" />
              <span>×</span>
              <FormulaIcon name="ti-wind" />
              <FormulaIcon name="ti-gauge" />
              <span>) / (</span>
              <FormulaIcon name="ti-cloud" />
              <span>+</span>
              <FormulaIcon name="ti-thermometer" />
              <span>) ) × √(късмет +</span>
              <FormulaIcon name="ti-clover" />
              <span>)</span>
              <span style={{ color: '#C8E63C', fontWeight: 700 }}>= РИБО</span>
            </div>
            <p
              className="font-sans"
              style={{ fontSize: '12px', fontStyle: 'italic', color: '#869393', margin: '4px 0 0' }}
            >
              (научно доказано... почти)
            </p>
          </div>

          {PARAGRAPHS.slice(1).map((text, i) => (
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
