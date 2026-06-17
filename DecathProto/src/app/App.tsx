import { useState } from "react";
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

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  blue: "#1A2EFF",
  navy: "#060D2E",
  bgPage: "#F5F5F5",
  card: "#FFFFFF",
  text: "#0B0D2E",
  textMuted: "#6B7280",
  border: "#E2E4EF",
  blueLight: "#ECEEFF",
  orange: "#FF6600",
  orangeLight: "#FFF0E6",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  red: "#DC2626",
  redLight: "#FEE2E2",
  amberLight: "#FEF3C7",
  amber: "#D97706",
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type ScreenId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type StatusType = "pending" | "accepted" | "refused" | "conditional";

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<StatusType, string> = {
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  conditional: "Reprise conditionnelle",
};

const STATUS_STYLE: Record<StatusType, React.CSSProperties> = {
  pending: { backgroundColor: C.amberLight, color: C.amber },
  accepted: { backgroundColor: C.greenLight, color: C.green },
  refused: { backgroundColor: C.redLight, color: C.red },
  conditional: { backgroundColor: C.orangeLight, color: C.orange },
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
      className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2"
      style={{ color: C.textMuted }}
    >
      {children}
    </p>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity active:opacity-80 w-full sm:w-auto"
      style={{ backgroundColor: C.blue, color: "#fff" }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-3 px-6 rounded-xl font-semibold text-sm w-full sm:w-auto transition-colors"
      style={{ border: `1.5px solid ${C.border}`, backgroundColor: C.card, color: C.text }}
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
  let style: React.CSSProperties;
  if (danger && selected) {
    style = { backgroundColor: C.redLight, borderColor: C.red, color: C.red };
  } else if (selected) {
    style = { backgroundColor: C.blueLight, borderColor: C.blue, color: C.blue };
  } else {
    style = { backgroundColor: C.bgPage, borderColor: C.border, color: C.textMuted };
  }
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
      style={style}
    >
      {label}
    </button>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl py-6 min-h-[90px]"
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
        <button
          onClick={onPrev}
          className="flex-1 py-3 px-5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          style={{ borderColor: C.border, backgroundColor: C.card, color: C.text }}
        >
          <ArrowLeft size={13} />
          {prevLabel}
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          className="flex-1 py-3 px-5 rounded-xl text-white text-xs font-semibold transition-opacity active:opacity-80"
          style={{ backgroundColor: C.blue }}
        >
          {nextLabel} →
        </button>
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
  return (
    <div className="flex flex-col h-full">
      {/* Contextual header stripe */}
      <div
        className="flex-shrink-0 px-6 pt-5 pb-4"
        style={{ backgroundColor: C.navy }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold mb-3 transition-opacity opacity-70 hover:opacity-100"
            style={{ color: "#fff" }}
          >
            <ArrowLeft size={13} />
            {backLabel ?? "Retour"}
          </button>
        )}
        <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: C.bgPage }}
      >
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

function Screen1({ go }: { go: (s: ScreenId) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 pt-5 pb-5" style={{ backgroundColor: C.navy }}>
        <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
          DECATHLON · Seconde Vie
        </p>
        <h1 className="text-2xl font-bold text-white">Diagnostic reprise</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Mode vendeur</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>
              <SecondaryButton>Nouveau sans pré-diagnostic</SecondaryButton>
            </div>
          </div>

          {/* Liste dossiers */}
          <div>
            <SectionLabel>DOSSIERS EN ATTENTE</SectionLabel>
            <Card>
              {DOSSIERS.map((d, i) => (
                <button
                  key={d.ref}
                  onClick={() => go(2)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${i < DOSSIERS.length - 1 ? "border-b" : ""}`}
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
        <PrimaryButton onClick={() => go(2)}>
          <Check size={14} />
          Simuler la lecture (DEC-00487)
        </PrimaryButton>
        <button
          onClick={() => go(0)}
          className="h-11 px-6 text-sm font-semibold rounded-xl transition-opacity opacity-60 hover:opacity-100"
          style={{ color: C.text }}
        >
          Annuler
        </button>
      </div>
    </PageShell>
  );
}

// ─── Screen 3 — Dossier client ────────────────────────────────────────────────

function Screen3({ go }: { go: (s: ScreenId) => void }) {
  const [tab, setTab] = useState<"client" | "prediag" | "photos">("client");
  const tabs = [
    { key: "client", label: "Client" },
    { key: "prediag", label: "Pré-diagnostic" },
    { key: "photos", label: "Photos" },
  ] as const;

  return (
    <PageShell title="Dossier DEC-00487" onBack={() => go(0)} backLabel="Accueil">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="py-4 text-center">
          <p className="text-3xl font-bold" style={{ color: C.blue }}>72</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Score client</p>
        </Card>
        <Card className="py-4 text-center">
          <p className="text-3xl font-bold" style={{ color: C.green }}>85 €</p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>Estimation ligne</p>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: C.text }}>Marie Dupont</span>
        <StatusBadge status="pending" />
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ backgroundColor: C.card, border: `1.5px solid ${C.border}` }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 h-9 rounded-lg text-xs font-bold transition-colors"
            style={tab === t.key ? { backgroundColor: C.blue, color: "#fff" } : { color: C.textMuted }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "client" && (
        <>
          <Card className="p-4">
            <InfoField label="Nom" value="Marie Dupont" />
            <InfoField label="Téléphone" value="06 12 34 56 78" />
            <InfoField label="Email" value="marie.dupont@email.fr" />
            <InfoField label="Modèle déclaré" value="B'Twin Rockrider 520" />
            <InfoField label="Année" value="2019" />
            <InfoField label="Km déclarés" value="~2 500 km" />
          </Card>
          <InfoBox color="blue">
            Vérifier le modèle et l'année avant de démarrer — le client a pu se tromper.
          </InfoBox>
          <PrimaryButton onClick={() => go(3)}>Démarrer le diagnostic</PrimaryButton>
        </>
      )}

      {tab === "prediag" && (
        <Card className="p-4">
          <p className="text-xs mb-3" style={{ color: C.textMuted }}>
            Pré-diagnostic renseigné par le client en ligne.
          </p>
          <InfoField label="État général" value="Bon état" />
          <InfoField label="Cadre" value="Aucun choc visible" />
          <InfoField label="Freins" value="Fonctionnels" />
          <InfoField label="Transmission" value="Petites difficultés" />
        </Card>
      )}

      {tab === "photos" && (
        <div className="flex gap-3">
          <PhotoPlaceholder label="Photo client 1" />
          <PhotoPlaceholder label="Photo client 2" />
        </div>
      )}
    </PageShell>
  );
}

// ─── Screen 4 — Identification ────────────────────────────────────────────────

function Screen4({ go }: { go: (s: ScreenId) => void }) {
  const [etat, setEtat] = useState("");
  return (
    <PageShell title="Vérification du vélo" subtitle="Étape 0 / 5 — Identification" onBack={() => go(2)} backLabel="Dossier">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Identification du vélo</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>
          Client a déclaré : B'Twin Rockrider 520, 2019. Vérifier et corriger si nécessaire.
        </p>
        <SectionLabel>CONFIRMER / CORRIGER LE MODÈLE</SectionLabel>
        <InfoField label="Catégorie de vélo" value="VTT" />
        <InfoField label="Marque" value="B'Twin" />
        <InfoField label="Modèle exact" value="Rockrider 520" />
        <InfoField label="Année" value="2019" />
        <InfoField label="Numéro de série" value="Sous le pédalier" />
        <InfoField label="Taille cadre" value="M" />
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

      <PrimaryButton onClick={() => go(4)}>Cadre & fourche →</PrimaryButton>
    </PageShell>
  );
}

// ─── Screen 5 — Cadre & fourche ───────────────────────────────────────────────

function Screen5({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
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
      <NavButton onPrev={() => go(3)} prevLabel="Identification" onNext={() => go(5)} nextLabel="Freins" />
    </PageShell>
  );
}

// ─── Screen 6 — Freins ────────────────────────────────────────────────────────

function Screen6({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  return (
    <PageShell title="Freins" subtitle="Étape 2 / 5" onBack={() => go(4)} backLabel="Cadre">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Freins · pondération 25%</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Client : freins fonctionnels. À confirmer.</p>
        <SectionLabel>FREINS 25%</SectionLabel>
        <div className="mt-2">
          <div className="mb-4">
            <p className="text-xs font-semibold mb-1" style={{ color: C.text }}>Type</p>
            <p className="text-xs" style={{ color: C.textMuted }}>V-brake / patins</p>
          </div>
          <QuestionChips question="Efficacité avant" options={["Correct", "Faible", "Inefficace"]} selected={ans.av} onSelect={(v) => set("av", v)} />
          <QuestionChips question="Efficacité arrière" options={["Correct", "Faible", "Inefficace"]} selected={ans.ar} onSelect={(v) => set("ar", v)} />
          <QuestionChips question="Usure patins / plaquettes" options={["Bonne épaisseur", "Usure normale", "À changer"]} selected={ans.usure} onSelect={(v) => set("usure", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(4)} prevLabel="Cadre" onNext={() => go(6)} nextLabel="Transmission" />
    </PageShell>
  );
}

// ─── Screen 7 — Transmission ──────────────────────────────────────────────────

function Screen7({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  return (
    <PageShell title="Transmission" subtitle="Étape 3 / 5" onBack={() => go(5)} backLabel="Freins">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Transmission · pondération 25%</p>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>Client : petites difficultés de transmission. Vérifier dérailleur.</p>
        <SectionLabel>TRANSMISSION 25%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="Chaîne" options={["Propre / huilée", "Sale / sèche", "Étirée"]} selected={ans.chaine} onSelect={(v) => set("chaine", v)} />
          <QuestionChips question="Dérailleur" options={["Parfait", "Passage difficile", "Bloqué"]} selected={ans.derailleur} onSelect={(v) => set("derailleur", v)} />
          <QuestionChips question="Pédalier / boîtier" options={["OK", "Jeu / bruit", "HS"]} selected={ans.pedalier} onSelect={(v) => set("pedalier", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(5)} prevLabel="Freins" onNext={() => go(7)} nextLabel="Roues" />
    </PageShell>
  );
}

// ─── Screen 8 — Roues & pneus ─────────────────────────────────────────────────

function Screen8({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  return (
    <PageShell title="Roues & pneus" subtitle="Étape 4 / 5" onBack={() => go(6)} backLabel="Transmission">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Roues & pneus · pondération 10%</p>
        <SectionLabel>ROUES & PNEUS 10%</SectionLabel>
        <div className="mt-2">
          <QuestionChips question="État des jantes" options={["Droites", "Léger voilage", "Voilage important"]} selected={ans.jantes} onSelect={(v) => set("jantes", v)} />
          <QuestionChips question="Pneus" options={["Bonne gomme", "Usure normale", "À changer"]} selected={ans.pneus} onSelect={(v) => set("pneus", v)} />
          <QuestionChips question="Roulements de moyeux" options={["Fluides", "Jeu perceptible", "Durs"]} selected={ans.roulements} onSelect={(v) => set("roulements", v)} />
        </div>
      </Card>
      <NavButton onPrev={() => go(6)} prevLabel="Transmission" onNext={() => go(8)} nextLabel="Finitions" />
    </PageShell>
  );
}

// ─── Screen 9 — Finitions ─────────────────────────────────────────────────────

function Screen9({ go }: { go: (s: ScreenId) => void }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setAns((a) => ({ ...a, [k]: v }));
  return (
    <PageShell title="Finitions" subtitle="Étape 5 / 5" onBack={() => go(7)} backLabel="Roues">
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: C.text }}>Finitions · pondération 10%</p>
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
            className="w-full px-3 py-2 rounded-xl border text-xs resize-none outline-none transition-colors"
            style={{ borderColor: C.border, color: C.text, backgroundColor: C.bgPage }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>
      </Card>
      <PrimaryButton onClick={() => go(9)}>Voir le scoring</PrimaryButton>
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

      <PrimaryButton onClick={() => go(10)}>Générer la décision</PrimaryButton>
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
  return (
    <PageShell title="Décision de reprise" onBack={() => go(9)} backLabel="Synthèse">
      {/* Score + offre */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs mb-2" style={{ color: C.textMuted }}>Score technicien 61/100</p>
            <StatusBadge status="conditional" />
            <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>Remise en état nécessaire</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold" style={{ color: C.text, letterSpacing: "-0.02em" }}>58 €</p>
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
            <span className="text-xs font-bold" style={{ color: C.blue }}>58 €</span>
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
              defaultValue={58}
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
              defaultValue="Aucun ajustement"
              className="w-full h-10 px-3 border rounded-xl text-xs outline-none transition-colors"
              style={{ borderColor: C.border, color: C.text }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.blue)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => go(12)}
          className="flex-1 py-3 px-6 rounded-xl border text-sm font-bold transition-colors"
          style={{ borderColor: C.red, backgroundColor: C.redLight, color: C.red }}
        >
          ✕ Refuser
        </button>
        <button
          onClick={() => go(11)}
          className="flex-1 py-3 px-6 rounded-xl text-white text-sm font-bold transition-opacity active:opacity-80"
          style={{ backgroundColor: C.green }}
        >
          ✓ Valider 58 €
        </button>
      </div>
    </PageShell>
  );
}

// ─── Screen 12 — Acceptée ─────────────────────────────────────────────────────

const QR_PATTERN = [1,1,1,0,1,1,0,0,0,1,1,1,1,0,0,1,0,1,0,1,1,1,1,0,1];

function Screen12({ go }: { go: (s: ScreenId) => void }) {
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
        <p className="text-5xl font-bold mt-4" style={{ color: C.text, letterSpacing: "-0.02em" }}>58 €</p>
        <p className="text-xs mt-2 max-w-xs mx-auto" style={{ color: C.textMuted }}>
          Le client présente ce QR code en caisse pour récupérer son bon d'achat de 58 €
        </p>
      </Card>

      <Card className="p-4">
        <InfoField label="Client" value="Marie Dupont" />
        <InfoField label="Vélo" value="VTT Rockrider 520" />
        <InfoField label="Dossier" value="DEC-00487" />
        <InfoField label="Date" value="15/06/2026" />
        <InfoField label="Bon d'achat" value="58 €" />
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
          {["Freins : patins en fin de vie", "Transmission : réglage avancé nécessaire"].map((m) => (
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: C.bgPage, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Top bar */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-14 border-b"
        style={{ backgroundColor: C.navy, borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
          <span className="text-white font-bold text-sm tracking-[0.1em] uppercase">
            DECATHLON · Seconde Vie
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: C.blue }}
          >
            JM
          </div>
          <span className="hidden sm:block text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Julien M.
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
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
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Screen go={go} />
        </main>
      </div>
    </div>
  );
}
