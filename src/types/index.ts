export type UserRole = 'admin' | 'client';

export interface AuthSession {
  role: UserRole;
  clientId?: string; // If role is 'client'
  clientName?: string;
}

export type CaseCategory =
  | 'جنائي'
  | 'مدني'
  | 'تجاري'
  | 'عمالي'
  | 'أحوال شخصية'
  | 'إداري وتعويضات'
  | 'عقاري';

export type CaseStage =
  | 'تسجيل وتوثيق الدعوى'
  | 'إيداع المذكرات والمستندات'
  | 'جلسات المرافعة والتحقيق'
  | 'محجوزة للحكم'
  | 'صدور الحكم الابتدائي'
  | 'مرحلة الاستئناف والطعن'
  | 'التنفيذ والتحصيل';

export type CaseStatus =
  | 'متداولة'
  | 'محجوزة للحكم'
  | 'منتهية بحكم لصالح الموكل'
  | 'قيد الاستئناف'
  | 'مغلقة';

export interface HearingLog {
  id: string;
  date: string;
  stage: string;
  courtDecision: string;
  notes: string;
  nextHearingDate?: string;
  attendedLawyer: string;
}

export interface CaseDocument {
  id: string;
  title: string;
  fileType: string;
  uploadDate: string;
  fileSize: string;
  notes?: string;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  category: CaseCategory;
  clientId?: string; // Linked client account ID
  clientName: string;
  clientPhone: string;
  opponentName: string;
  court: string;
  circuit: string; // الدائرة
  judge?: string;
  startDate: string;
  currentStage: CaseStage;
  status: CaseStatus;
  totalFees: number;
  paidFees: number;
  nextHearingDate?: string;
  nextHearingReason?: string;
  hearings: HearingLog[];
  documents: CaseDocument[];
  description: string;
}

export type ContractCategory =
  | 'استشارات سنوية'
  | 'تأسيس شركات'
  | 'عقد إيجار تجاري'
  | 'اتفاقية توريد وخدمات'
  | 'عقد عمل وتنفيذي'
  | 'اتفاقية سرية معلومات NDA'
  | 'عقد مقاولات وإنشاءات';

export interface ContractItem {
  id: string;
  contractNumber: string;
  title: string;
  category: ContractCategory;
  clientId?: string; // Linked client account ID
  partyTwo: string; // الطرف الثاني (العميل)
  clientPhone: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  value: number;
  renewalType: 'تلقائي' | 'بإخطار كتابي قبل شهر' | 'سنوي مشروط' | 'غير قابل للتجديد';
  status: 'نشط' | 'ينتهي قريباً' | 'منتهي' | 'مجدد';
  autoAlertDays: number; // default 30 days
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'دفعة أتعاب' | 'مصروفات قضائية' | 'رسوم توكيل وتوثيق' | 'أتعاب استشارة' | 'استرداد مصاريف';
  amount: number;
  method: 'تحويل بنكي' | 'نقدي' | 'شيك مصدّق' | 'بطاقة دفع';
  receiptNumber: string;
  caseNumber?: string;
  notes?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  nationalId?: string;
  address?: string;
  totalAgreedFees: number;
  totalPaid: number;
  courtExpenses: number;
  transactions: Transaction[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  phone: string;
  consultationType: 'حضورية في المكتب' | 'استشارة هاتفية' | 'جلسة عبر زووم / أونلاين' | 'مراجعة وصياغة عقد عاجل';
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  topic: string;
  lawyer: string;
  fee: number;
  status: 'مؤكد' | 'في الانتظار' | 'منجز' | 'ملغي';
  notes?: string;
}

export interface LegalTemplate {
  id: string;
  title: string;
  category: 'عقود تجارية' | 'إنذارات رسمية' | 'مذكرات دفاع' | 'لوائح ومخالصات';
  description: string;
  content: string;
}
