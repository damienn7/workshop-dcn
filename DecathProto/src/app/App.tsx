import { useState, useEffect } from "react";
import {
  ArrowLeft,
  QrCode,
  Search,
  Camera,
  ChevronRight,
  Check,
  X,
  Printer,
  MessageSquare,
  Mail,
  Menu,
  Home,
  FileText,
  Settings,
} from "lucide-react";
import diagApi from "../imports/diagApi";
import type { CaseListItem, BuybackCase } from "../imports/api.types";
import { setCurrentCase, getCurrentCase, subscribeCurrentCase } from "../imports/currentCase";
import { formatPreDiagnosticValue, formatScore, formatPrice } from "../imports/formatters";

// ─── Design tokens ─────────────────────────────────────────────────────────────

// const C = {
//   blue: "#1A2EFF",
//   navy: "#060D2E",
//   bgPage: "#F5F5F5",
//   card: "#FFFFFF",
//   text: "#0B0D2E",
//   textMuted: "#6B7280",
//   border: "#E2E4EF",
//   blueLight: "#ECEEFF",
//   orange: "#FF6600",
//   orangeLight: "#FFF0E6",
//   green: "#16A34A",
//   greenLight: "#DCFCE7",
//   red: "#DC2626",
//   redLight: "#FEE2E2",
//   amberLight: "#FEF3C7",
//   amber: "#D97706",
// };

const C = {
  blue: "#3643BA",
  navy: "#3643BA",
  bgPage: "#FFFFFF",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#999999",
  border: "#DDDDDD",
  blueLight: "#E8EAFB",
  orange: "#A05000",
  orangeLight: "#FFF4E0",
  green: "#1A7A45",
  greenLight: "#E6F5EE",
  green2: "#149B65",
  greenLight2: "#94FFB8",
  red: "#A01010",
  redLight: "#FFF0F0",
  amberLight: "#FEF3C7",
  amber: "#D97706",
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type ScreenId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type StatusType = "pending" | "accepted" | "refused" | "conditional" | "seller";

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<StatusType, string> = {
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  conditional: "Reprise conditionnelle",
  seller: "Mode vendeur",
};

const STATUS_STYLE: Record<StatusType, React.CSSProperties> = {
  pending: { backgroundColor: C.amberLight, color: C.amber },
  accepted: { backgroundColor: C.greenLight, color: C.green },
  refused: { backgroundColor: C.redLight, color: C.red },
  conditional: { backgroundColor: C.orangeLight, color: C.orange },
  seller: { backgroundColor: C.blueLight, color: C.blue }
};

function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={STATUS_STYLE[status]}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{ backgroundColor: C.card, borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="section-label text-[10px] font-bold tracking-[0.12em] uppercase mb-2"
      style={{ color: C.textMuted }}
    >
      {children}
    </p>
  );
}

function PrimaryButton({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="primary-button py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80 w-full sm:w-auto"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="secondary-button py-3 px-6 rounded-xl font-semibold text-sm w-full sm:w-auto transition-colors"
    >
      {children}
    </button>
  );
}

function ChoiceChip({
  label,
  selected,
  danger,
  onClick,
}: {
  label: string;
  selected?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-selected={selected ? 'true' : 'false'}
      data-danger={danger ? 'true' : 'false'}
      aria-pressed={selected ? 'true' : 'false'}
      className="choice-chip px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
    >
      {label}
    </button>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="photo-placeholder flex-1 flex flex-col items-center justify-center gap-2 rounded-xl py-6 min-h-[90px]"
      style={{ border: `2px dashed ${C.border}`, backgroundColor: C.bgPage }}
    >
      <Camera size={18} style={{ color: C.border }} />
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
        {label}
      </span>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: C.border }}
    >
      <span className="text-xs" style={{ color: C.textMuted }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: C.text }}>{value}</span>
    </div>
  );
}

function InfoBox({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "orange" }) {
  const style =
    color === "orange"
      ? { backgroundColor: C.orangeLight, borderColor: "#FFCBA0", color: C.orange }
      : { backgroundColor: C.blueLight, borderColor: "#C7CCFF", color: C.blue };
  return (
    <div className="rounded-xl px-4 py-3 text-xs leading-relaxed border" style={style}>
      {children}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 75 ? C.green : value >= 50 ? C.orange : C.red;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function QuestionChips({
  question,
  options,
  selected,
  onSelect,
  dangerOption,
}: {
  question: string;
  options: string[];
  selected?: string;
  onSelect?: (v: string) => void;
  dangerOption?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold mb-2" style={{ color: C.text }}>{question}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <ChoiceChip
            key={opt}
            label={opt}
            selected={selected === opt}
            danger={opt === dangerOption}
            onClick={() => onSelect?.(opt)}
          />
        ))}
      </div>
    </div>
  );
}

function NavButton({
  onPrev, prevLabel, onNext, nextLabel,
}: {
  onPrev?: () => void; prevLabel?: string;
  onNext?: () => void; nextLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      {onPrev && (
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={onPrev}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <ArrowLeft size={13} />
              <span>{prevLabel}</span>
            </div>
          </SecondaryButton>
        </div>
      )}
      {onNext && (
        <div style={{ flex: 1 }}>
          <PrimaryButton onClick={onNext}>{nextLabel} →</PrimaryButton>
        </div>
      )}
    </div>
  );
}

// ─── Page shell (header + content area) ──────────────────────────────────────

function PageShell({
  title,
  subtitle,
  onBack,
  backLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  children: React.ReactNode;
}) {
  function AppHeader({ title, subtitle, onBack, backLabel }: { title: string; subtitle?: string; onBack?: () => void; backLabel?: string; }) {
    return (
      <div className="app-header">
        <div className="px-6 pt-5 pb-4">
          {onBack && (
            <button onClick={onBack} className="app-header__back">
              <ArrowLeft size={14} />
              <span style={{ marginLeft: 6 }}>{backLabel ?? 'Retour'}</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-white leading-tight" style={{ marginTop: 6 }}>{title}</h1>
          {subtitle && <p className="app-header__subtitle">{subtitle}</p>}
        </div>
      </div>
    );
  }
  // detect stepper pattern like "Étape 1 / 5"
  const stepMatch = subtitle ? subtitle.match(/Étape\s*(\d+)\s*\/\s*(\d+)/) : null;
  let stepBar: React.ReactNode = null;
  if (stepMatch) {
    const rawIndex = Number(stepMatch[1]);
    const total = Number(stepMatch[2]) || 0;
    const activeIndex = Math.min(total, rawIndex + 1); // handle 0-based step numbering
    stepBar = (
      <div className="px-6 mt-3 mb-2">
        <div className="stepper" aria-hidden>
          {Array.from({ length: total }).map((_, idx) => {
            const i = idx + 1;
            return <div key={i} className={`stepper__segment ${i <= activeIndex ? 'stepper__segment--active' : ''}`} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title={title} subtitle={subtitle} onBack={onBack} backLabel={backLabel} />
      {stepBar}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: C.bgPage }}>
        <div className="p-6 flex flex-col gap-4 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

// ─── Screen 1 — Accueil ───────────────────────────────────────────────────────

const DOSSIERS = [
  { name: "Marie Dupont", initials: "MD", bike: "VTT Rockrider 520", ref: "DEC-00487", time: "12 min", status: "pending" as StatusType },
  { name: "Paul Rivière", initials: "PR", bike: "Route Triban 100", ref: "DEC-00481", time: "2h", status: "accepted" as StatusType },
  { name: "Sophie Chen", initials: "SC", bike: "Électrique B'Twin", ref: "DEC-00479", time: "4h", status: "refused" as StatusType },
];

function Logo() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_79_1557)">
        <path d="M13.1944 11.6015C13.1944 10.5993 13.1953 9.61066 13.1929 8.62174C13.1929 8.54453 13.237 8.50365 13.2834 8.45672C14.0533 7.67643 14.7384 6.83315 15.2545 5.86483C15.5991 5.21806 15.861 4.54405 15.9257 3.80857C16.0447 2.46114 15.409 1.55731 14.088 1.1988C13.4128 1.01562 12.7246 1.00411 12.0365 1.09495C9.88267 1.37987 8.00509 2.31913 6.24618 3.52182C4.88928 4.44958 3.68294 5.54054 2.69984 6.85707C2.08012 7.68703 1.57937 8.57754 1.36134 9.60006C1.27456 10.0076 1.24114 10.4188 1.31044 10.8318C1.44843 11.6539 2.04976 11.9997 2.80533 11.9182C3.5517 11.8377 4.1561 11.4531 4.72369 11.0062C5.6841 10.2502 6.48904 9.34239 7.26823 8.41342C8.69351 6.71446 10.0081 4.93495 11.2055 3.07187C11.2215 3.04705 11.239 3.02343 11.2638 2.988C11.3058 3.04735 11.2914 3.10336 11.2914 3.15423C11.2926 6.37352 11.292 9.5928 11.296 12.8121C11.296 12.9208 11.2411 12.9617 11.1638 13.0065C9.65514 13.8788 8.06243 14.5377 6.33388 14.8426C5.10393 15.0594 3.8749 15.0876 2.66949 14.7012C1.62536 14.3666 0.799571 13.7638 0.334086 12.7491C0.0231487 12.0693 -0.0446196 11.3514 0.0252952 10.6187C0.174324 9.05928 0.860593 7.71428 1.76949 6.46738C3.01845 4.75328 4.59398 3.38224 6.39153 2.25373C7.63374 1.47404 8.95293 0.855136 10.3693 0.447276C11.4187 0.14509 12.487 -0.032649 13.5833 0.00459435C14.6194 0.0397182 15.6096 0.250764 16.4804 0.843025C17.3562 1.43862 17.841 2.27038 17.9655 3.30926C18.0918 4.36449 17.8634 5.36552 17.4623 6.33355C16.8358 7.84599 15.8662 9.12892 14.7145 10.2868C14.2879 10.7155 13.8365 11.1174 13.3643 11.4961C13.318 11.5334 13.2775 11.5812 13.1947 11.6012L13.1944 11.6015Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_79_1557">
          <rect width="18" height="15" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function Screen1({ go }: { go: (s: ScreenId) => void }) {
  const [dossiers, setDossiers] = useState(DOSSIERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    diagApi
      .listCases()
      .then((list: CaseListItem[]) => {
        if (!mounted) return;
        const mapped = list.map((c) => {
          const initials = (c.customerName || "")
            .split(" ")
            .map((n) => n[0] ?? "")
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return {
            name: c.customerName,
            initials,
            bike: c.itemLabel,
            ref: c.caseNumber,
            time: "",
            status: c.status as StatusType,
          } as typeof DOSSIERS[0];
        });
        setDossiers(mapped.length ? mapped : DOSSIERS);
      })
      .catch(() => {
        if (!mounted) return;
        setError("API indisponible, affichage des données locales.");
        setDossiers(DOSSIERS);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCase = async (caseNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const c = await diagApi.getCase(caseNumber);
      setCurrentCase(c as BuybackCase);
      go(2);
    } catch (err: any) {
      setError(err?.message ?? 'Aucun dossier trouvé pour ce numéro.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (!term || term.trim().length === 0) return;
    await handleOpenCase(term.trim());
  };

  const handleCreateWithoutPrediag = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        source: 'in_store',
        withoutPreDiagnostic: true,
        customer: { firstName: 'Client', lastName: 'Magasin', phone: '', email: '' },
        item: { articleType: 'bike' }
      };
      const c = await diagApi.createCase(payload);
      setCurrentCase(c as BuybackCase);
      go(2);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur création dossier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 pt-5 pb-5" style={{ backgroundColor: C.navy }}>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "#FFFFFF", display: "flex", alignItems: "center", gap: 4 }}>
          {Logo()}<span style={{ marginLeft: "3px" }}> DECATHLON <span style={{ color: "rgba(255,255,255,0.5)" }}>· Seconde Vie</span></span>
        </p>
        <h1 className="text-2xl font-bold text-white">Diagnostic reprise</h1>
        {/* <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Mode vendeur</p> */}
        <StatusBadge status={"seller"} />
        <p className="text-xs mt-1" style={{ color: "#FFFFFF" }}>
          Julien M. · Magasin Paris-Montparnasse
        </p>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: C.bgPage }}>
        <div className="p-6 max-w-2xl flex flex-col gap-5">
          {/* Scanner CTA */}
          <button
            onClick={() => go(1)}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all hover:shadow-md"
            style={{ backgroundColor: C.card, borderColor: C.border }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: C.blue }}
            >
              <QrCode size={22} color="#fff" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: C.text }}>
                Scanner le QR code client
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                Appuie pour ouvrir la caméra
              </p>
            </div>
            <ChevronRight size={16} style={{ color: C.border }} />
          </button>

          {/* Recherche */}
          <div>
            <SectionLabel>OU RECHERCHER UN DOSSIER</SectionLabel>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textMuted }} />
                <input
                  type="text"
                  placeholder="N° dossier ex: DEC-00487"
                  className="w-full h-11 pl-9 pr-4 rounded-xl border text-sm outline-none transition-colors"
                  style={{ backgroundColor: C.card, borderColor: C.border, color: C.text }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSearch(searchTerm); } }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <SecondaryButton onClick={() => { void handleCreateWithoutPrediag(); }}>Nouveau sans pré-diagnostic</SecondaryButton>
            </div>
          </div>

          {/* Liste dossiers */}
          <div>
            <SectionLabel>DOSSIERS EN ATTENTE</SectionLabel>
            <Card>
              {dossiers.map((d, i) => (
                <button
                  key={d.ref}
                  onClick={() => { void handleOpenCase(d.ref); }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${i < dossiers.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: C.border }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ backgroundColor: C.blue }}
                  >
                    {d.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: C.text }}>{d.name}</p>
                    <p className="text-xs truncate" style={{ color: C.textMuted }}>
                      {d.bike} · {d.ref} · {d.time}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </button>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2 — Scanner ────────────────────────────────────────────────────────

function Screen2({ go }: { go: (s: ScreenId) => void }) {
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setScanLoading(true);
    setScanError(null);
    try {
      const c = await diagApi.getCase('DEC-00487');
      setCurrentCase(c as BuybackCase);
      go(2);
    } catch (err: any) {
      setScanError(err?.message ?? 'Erreur API');
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <PageShell title="Scanner QR code" subtitle="Cadre le QR code du dossier client dans le viseur" onBack={() => go(0)} backLabel="Retour">
      {/* Viewfinder */}
      <div
        className="w-full rounded-2xl overflow-hidden relative flex items-center justify-center"
        style={{ backgroundColor: "#0A0A1A", height: 280 }}
      >
        <div className="absolute w-44 h-44">
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 ${cls}`} style={{ borderColor: C.blue }} />
          ))}
          <div
            className="absolute left-0 right-0 h-px opacity-80"
            style={{ top: "50%", backgroundColor: C.blue }}
          />
        </div>
        <span className="text-xs absolute bottom-4" style={{ color: "rgba(255,255,255,0.4)" }}>
          Placez le QR code dans le cadre
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <PrimaryButton onClick={() => { void handleSimulate(); }}>
          <Check size={14} />
          {scanLoading ? 'Ouverture...' : 'Simuler la lecture (DEC-00487)'}
        </PrimaryButton>
        <button
          onClick={() => go(0)}
          className="h-11 px-6 text-sm font-semibold rounded-xl transition-opacity opacity-60 hover:opacity-100"
          style={{ color: C.text }}
        >
          Annuler
        </button>
      </div>
      {scanError && (
        <p className="text-xs mt-2" style={{ color: C.red }}>{scanError}</p>
      )}
    </PageShell>
  );
}

// ─── Screen 3 — Dossier client ────────────────────────────────────────────────

function Screen3({ go }: { go: (s: ScreenId) => void }) {
  const [tab, setTab] = useState<"client" | "prediag" | "photos">("client");
  const [caseData, setCaseData] = useState<BuybackCase | null>(getCurrentCase());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeCurrentCase((c) => setCaseData(c));
    // try to fetch if no caseData
    if (!caseData) {
      const defaultNumber = 'DEC-00487';
      void diagApi.getCase(defaultNumber).then((c) => setCurrentCase(c as BuybackCase)).catch(() => {});
    }
    return unsub;
  }, []);
  const tabs = [
    { key: "client", label: "Client" },
    { key: "prediag", label: "Pré-diagnostic" },
    { key: "photos", label: "Photos" },
  ] as const;

  return (
    <PageShell title={`Dossier ${caseData?.caseNumber ?? 'DEC-00487'}`} onBack={() => go(0)} backLabel="Accueil">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="py-4 text-center">
          <p className="text-3xl font-bold" style={{ color: C.blue }}>{formatScore(caseData?.customerScore)}</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Score client</p>
        </Card>
        <Card className="py-4 text-center">
          <p className="text-3xl font-bold" style={{ color: C.green }}>{formatPrice(caseData?.onlineEstimate)}</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Estimation ligne</p>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: C.text }}>{caseData ? `${caseData.customer.firstName} ${caseData.customer.lastName}` : 'Marie Dupont'}</span>
        <StatusBadge status={(caseData?.status ?? 'pending') as any} />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ backgroundColor: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab ${tab === t.key ? 'tab--active' : ''}`} 
            style={tab === t.key ? { color: '#fff' } : { color: C.textMuted }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "client" && (
        <>
          <Card className="p-4">
            <InfoField label="Nom" value={caseData ? `${caseData.customer.firstName} ${caseData.customer.lastName}` : 'Marie Dupont'} />
            <InfoField label="Téléphone" value={caseData?.customer.phone ?? '06 12 34 56 78'} />
            <InfoField label="Email" value={caseData?.customer.email ?? 'marie.dupont@email.fr'} />
            <InfoField label="Modèle déclaré" value={caseData ? `${caseData.item.brand} ${caseData.item.model}` : "B'Twin Rockrider 520"} />
            <InfoField label="Année" value={caseData?.item.year ? String(caseData.item.year) : '2019'} />
            <InfoField label="Km déclarés" value={caseData?.item.declaredKm ? `~${caseData.item.declaredKm} km` : '~2 500 km'} />
          </Card>
          <InfoBox color="blue">
            Vérifier le modèle et l'année avant de démarrer — le client a pu se tromper.
          </InfoBox>
          <PrimaryButton onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const number = caseData?.caseNumber ?? 'DEC-00487';
              await diagApi.startDiagnosis(number);
              const updated = await diagApi.getCase(number);
              setCurrentCase(updated as BuybackCase);
              go(3);
            } catch (err: any) {
              setError(err?.message ?? 'Erreur démarrage diagnostic');
            } finally {
              setLoading(false);
            }
          }}>{loading ? 'Ouverture...' : 'Démarrer le diagnostic'}</PrimaryButton>
          {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
        </>
      )}

      {tab === "prediag" && (
        (() => {
          const pre = caseData?.preDiagnostic;
          if (!pre) {
            return (
              <Card className="p-4">
                <p className="text-sm mb-3" style={{ color: C.textMuted }}>
                  Aucun pré-diagnostic client n'est disponible pour ce dossier.
                </p>
                <PrimaryButton onClick={async () => {
                  setLoading(true);
                  try {
                    const number = caseData?.caseNumber ?? 'DEC-00487';
                    await diagApi.startDiagnosis(number);
                    const updated = await diagApi.getCase(number);
                    setCurrentCase(updated as BuybackCase);
                    go(3);
                  } catch (err: any) {
                    // ignore here, Screen3 will show errors
                  } finally {
                    setLoading(false);
                  }
                }}>Continuer avec un diagnostic magasin</PrimaryButton>
              </Card>
            );
          }

          return (
            <>
              <Card className="p-4">
                <p className="text-xs mb-3" style={{ color: C.textMuted }}>
                  Informations déclarées par le client lors de l'estimation en ligne. À vérifier pendant le diagnostic magasin.
                </p>
                <InfoField label="État général" value={formatPreDiagnosticValue(pre.generalState as any)} />
                <InfoField label="Cadre" value={formatPreDiagnosticValue(pre.frame as any)} />
                <InfoField label="Freins" value={formatPreDiagnosticValue(pre.brakes as any)} />
                <InfoField label="Transmission" value={formatPreDiagnosticValue(pre.transmission as any)} />
                <InfoField label="Roues" value={formatPreDiagnosticValue(pre.wheels as any)} />
                <div className="mt-3">
                  <InfoField label="Score client" value={`${formatScore(caseData?.customerScore)} / 100`} />
                  <InfoField label="Estimation ligne" value={formatPrice(caseData?.onlineEstimate)} />
                </div>
              </Card>
            </>
          );
        })()
      )}

      {tab === "photos" && (
        (() => {
          const photos = caseData?.preDiagnostic?.photos ?? [];
          if (!photos || photos.length === 0) {
            return (
              <Card className="p-4">
                <p className="text-sm mb-2" style={{ color: C.textMuted }}>Aucune photo client fournie.</p>
                <p className="text-xs" style={{ color: C.textMuted }}>Les photos permettent d'objectiver l'état déclaré, mais ne remplacent pas le contrôle magasin.</p>
              </Card>
            );
          }
          return (
            <div className="flex flex-col gap-3">
              <p className="text-xs" style={{ color: C.textMuted }}>{photos.length} photo{photos.length > 1 ? 's' : ''} fournies par le client</p>
              <div className="flex gap-3">
                {photos.map((p, i) => (
                  <PhotoPlaceholder key={p || i} label={`Photo ${i + 1}`} />
                ))}
              </div>
              <p className="text-xs" style={{ color: C.textMuted }}>Ces images sont fournies par le client et doivent être vérifiées lors du diagnostic magasin.</p>
            </div>
          );
        })()
      )}
    </PageShell>
  );
}

// ─── Screen 4 — Identification ────────────────────────────────────────────────

function Screen4({ go }: { go: (s: ScreenId) => void }) {
  const [etat, setEtat] = useState("");
  const [serial, setSerial] = useState<string>(getCurrentCase()?.item.serialNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serialError, setSerialError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  // formatted display value (FR thousands and optional decimals)
  function formatNumberForDisplay(n: number) {
    if (!isFinite(n)) return '';
    const s = String(n);
    const hasDecimals = Math.abs(n - Math.trunc(n)) > 0;
    const fracDigits = hasDecimals ? Math.min(2, (s.split('.')[1] || '').length) : 0;
    return n.toLocaleString('fr-FR', { minimumFractionDigits: fracDigits, maximumFractionDigits: fracDigits });
  }

  const initialPrice = (() => {
    const c = getCurrentCase();
    const v = c?.item?.estimatedBasePrice ?? c?.onlineEstimate ?? '';
    return typeof v === 'number' ? formatNumberForDisplay(v) : '';
  })();
  const [estimatedBasePriceInput, setEstimatedBasePriceInput] = useState<string>(initialPrice);

  useEffect(() => {
    const c = getCurrentCase();
    if (c && typeof c.item?.estimatedBasePrice !== 'undefined' && c.item?.estimatedBasePrice !== null) {
      setEstimatedBasePriceInput(formatNumberForDisplay(c.item.estimatedBasePrice));
    } else if (c && typeof c.onlineEstimate !== 'undefined' && c.onlineEstimate !== null) {
      setEstimatedBasePriceInput(formatNumberForDisplay(c.onlineEstimate));
    } else {
      setEstimatedBasePriceInput('');
    }
    const unsub = subscribeCurrentCase((nc) => {
      if (nc && typeof nc.item?.estimatedBasePrice !== 'undefined' && nc.item?.estimatedBasePrice !== null) {
        setEstimatedBasePriceInput(formatNumberForDisplay(nc.item.estimatedBasePrice));
      } else if (nc && typeof nc.onlineEstimate !== 'undefined' && nc.onlineEstimate !== null) {
        setEstimatedBasePriceInput(formatNumberForDisplay(nc.onlineEstimate));
      } else {
        setEstimatedBasePriceInput('');
      }
    });
    return unsub;
  }, []);

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.currentTarget.value || '';
    // keep digits and separators, unify to comma for display
    const allowed = raw.replace(/[^\d,\.]/g, '');
    const withComma = allowed.replace(/\./g, ',');
    const parts = withComma.split(',');
    const intPart = (parts[0] || '').replace(/\s/g, '');
    const decPart = parts.slice(1).join('');
    const formattedInt = intPart ? Number(intPart).toLocaleString('fr-FR') : (decPart ? '0' : '');
    const formatted = decPart ? `${formattedInt},${decPart}` : formattedInt;
    setEstimatedBasePriceInput(formatted);
    setPriceError(null);
    setError(null);
  }
  return (
    <PageShell title="Vérification du vélo" subtitle="Étape 0 / 5 — Identification" onBack={() => go(2)} backLabel="Dossier">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Identification du vélo</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>
          Client a déclaré : B'Twin Rockrider 520, 2019. Vérifier et corriger si nécessaire.
        </p>
        <SectionLabel>CONFIRMER / CORRIGER LE MODÈLE</SectionLabel>
        <InfoField label="Catégorie de vélo" value={getCurrentCase()?.item.category ?? 'VTT'} />
        <InfoField label="Marque" value={getCurrentCase()?.item.brand ?? "B'Twin"} />
        <InfoField label="Modèle exact" value={getCurrentCase()?.item.model ?? 'Rockrider 520'} />
        <InfoField label="Année" value={String(getCurrentCase()?.item.year ?? '2019')} />
        <div
          className="flex flex-col py-2.5 border-b last:border-0"
          style={{ borderColor: C.border }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: C.textMuted }}>Numéro de série</span>
            <input
              value={serial}
              onChange={(e) => { setSerial(e.currentTarget.value); setSerialError(null); setError(null); }}
              placeholder="Ex: 1234567890"
              className="text-xs font-semibold w-40 text-right"
              style={{
                border: serialError ? `1.5px solid ${C.red}` : 0,
                background: serialError ? 'rgba(185,28,28,0.04)' : 'transparent',
                color: C.text,
                padding: '6px 8px',
                borderRadius: 8,
                textAlign: 'right'
              }}
            />
          </div>
          {serialError && <p className="text-xs mt-1" style={{ color: C.red }}>{serialError}</p>}
        </div>

        <div
          className="flex flex-col py-2.5 border-b last:border-0"
          style={{ borderColor: C.border }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: C.textMuted }}>Prix estimé (€)</span>
            <div className="currency-input" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <input
                inputMode="decimal"
                pattern="[0-9,\.]*"
                value={estimatedBasePriceInput}
                onChange={handlePriceChange}
                placeholder="Ex: 120"
                className="text-xs font-semibold w-40 text-right"
                style={{
                  border: priceError ? `1.5px solid ${C.red}` : 0,
                  background: priceError ? 'rgba(185,28,28,0.04)' : 'transparent',
                  color: C.text,
                  padding: '6px 8px',
                  borderRadius: 8,
                  textAlign: 'right'
                }}
              />
              <span className="currency-suffix" aria-hidden style={{ marginLeft: 8, fontWeight: 700 }}>{'€'}</span>
            </div>
          </div>
          {priceError && <p className="text-xs mt-1" style={{ color: C.red }}>{priceError}</p>}
        </div>
        <InfoField label="Taille cadre" value={getCurrentCase()?.item.frameSize ?? 'M'} />
      </Card>

      <div>
        <SectionLabel>PHOTOS D'IDENTIFICATION</SectionLabel>
        <div className="flex gap-3">
          <PhotoPlaceholder label="Plaque modèle" />
          <PhotoPlaceholder label="Numéro série" />
        </div>
      </div>

      <Card className="p-4">
        <SectionLabel>ÉTAT GÉNÉRAL AU PREMIER REGARD</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {["Excellent", "Bon état", "Moyen", "Mauvais"].map((opt) => (
            <ChoiceChip key={opt} label={opt} selected={etat === opt} onClick={() => setEtat(opt)} />
          ))}
        </div>
      </Card>

      <PrimaryButton onClick={async () => {
        setSaving(true);
        setError(null);
        setSerialError(null);
        try {
          const current = getCurrentCase();
          const number = current?.caseNumber ?? 'DEC-00487';
          const estFromInput = estimatedBasePriceInput && estimatedBasePriceInput !== ''
            ? Number(String(estimatedBasePriceInput).replace(/\D/g, ''))
            : (current?.item?.estimatedBasePrice ?? current?.onlineEstimate ?? undefined);

          if (!estFromInput || estFromInput <= 0) {
            setPriceError('Prix estimé doit être supérieur à 0');
            return;
          }

          const payload = {
            articleType: current?.item.articleType ?? 'bike',
            category: current?.item.category ?? 'vtt',
            brand: current?.item.brand ?? 'Rockrider',
            model: current?.item.model ?? 'Rockrider 520',
            year: current?.item.year ?? 2019,
            frameSize: current?.item.frameSize ?? 'M',
            serialNumber: serial,
            estimatedBasePrice: estFromInput,
            firstLookState: etat || 'good'
          };
          await diagApi.saveIdentification(number, payload);
          const updated = await diagApi.getCase(number);
          setCurrentCase(updated as BuybackCase);
          go(4);
        } catch (err: any) {
          const msg = err?.payload?.message ?? err?.message ?? 'Erreur lors de l\'identification';
          if (/num[eé]ro.*s[ée]rie|10 chiffres/i.test(String(msg))) {
            setSerialError(msg);
          } else {
            setError(msg);
          }
        } finally {
          setSaving(false);
        }
      }}>{saving ? 'Enregistrement...' : 'Cadre & fourche →'}</PrimaryButton>
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 5 — Cadre & fourche ───────────────────────────────────────────────

function Screen5({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    try {
      const current = getCurrentCase();
      const number = current?.caseNumber ?? 'DEC-00487';
      const payload = {
        generalCondition: ans.cond ?? 'good',
        impacts: ans.rayures ?? '',
        shockDeformation: ans.choc ?? 'no',
        fork: ans.fourche ?? 'functional',
        wear: ans.jeu ?? 'good'
      };
      await diagApi.saveFrameFork(number, payload);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(5);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell title="Cadre & fourche" subtitle="Étape 1 / 5" onBack={() => go(3)} backLabel="Identification">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Cadre & fourche · pondération 30%</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Client : aucun choc visible. Vérifier physiquement.</p>
        <SectionLabel>ÉTAT DU CADRE 30%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="Condition générale" options={["Excellent", "Acceptable"]} selected={ans.cond} onSelect={(v) => set("cond", v)} />
          <QuestionChips question="Rayures / impacts" options={["Aucune", "Légères", "Importantes", "Rouille"]} selected={ans.rayures} onSelect={(v) => set("rayures", v)} />
          <QuestionChips question="Choc / déformation → BLOQUANT" options={["Non", "Oui — bloquant"]} selected={ans.choc} onSelect={(v) => set("choc", v)} dangerOption="Oui — bloquant" />
          <QuestionChips question="Fourche" options={["Fonctionnelle", "Hors service"]} selected={ans.fourche} onSelect={(v) => set("fourche", v)} />
          <QuestionChips question="Jeu / usure" options={["Bon", "Mauvais"]} selected={ans.jeu} onSelect={(v) => set("jeu", v)} />
        </div>
      </Card>
      <div>
        <SectionLabel>PHOTOS DU CADRE</SectionLabel>
        <div className="flex gap-3">
          <PhotoPlaceholder label="Vue globale" />
          <PhotoPlaceholder label="Zone critique" />
        </div>
      </div>
      <NavButton onPrev={() => go(3)} prevLabel="Identification" onNext={() => { void handleNext(); }} nextLabel={saving ? 'Sauvegarde...' : 'Freins'} />
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 6 — Freins ────────────────────────────────────────────────────────

function Screen6({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    try {
      const current = getCurrentCase();
      const number = current?.caseNumber ?? 'DEC-00487';
      const payload = {
        type: 'v_brake_pads',
        frontEfficiency: ans.av ?? 'correct',
        rearEfficiency: ans.ar ?? 'correct',
        padsWear: ans.usure ?? 'replace'
      };
      await diagApi.saveBrakes(number, payload);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(6);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell title="Freins" subtitle="Étape 2 / 5" onBack={() => go(4)} backLabel="Cadre">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Freins · pondération 25%</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Client : freins fonctionnels. À confirmer.</p>
        <SectionLabel>FREINS 25%</SectionLabel>
        <div className="mt-2">
          <div className="mb-4">
              <InfoField label="Type" value="V-brake / patins" />
          </div>
          <QuestionChips question="Efficacité avant" options={["Correct", "Faible", "Inefficace"]} selected={ans.av} onSelect={(v) => set("av", v)} />
          <QuestionChips question="Efficacité arrière" options={["Correct", "Faible", "Inefficace"]} selected={ans.ar} onSelect={(v) => set("ar", v)} />
          <QuestionChips question="Usure patins / plaquettes" options={["Bonne épaisseur", "Usure normale", "À changer"]} selected={ans.usure} onSelect={(v) => set("usure", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(4)} prevLabel="Cadre" onNext={() => { void handleNext(); }} nextLabel={saving ? 'Sauvegarde...' : 'Transmission'} />
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 7 — Transmission ──────────────────────────────────────────────────

function Screen7({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    try {
      const current = getCurrentCase();
      const number = current?.caseNumber ?? 'DEC-00487';
      const payload = {
        chain: ans.chaine ?? 'dry',
        derailleur: ans.derailleur ?? 'medium',
        bottomBracket: ans.pedalier ?? 'good'
      };
      await diagApi.saveTransmission(number, payload);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(7);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell title="Transmission" subtitle="Étape 3 / 5" onBack={() => go(5)} backLabel="Freins">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Transmission · pondération 25%</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Client : petites difficultés de transmission. Vérifier dérailleur.</p>
        <InfoBox color="blue">
          Vérifier le passage des vitesses et l'état de la chaîne.
        </InfoBox>
        <SectionLabel>TRANSMISSION 25%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="Chaîne" options={["Propre / huilée", "Sale / sèche", "Étirée"]} selected={ans.chaine} onSelect={(v) => set("chaine", v)} />
          <QuestionChips question="Dérailleur" options={["Parfait", "Passage difficile", "Bloqué"]} selected={ans.derailleur} onSelect={(v) => set("derailleur", v)} />
          <QuestionChips question="Pédalier / boîtier" options={["OK", "Jeu / bruit", "HS"]} selected={ans.pedalier} onSelect={(v) => set("pedalier", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(5)} prevLabel="Freins" onNext={() => { void handleNext(); }} nextLabel={saving ? 'Sauvegarde...' : 'Roues'} />
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 8 — Roues & pneus ─────────────────────────────────────────────────

function Screen8({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    try {
      const current = getCurrentCase();
      const number = current?.caseNumber ?? 'DEC-00487';
      const payload = {
        rims: ans.jantes ?? 'medium',
        tires: ans.pneus ?? 'good',
        hubs: ans.roulements ?? 'fluid'
      };
      await diagApi.saveWheelsTires(number, payload);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(8);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell title="Roues & pneus" subtitle="Étape 4 / 5" onBack={() => go(6)} backLabel="Transmission">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Roues & pneus · pondération 10%</p>
        <InfoBox color="blue">Vérifier l'absence de voilage et l'état des pneus.</InfoBox>
        <SectionLabel>ROUES & PNEUS 10%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="État des jantes" options={["Droites", "Léger voilage", "Voilage important"]} selected={ans.jantes} onSelect={(v) => set("jantes", v)} />
          <QuestionChips question="Pneus" options={["Bonne gomme", "Usure normale", "À changer"]} selected={ans.pneus} onSelect={(v) => set("pneus", v)} />
          <QuestionChips question="Roulements de moyeux" options={["Fluides", "Jeu perceptible", "Durs"]} selected={ans.roulements} onSelect={(v) => set("roulements", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(6)} prevLabel="Transmission" onNext={() => { void handleNext(); }} nextLabel={saving ? 'Sauvegarde...' : 'Finitions'} />
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 9 — Finitions ─────────────────────────────────────────────────────

function Screen9({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setSaving(true);
    setError(null);
    try {
      const current = getCurrentCase();
      const number = current?.caseNumber ?? 'DEC-00487';
      const payload = {
        saddle: ans.selle ?? 'good',
        handlebarDirection: ans.guidon ?? 'good',
        cleanliness: ans.proprete ?? 'cleaning_needed',
        observations: ''
      };
      await diagApi.saveFinishing(number, payload);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(9);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };
  return (
    <PageShell title="Finitions" subtitle="Étape 5 / 5" onBack={() => go(7)} backLabel="Roues">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Finitions · pondération 10%</p>
        <InfoBox color="blue">Vérifier selle, guidon et propreté générale.</InfoBox>
        <SectionLabel>FINITIONS 10%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="Selle" options={["Bon état", "Usée", "Déchirée"]} selected={ans.selle} onSelect={(v) => set("selle", v)} />
          <QuestionChips question="Guidon / direction" options={["Stable", "Jeu", "HS"]} selected={ans.guidon} onSelect={(v) => set("guidon", v)} />
          <QuestionChips question="Propreté" options={["Propre", "Nécessite nettoyage", "Très sale"]} selected={ans.proprete} onSelect={(v) => set("proprete", v)} />
        </div>
        <div className="mt-2">
          <p className="text-xs font-semibold mb-2" style={{ color: C.text }}>Observations</p>
          <textarea
            placeholder="Notes libres…"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border text-xs resize-none outline-none transition-colors textarea"
            style={{ borderColor: C.border, color: C.text, backgroundColor: C.bgPage }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>
      </Card>
      <PrimaryButton onClick={() => { void handleNext(); }}>{saving ? 'Sauvegarde...' : 'Voir le scoring'}</PrimaryButton>
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 10 — Synthèse ─────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Cadre", weight: "30%", score: 85, client: "Bon", tech: "Bon", ecart: "= OK", positive: true },
  { name: "Freins", weight: "25%", score: 60, client: "OK", tech: "Usés", ecart: "↓ -10", positive: false },
  { name: "Transmission", weight: "25%", score: 55, client: "Diff.", tech: "Diff.", ecart: "= OK", positive: true },
  { name: "Roues", weight: "10%", score: 70, client: "OK", tech: "Voilage", ecart: "↓ -5", positive: false },
  { name: "Finitions", weight: "10%", score: 68, client: "Bon", tech: "Sale", ecart: "↓ -6", positive: false },
];

function Screen10({ go }: { go: (s: ScreenId) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const caseData = getCurrentCase();

  const handleGenerateDecision = async () => {
    setLoading(true);
    setError(null);
    try {
      const number = caseData?.caseNumber ?? 'DEC-00487';
      await diagApi.calculateScore(number);
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(10);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur génération scoring');
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageShell title="Synthèse diagnostic" subtitle="Marie Dupont · VTT Rockrider 520" onBack={() => go(8)} backLabel="Finitions">
      <div className="grid grid-cols-2 gap-3">
        <Card className="py-5 text-center">
          <p className="text-4xl font-bold" style={{ color: C.textMuted }}>72</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Score client</p>
        </Card>
        <Card className="py-5 text-center">
          <p className="text-4xl font-bold" style={{ color: C.blue }}>61</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Score technicien</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4 pb-1">
          <SectionLabel>COMPARAISON CLIENT / TECHNICIEN</SectionLabel>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Critère", "Client", "Tech", "Écart"].map((h, i) => (
                <th
                  key={h}
                  className={`text-[10px] font-bold uppercase tracking-wide pb-2 ${i === 0 ? "text-left px-4" : i === 3 ? "text-right px-4" : "text-center px-2"}`}
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c, i) => (
              <tr key={c.name} style={i < CATEGORIES.length - 1 ? { borderBottom: `1px solid ${C.border}` } : {}}>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: C.text }}>{c.name}</td>
                <td className="px-2 py-3 text-xs text-center" style={{ color: C.textMuted }}>{c.client}</td>
                <td className="px-2 py-3 text-xs text-center" style={{ color: C.textMuted }}>{c.tech}</td>
                <td className="px-4 py-3 text-xs text-right font-bold" style={{ color: c.positive ? C.textMuted : C.red }}>
                  {c.ecart}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <SectionLabel>SCORES PAR CATÉGORIE</SectionLabel>
        <div className="flex flex-col gap-3 mt-2">
          {CATEGORIES.map((c) => (
            <div key={c.name}>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs" style={{ color: C.text }}>
                  {c.name} <span style={{ color: C.textMuted }}>({c.weight})</span>
                </span>
                <span className="text-xs font-bold" style={{ color: C.text }}>{c.score}</span>
              </div>
              <ProgressBar value={c.score} />
            </div>
          ))}
        </div>
      </Card>

      <InfoBox color="orange">
        Écart de 32% vs estimation client. Expliquer les frais de patins, nettoyage, réglage.
      </InfoBox>

      <PrimaryButton onClick={() => { void handleGenerateDecision(); }}>{loading ? 'Génération...' : 'Générer la décision'}</PrimaryButton>
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 11 — Décision ─────────────────────────────────────────────────────

const PRICE_LINES = [
  { label: "Valeur vélo base", amount: "+95 €", positive: true },
  { label: "Remplacement patins", amount: "-12 €", positive: false },
  { label: "Nettoyage complet", amount: "-8 €", positive: false },
  { label: "Réglage dérailleur", amount: "-10 €", positive: false },
  { label: "Marge reconditionnement", amount: "-7 €", positive: false },
];

function Screen11({ go }: { go: (s: ScreenId) => void }) {
  const caseData = getCurrentCase();
  const score = caseData?.scoring;
  const technicianScore = score?.technicianScore ?? 61;
  const decisionStatus = score?.decision ?? 'conditional';
  const initialOffer = caseData?.finalOffer ?? score?.finalOffer ?? 58;
  const [adjustedOffer, setAdjustedOffer] = useState<string>(String(initialOffer));
  const [adjustReason, setAdjustReason] = useState<string>('Aucun ajustement');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayOffer = (() => {
    const parsed = Number(String(adjustedOffer).replace(',', '.'));
    return Number.isFinite(parsed) && !isNaN(parsed) ? parsed : initialOffer;
  })();

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const number = caseData?.caseNumber ?? 'DEC-00487';
      const parsed = Number(String(adjustedOffer).replace(/[^0-9,.-]/g, '').replace(',', '.'));
      const parsedOffer = Number.isFinite(parsed) && !isNaN(parsed) ? parsed : initialOffer;
      const manual = parsedOffer !== initialOffer;
      await diagApi.acceptDecision(number, { finalOffer: parsedOffer, manualAdjustment: manual, adjustmentReason: manual ? adjustReason : null });
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(11);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur acceptation');
    } finally {
      setLoading(false);
    }
  };

  const handleRefuse = async () => {
    setLoading(true);
    setError(null);
    try {
      const number = caseData?.caseNumber ?? 'DEC-00487';
      const reasons = score?.blockingReasons && score.blockingReasons.length ? score.blockingReasons : ['Reprise refusée après diagnostic'];
      await diagApi.refuseDecision(number, { reasons, alternatives: ['Réparation atelier', 'Recyclage gratuit'] });
      const updated = await diagApi.getCase(number);
      setCurrentCase(updated as BuybackCase);
      go(12);
    } catch (err: any) {
      setError(err?.message ?? 'Erreur refus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Décision de reprise" onBack={() => go(9)} backLabel="Synthèse">
      {/* Score + offre */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs mb-2" style={{ color: C.textMuted }}>Score technicien {technicianScore}/100</p>
            <StatusBadge status={decisionStatus as any} />
            <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>{decisionStatus === 'accepted' ? 'Reprise acceptée' : decisionStatus === 'refused' ? 'Reprise refusée' : 'Remise en état nécessaire'}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold" style={{ color: C.text, letterSpacing: "-0.02em" }}>{displayOffer} €</p>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: C.textMuted }}>offre de reprise</p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-x-6 gap-y-1 mt-4 pt-4 border-t text-xs"
          style={{ borderColor: C.border }}
        >
          <span style={{ color: C.textMuted }}>
            Estimation client : <span className="line-through">85 €</span>
          </span>
          <span className="font-bold" style={{ color: C.blue }}>Offre finale : 58 €</span>
        </div>
      </Card>

      {/* Détail prix */}
      <Card className="p-4">
        <SectionLabel>DÉTAIL FRAIS REMISE EN ÉTAT</SectionLabel>
        <div className="mt-2">
          {PRICE_LINES.map((l) => (
            <div
              key={l.label}
              className="flex justify-between py-2.5 border-b last:border-0"
              style={{ borderColor: C.border }}
            >
              <span className="text-xs" style={{ color: C.textMuted }}>{l.label}</span>
              <span className="text-xs font-semibold" style={{ color: l.positive ? C.text : C.red }}>
                {l.amount}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1">
            <span className="text-xs font-bold" style={{ color: C.text }}>Offre nette</span>
            <span className="text-xs font-bold" style={{ color: C.blue }}>{displayOffer} €</span>
          </div>
        </div>
      </Card>

      {/* Ajustement */}
      <Card className="p-4">
        <SectionLabel>AJUSTER L'OFFRE</SectionLabel>
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <p className="text-xs mb-1" style={{ color: C.textMuted }}>Prix de reprise (€) · fourchette 45–70 €</p>
            <input
              type="number"
              value={adjustedOffer}
              onChange={(e) => setAdjustedOffer(e.currentTarget.value)}
              className="w-full sm:w-40 h-10 px-3 border rounded-xl text-sm font-bold outline-none transition-colors"
              style={{ borderColor: C.border, color: C.text }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: C.textMuted }}>Motif d'ajustement</p>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.currentTarget.value)}
              className="w-full h-10 px-3 border rounded-xl text-xs outline-none transition-colors"
              style={{ borderColor: C.border, color: C.text }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div style={{ flex: 1 }}>
          <SecondaryButton onClick={() => { void handleRefuse(); }} style={{ borderColor: C.red, backgroundColor: C.redLight, color: C.red }}>
            ✕ Refuser
          </SecondaryButton>
        </div>
        <div style={{ flex: 1 }}>
          <PrimaryButton onClick={() => { void handleAccept(); }} style={{ backgroundColor: C.green }}>
            {loading ? 'En cours...' : `✓ Valider ${displayOffer} €`}
          </PrimaryButton>
        </div>
      </div>
      {error && <p className="text-xs mt-2" style={{ color: C.red }}>{error}</p>}
    </PageShell>
  );
}

// ─── Screen 12 — Acceptée ─────────────────────────────────────────────────────

const QR_PATTERN = [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1];

function Screen12({ go }: { go: (s: ScreenId) => void }) {
  const caseData = getCurrentCase();
  const finalOffer = caseData?.finalOffer ?? caseData?.scoring?.finalOffer ?? 58;
  return (
    <PageShell title="Reprise acceptée" subtitle="Bon d'achat à remettre au client">
      <div className="flex flex-col items-center py-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: C.greenLight }}
        >
          <Check size={28} strokeWidth={2.5} style={{ color: C.green }} />
        </div>
        <p className="text-lg font-bold" style={{ color: C.green }}>Reprise acceptée !</p>
        <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Vélo accepté en programme Seconde Vie</p>
      </div>

      <Card className="p-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-4" style={{ color: C.textMuted }}>
          QR CODE CAISSE — SCANNER EN CAISSE
        </p>
        <div className="w-32 h-32 mx-auto rounded-xl border p-3 grid grid-cols-5 gap-0.5" style={{ borderColor: C.border }}>
          {QR_PATTERN.map((on, i) => (
            <div key={i} className="rounded-sm" style={{ backgroundColor: on ? C.navy : C.bgPage }} />
          ))}
        </div>
        <p className="text-5xl font-bold mt-4" style={{ color: C.text, letterSpacing: "-0.02em" }}>{finalOffer} €</p>
        <p className="text-xs mt-2 max-w-xs mx-auto" style={{ color: C.textMuted }}>
          Le client présente ce QR code en caisse pour récupérer son bon d'achat de 58 €
        </p>
      </Card>

      <Card className="p-4">
        <InfoField label="Client" value={caseData ? `${caseData.customer.firstName} ${caseData.customer.lastName}` : 'Marie Dupont'} />
        <InfoField label="Vélo" value={caseData ? `${caseData.item.brand} ${caseData.item.model}` : 'VTT Rockrider 520'} />
        <InfoField label="Dossier" value={caseData?.caseNumber ?? 'DEC-00487'} />
        <InfoField label="Date" value={new Date().toLocaleDateString()} />
        <InfoField label="Bon d'achat" value={`${finalOffer} €`} />
      </Card>

      <div className="flex gap-3">
        {([{ Icon: Printer, label: "Imprimer" }, { Icon: Mail, label: "Email" }, { Icon: MessageSquare, label: "SMS" }] as const).map(
          ({ Icon, label }) => (
            <button
              key={label}
              className="flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-gray-50"
              style={{ borderColor: C.border, backgroundColor: C.card, color: C.textMuted }}
            >
              <Icon size={15} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          )
        )}
      </div>

      <p className="text-xs text-center" style={{ color: C.textMuted }}>
        Email automatiquement envoyé à marie.dupont@email.fr
      </p>

      <PrimaryButton onClick={() => go(0)}>⌂ Nouveau dossier</PrimaryButton>
    </PageShell>
  );
}

// ─── Screen 13 — Refusée ──────────────────────────────────────────────────────

function Screen13({ go }: { go: (s: ScreenId) => void }) {
  const caseData = getCurrentCase();
  const reasons = caseData?.refusalReasons ?? caseData?.scoring?.blockingReasons ?? ["Reprise refusée après diagnostic"];
  return (
    <PageShell title="Reprise refusée" subtitle="Communiquer les motifs">
      <div className="flex flex-col items-center py-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: C.redLight }}
        >
          <X size={26} strokeWidth={2.5} style={{ color: C.red }} />
        </div>
        <p className="text-lg font-bold" style={{ color: C.red }}>Reprise refusée</p>
        <p className="text-sm mt-0.5 text-center" style={{ color: C.textMuted }}>
          Le vélo ne remplit pas les critères Seconde Vie
        </p>
      </div>

      <Card className="p-4">
        <SectionLabel>MOTIFS COMMUNIQUÉS AU CLIENT</SectionLabel>
        <div className="flex flex-col gap-2 mt-2">
          {reasons.map((m) => (
            <div key={m} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: C.red }} />
              <p className="text-xs" style={{ color: C.text }}>{m}</p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <SectionLabel>ALTERNATIVES PROPOSÉES</SectionLabel>
        <div className="flex flex-col gap-2 mt-1">
          <Card className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
              style={{ backgroundColor: C.blueLight }}
            >
              🔧
            </div>
            <p className="text-xs" style={{ color: C.text }}>
              Atelier Decathlon : réparation ~45 € puis revente possible
            </p>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
              style={{ backgroundColor: C.greenLight }}
            >
              ♻️
            </div>
            <p className="text-xs" style={{ color: C.text }}>Recyclage gratuit en magasin</p>
          </Card>
        </div>
      </div>

      <PrimaryButton onClick={() => go(0)}>⌂ Nouveau dossier</PrimaryButton>
    </PageShell>
  );
}

// ─── Navigation map ───────────────────────────────────────────────────────────

const SCREENS = [
  Screen1, Screen2, Screen3, Screen4, Screen5, Screen6, Screen7,
  Screen8, Screen9, Screen10, Screen11, Screen12, Screen13,
];

const NAV_ITEMS = [
  { id: 0, group: "Accueil", label: "Accueil vendeur" },
  { id: 1, group: "Accueil", label: "Scanner QR code" },
  { id: 2, group: "Dossier", label: "Dossier client" },
  { id: 3, group: "Diagnostic", label: "0 — Identification" },
  { id: 4, group: "Diagnostic", label: "1 — Cadre & fourche" },
  { id: 5, group: "Diagnostic", label: "2 — Freins" },
  { id: 6, group: "Diagnostic", label: "3 — Transmission" },
  { id: 7, group: "Diagnostic", label: "4 — Roues & pneus" },
  { id: 8, group: "Diagnostic", label: "5 — Finitions" },
  { id: 9, group: "Résultat", label: "Synthèse" },
  { id: 10, group: "Résultat", label: "Décision de reprise" },
  { id: 11, group: "Résultat", label: "Reprise acceptée" },
  { id: 12, group: "Résultat", label: "Reprise refusée" },
];

const NAV_GROUPS = ["Accueil", "Dossier", "Diagnostic", "Résultat"];

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const Screen = SCREENS[screen];
  const go = (s: ScreenId) => {
    setScreen(s);
    setSidebarOpen(false);
  };

  return (
    <div className="mobile-shell">
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: C.bgPage, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top bar */}
      {/* <header
        className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-14"
        style={{ backgroundColor: C.navy }}
      > */}
      {/* borderColor: "rgba(255,255,255,0.06)" border-b */}
      {/* <div className="flex items-center gap-3"> */}
      {/* <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button> */}
      {/* <span className="text-white font-bold text-sm tracking-[0.1em] uppercase">
            DECATHLON · Seconde Vie
          </span>
        </div> */}
      {/* <div className="flex items-center gap-2"> */}
      {/* <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: C.blue }}
          >
            JM
          </div> */}
      {/* <span className="hidden sm:block text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Julien M.
          </span> */}
      {/* </div> */}
      {/* </header> */}

      {/* <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}> */}

        {/* Sidebar overlay (mobile) */}
        {/* {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )} */}

        {/* Sidebar */}
        {/* <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30 lg:z-auto
            flex flex-col flex-shrink-0 overflow-y-auto
            transition-transform lg:transition-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
          style={{
            width: 220,
            backgroundColor: C.navy,
            borderRight: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 16,
          }}
        >
          {NAV_GROUPS.map((group) => (
            <div key={group} className="mb-4">
              <p
                className="px-4 text-[9px] font-bold tracking-[0.15em] uppercase mb-1"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {group}
              </p>
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id as ScreenId)}
                    className="w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2"
                    style={{
                      color: active ? "#fff" : "rgba(255,255,255,0.5)",
                      backgroundColor: active ? "rgba(26,46,255,0.35)" : "transparent",
                      borderLeft: active ? `2px solid ${C.blue}` : "2px solid transparent",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </aside> */}

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Screen go={go} />
        </main>
      </div>
    </div>
  );
}
