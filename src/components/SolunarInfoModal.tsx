import { useState } from 'react';

interface SolunarInfoModalProps {
  onClose: () => void;
}

export function SolunarInfoModal({ onClose }: SolunarInfoModalProps) {
  const [showTheory, setShowTheory] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(11,15,26,0.7)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          background: '#0B0F1A',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
        }}
      >
        <div style={{ padding: '16px 18px 0' }}>
          {/* РЕД 1 — Голям пик */}
          <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1b2121' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(200,230,60,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-moon" style={{ fontSize: '14px', color: '#C8E63C' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#C8E63C' }}>Голям пик</span>
                <span style={{ fontSize: '11px', color: 'rgba(127,147,168,0.95)' }}>~2 часа</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 400, fontFamily: "'Outfit', sans-serif", color: 'rgba(222,228,227,0.85)', lineHeight: 1.55, margin: 0 }}>
                  Луната е в зенит (над теб) или надир (под теб) — най-силният период на активност.
                </p>
              </div>
            </div>
          </div>

          {/* РЕД 2 — Малък пик */}
          <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1b2121' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(46,181,183,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-moon" style={{ fontSize: '14px', color: '#2eb5b7' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#2eb5b7' }}>Малък пик</span>
                <span style={{ fontSize: '11px', color: 'rgba(127,147,168,0.95)' }}>~1 час</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 400, fontFamily: "'Outfit', sans-serif", color: 'rgba(222,228,227,0.85)', lineHeight: 1.55, margin: 0 }}>
                  Изгрев или залез на Луната — по-слаб, но забележим ефект.
                </p>
              </div>
            </div>
          </div>

          {/* РЕД 3 — Златен час */}
          <div style={{ display: 'flex', gap: '12px', padding: '14px 0' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(200,230,60,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'relative', width: '16px', height: '16px' }}>
                <i className="ti ti-sun" style={{ position: 'absolute', top: '-3px', left: '-3px', fontSize: '12px', color: '#C8E63C' }} />
                <i className="ti ti-moon" style={{ position: 'absolute', bottom: '-3px', right: '-3px', fontSize: '11px', color: '#C8E63C', opacity: 0.75 }} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#C8E63C', textShadow: '0 0 8px rgba(200,230,60,0.6)' }}>Златен час</span>
                <span style={{ fontSize: '11px', color: 'rgba(127,147,168,0.95)' }}>2-3 пъти месечно</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px 10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 400, fontFamily: "'Outfit', sans-serif", color: 'rgba(222,228,227,0.85)', lineHeight: 1.55, margin: 0 }}>
                  Солунарен пик съвпада с изгрев или залез на Слънцето — най-силният възможен момент.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={(e) => { e.stopPropagation(); setShowTheory(t => !t); }}
          style={{
            padding: '14px 18px',
            borderTop: '1px solid #3d4949',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '12px', color: '#869393' }}>За теорията</span>
          <i className="ti ti-chevron-down" style={{
            fontSize: '16px', color: '#869393',
            transition: 'transform 0.2s',
            transform: showTheory ? 'rotate(180deg)' : 'rotate(0deg)',
          }} />
        </div>

        {showTheory && (
          <div style={{ padding: '0 18px 16px' }}>
            <p style={{ fontSize: '12px', color: '#869393', lineHeight: 1.55, margin: 0, marginBottom: '10px' }}>
              Рибите и дивите животни са значително по-активни в определени часове — не случайно, а в синхрон с позицията на Луната и Слънцето. Теорията е разработена от американския биолог{' '}
              <span style={{ color: '#dee4e3', fontWeight: 500 }}>Джон Найт</span> през{' '}
              <span style={{ color: '#dee4e3', fontWeight: 500 }}>1926 г.</span> и публикувана за пръв път през{' '}
              <span style={{ color: '#dee4e3', fontWeight: 500 }}>1936 г.</span>
            </p>
            <p style={{ fontSize: '12px', color: '#869393', lineHeight: 1.55, margin: 0 }}>
              Подкрепена е и от експеримент на{' '}
              <span style={{ color: '#dee4e3', fontWeight: 500 }}>д-р Франк Браун</span>, биолог в{' '}
              <span style={{ color: '#dee4e3', fontWeight: 500 }}>Northwestern University</span> — стриди, изолирани от прилива, продължават да отварят черупките си точно в часовете на лунен зенит и надир.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
