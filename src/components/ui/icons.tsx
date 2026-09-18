import type { HTMLAttributes } from "react";

type MarkProps = HTMLAttributes<HTMLSpanElement>;

function mark(symbol: string, label?: string) {
  return function TypographicMark({ className, ...props }: MarkProps) {
    return <span aria-hidden={label ? undefined : true} aria-label={label} className={className} {...props}>{symbol}</span>;
  };
}

function quietMark() {
  return function QuietMark({ className, ...props }: MarkProps) {
    return <span aria-hidden="true" className={className} {...props} />;
  };
}

export const ArrowLeft = mark("←");
export const ArrowRight = mark("→");
export const ChevronLeft = mark("‹");
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRight = mark("›");
export const ChevronRightIcon = ChevronRight;
export const ChevronDown = mark("⌄");
export const ChevronDownIcon = ChevronDown;
export const ChevronUp = mark("⌃");
export const Check = mark("Selected");
export const CheckCircle2 = mark("Done");
export const Circle = mark("○");
export const X = mark("×");
export const Minus = mark("−");
export const Plus = mark("+");
export const MoreHorizontal = mark("…");
export const Menu = mark("Menu");
export const Loader2 = mark("…");
export const PanelLeft = mark("Menu");
export const GripVertical = mark("⋮");

export const Activity = quietMark();
export const Award = quietMark();
export const BadgeCheck = quietMark();
export const BarChart3 = quietMark();
export const Bell = quietMark();
export const BookOpen = quietMark();
export const CalendarDays = quietMark();
export const CalendarPlus = quietMark();
export const Camera = quietMark();
export const CircleDollarSign = quietMark();
export const Clock3 = quietMark();
export const CreditCard = quietMark();
export const Download = quietMark();
export const ExternalLink = quietMark();
export const Eye = quietMark();
export const EyeOff = quietMark();
export const Facebook = quietMark();
export const FileText = quietMark();
export const Flame = quietMark();
export const GraduationCap = quietMark();
export const Heart = quietMark();
export const Instagram = quietMark();
export const KeyRound = quietMark();
export const LayoutDashboard = quietMark();
export const LockKeyhole = quietMark();
export const LogOut = quietMark();
export const Mail = quietMark();
export const MapPin = quietMark();
export const MessageCircle = quietMark();
export const Music2 = quietMark();
export const PackageOpen = quietMark();
export const Percent = quietMark();
export const Phone = quietMark();
export const Play = quietMark();
export const PlayCircle = quietMark();
export const ReceiptText = quietMark();
export const RefreshCw = quietMark();
export const RotateCcw = quietMark();
export const Save = quietMark();
export const Search = quietMark();
export const Send = quietMark();
export const Settings = quietMark();
export const ShieldCheck = quietMark();
export const ShieldX = quietMark();
export const Smartphone = quietMark();
export const Sparkles = quietMark();
export const Star = quietMark();
export const Tag = quietMark();
export const Tags = quietMark();
export const Timer = quietMark();
export const Trash2 = quietMark();
export const TrendingUp = quietMark();
export const User = quietMark();
export const UserPlus = quietMark();
export const UserRound = quietMark();
export const UserSearch = quietMark();
export const Users = quietMark();