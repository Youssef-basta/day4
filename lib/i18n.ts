// Client-safe i18n primitives: locale type, dictionary, pure t() function,
// RTL helper. No server-only imports — usable from both client and server
// components. The cookies-reading helpers live in lib/i18n-server.ts.

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "kbs_locale";

const dict = {
  // Customer landing page
  "hero.bookNow": { en: "Book Now", ar: "احجز الآن" },
  "hero.bookYourSeat": { en: "Book your seat", ar: "احجز مقعدك" },
  "hero.fallbackHeadline1": { en: "Sharp look,", ar: "إطلالة أنيقة،" },
  "hero.fallbackHeadline2": { en: "easy booking.", ar: "حجز سهل." },
  "section.menu": { en: "Menu", ar: "القائمة" },
  "section.services": { en: "Our services", ar: "خدماتنا" },
  "section.makeItYours": { en: "Make it yours", ar: "خصصها" },
  "section.addons": { en: "Add-ons", ar: "إضافات" },
  "section.addonsHint": {
    en: "Layer any of these onto your booking.",
    ar: "أضف أيًا منها إلى حجزك.",
  },
  "section.refreshments": { en: "Refreshments", ar: "المشروبات" },
  "section.onTheHouse": { en: "On the house", ar: "على حساب المحل" },
  "section.refreshmentsHint": {
    en: "Order hot or cold drinks while you're in the chair.",
    ar: "اطلب مشروبات ساخنة أو باردة أثناء الجلسة.",
  },
  "drinks.hot": { en: "Hot", ar: "ساخن" },
  "drinks.cold": { en: "Cold", ar: "بارد" },
  "drinks.free": { en: "Free", ar: "مجاني" },
  "footer.visitUs": { en: "Visit us", ar: "زورونا" },
  // Header / chrome
  "header.bookings": { en: "Bookings", ar: "الحجوزات" },
  "header.admin": { en: "Admin", ar: "الإدارة" },
  // Booking wizard — stepper labels
  "step.service": { en: "Service", ar: "الخدمة" },
  "step.time": { en: "Time", ar: "الوقت" },
  "step.drinks": { en: "Drinks", ar: "المشروبات" },
  "step.details": { en: "Details", ar: "التفاصيل" },
  "step.pay": { en: "Pay", ar: "الدفع" },
  // Booking wizard — section headings
  "book.pickService": { en: "Pick a service", ar: "اختر خدمة" },
  "book.pickTime": { en: "Pick a time", ar: "اختر وقتًا" },
  "book.refreshmentsTitle": { en: "Refreshments", ar: "المشروبات" },
  "book.refreshmentsSub": {
    en: "Optional — hot or cold drinks ready when you sit down.",
    ar: "اختياري — مشروبات ساخنة أو باردة جاهزة عند جلوسك.",
  },
  "book.yourDetails": { en: "Your details", ar: "بياناتك" },
  "book.payment": { en: "Payment", ar: "الدفع" },
  // Booking wizard — labels and helper text
  "book.fullName": { en: "Full name", ar: "الاسم الكامل" },
  "book.fullNamePh": { en: "Ahmed Al-Sabah", ar: "أحمد الصباح" },
  "book.phoneNumber": { en: "Phone number", ar: "رقم الهاتف" },
  "book.phonePh": { en: "Enter 8-digit number", ar: "أدخل رقمًا من 8 أرقام" },
  "book.phoneExample": { en: "Example: 50001234", ar: "مثال: 50001234" },
  "book.phoneError": {
    en: "Phone must be 8 digits.",
    ar: "يجب أن يكون رقم الهاتف 8 أرقام.",
  },
  "book.notes": { en: "Notes", ar: "ملاحظات" },
  "book.notesOptional": { en: "(optional)", ar: "(اختياري)" },
  "book.notesPh": {
    en: "Any preferences for your barber?",
    ar: "هل لديك تفضيلات للحلاق؟",
  },
  "book.addonsTitle": {
    en: "Add-ons (optional)",
    ar: "إضافات (اختياري)",
  },
  "book.totalDuration": { en: "Total · {min} min", ar: "المجموع · {min} دقيقة" },
  "book.noOpenSlots": {
    en: "No open time slots right now. Please check back later.",
    ar: "لا توجد أوقات متاحة حاليًا. يرجى المحاولة لاحقًا.",
  },
  "book.available": { en: "Available", ar: "متاح" },
  "book.booked": { en: "Booked", ar: "محجوز" },
  "book.continue": { en: "Continue", ar: "متابعة" },
  "book.back": { en: "Back", ar: "رجوع" },
  "book.skip": { en: "Skip", ar: "تخطّي" },
  "book.confirmBooking": { en: "Confirm booking", ar: "تأكيد الحجز" },
  "book.payN": { en: "Pay {n} KWD", ar: "ادفع {n} د.ك" },
  "book.processing": { en: "Processing…", ar: "جاري المعالجة…" },
  "book.pickServiceFirst": {
    en: "Pick a service to continue",
    ar: "اختر خدمة للمتابعة",
  },
  "book.pickTimeFirst": {
    en: "Pick a time to continue",
    ar: "اختر وقتًا للمتابعة",
  },
  "book.noDrinks": {
    en: "No drinks · skip if you'd rather not",
    ar: "لا مشروبات · يمكنك التخطي",
  },
  "book.cashOnSite": { en: "Cash on site", ar: "نقدي في المحل" },
  "book.choosePayment": {
    en: "Choose a payment method",
    ar: "اختر طريقة الدفع",
  },
  "book.payOnArrival": { en: "Pay on arrival", ar: "ادفع عند الوصول" },
  "book.cashHint": {
    en: "Bring {n} KWD in cash to the studio. Your slot is held until the start time.",
    ar: "أحضر {n} د.ك نقدًا إلى المحل. سيتم الاحتفاظ بموعدك حتى الوقت المحدد.",
  },
  "book.orderSummary": { en: "Order summary", ar: "ملخص الطلب" },
  "book.totalLabel": { en: "Total", ar: "المجموع" },
  "book.payVisa": { en: "Visa / Mastercard", ar: "فيزا / ماستركارد" },
  "book.payVisaHint": {
    en: "Pay now, secure online",
    ar: "ادفع الآن عبر الإنترنت بأمان",
  },
  "book.payKnet": { en: "KNET", ar: "كي نت" },
  "book.payKnetHint": {
    en: "Pay now with your Kuwait bank card",
    ar: "ادفع الآن ببطاقة بنك كويتية",
  },
  "book.payCash": { en: "Cash on site", ar: "نقدي في المحل" },
  "book.payCashHint": {
    en: "Pay at the studio when you arrive",
    ar: "ادفع في المحل عند وصولك",
  },
  // Confirmation page
  "conf.youreBooked": { en: "You're booked!", ar: "تم تأكيد حجزك!" },
  "conf.seeSoon": {
    en: "We'll see you soon, {name}.",
    ar: "نراك قريبًا، {name}.",
  },
  "conf.bookingId": { en: "Your booking ID", ar: "رقم الحجز" },
  "conf.reference": { en: "Reference", ar: "المرجع" },
  "conf.serviceLabel": { en: "Service", ar: "الخدمة" },
  "conf.timeLabel": { en: "Time", ar: "الوقت" },
  "conf.totalLabel": { en: "Total", ar: "المجموع" },
  "conf.phoneLabel": { en: "Phone", ar: "الهاتف" },
  "conf.paymentLabel": { en: "Payment", ar: "الدفع" },
  "conf.notesLabel": { en: "Notes", ar: "ملاحظات" },
  "conf.addonsLabel": { en: "Add-ons", ar: "إضافات" },
  "conf.drinksLabel": { en: "Drinks", ar: "المشروبات" },
  "conf.whatsNext": { en: "What's next", ar: "الخطوات التالية" },
  "conf.saveRef": {
    en: "Save your reference: {ref}",
    ar: "احفظ رقم حجزك: {ref}",
  },
  "conf.arriveEarly": {
    en: "Arrive 10 minutes early at the studio.",
    ar: "احضر قبل الموعد بـ 10 دقائق.",
  },
  "conf.showRef": {
    en: "Show the reference at the counter.",
    ar: "أظهر رقم الحجز عند الاستقبال.",
  },
  "conf.bringCash": {
    en: "Bring {n} KWD in cash to pay on arrival.",
    ar: "أحضر {n} د.ك نقدًا عند وصولك.",
  },
  "conf.holdNote": {
    en: "Heads up: your slot is held for {min} minutes after the start time. After that it's automatically released so other customers can book it.",
    ar: "تنبيه: سيتم الاحتفاظ بموعدك لمدة {min} دقيقة بعد وقت البداية، ثم يتم تحريره تلقائيًا.",
  },
  "conf.notFound": { en: "Booking not found", ar: "الحجز غير موجود" },
  "conf.notFoundHint": {
    en: "It may have been cleared. Try booking again.",
    ar: "ربما تم مسحه. حاول الحجز مرة أخرى.",
  },
  "conf.backHome": { en: "Back to home", ar: "العودة للرئيسية" },
  "conf.home": { en: "Home", ar: "الرئيسية" },
  "conf.bookAnother": { en: "Book another", ar: "احجز موعدًا آخر" },
  "conf.cashSummary": {
    en: "Cash on site · {n} KWD due",
    ar: "نقدي في المحل · {n} د.ك مستحقة",
  },
  "conf.print": { en: "Print", ar: "طباعة" },
  "conf.saveCal": { en: "Add to calendar", ar: "أضف إلى التقويم" },
  "conf.saved": { en: "Saved!", ar: "تم الحفظ!" },
  // Settings page
  "settings.language": { en: "Language", ar: "اللغة" },
  "settings.languageHint": {
    en: "Customer-facing text honors this preference.",
    ar: "النصوص المعروضة للعملاء تتبع هذا الإعداد.",
  },
} as const;

export type DictKey = keyof typeof dict;

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}

export function t(
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>
): string {
  const raw = dict[key][locale] ?? dict[key].en;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_m, name) =>
    name in vars ? String(vars[name]) : `{${name}}`
  );
}
