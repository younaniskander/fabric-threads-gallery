const methods = [
  { name: "Visa", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm11.2-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.5 1.4-4.5 3.4 0 1.5 1.3 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.3-2.1zm6.8-.3h-2.1c-.6 0-1.1.2-1.4.9l-3.9 9.6h2.8l.6-1.5h3.4l.3 1.5h2.5l-2.2-10.5zm-3.3 6.8l1.1-3 .3-.9.2.8.6 3.1h-2.2zM16.3 10.5l-2.6 7.2-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.4 9h2.8l4.2-10.5h-2.8z" fill="#fff"/><path d="M11.5 10.5H7.1l0 .2c3.4.9 5.6 3 6.5 5.5l-.9-4.7c-.2-.7-.7-.9-1.2-1z" fill="#F7B600"/></svg>
  )},
  { name: "Mastercard", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="8" fill="#EB001B"/><circle cx="29" cy="16" r="8" fill="#F79E1B"/><path d="M24 9.8a8 8 0 0 1 3 6.2 8 8 0 0 1-3 6.2 8 8 0 0 1-3-6.2 8 8 0 0 1 3-6.2z" fill="#FF5F00"/></svg>
  )},
  { name: "Fawry", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#FFC107"/><text x="24" y="19" textAnchor="middle" fill="#333" fontSize="9" fontWeight="bold" fontFamily="sans-serif">fawry</text></svg>
  )},
  { name: "Vodafone Cash", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#E60000"/><text x="24" y="14" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Vodafone</text><text x="24" y="22" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Cash</text></svg>
  )},
  { name: "Orange Cash", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#FF6600"/><text x="24" y="14" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Orange</text><text x="24" y="22" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Cash</text></svg>
  )},
  { name: "Etisalat Cash", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#009639"/><text x="24" y="14" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">Etisalat</text><text x="24" y="22" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">Cash</text></svg>
  )},
  { name: "Meeza", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#003B73"/><text x="24" y="19" textAnchor="middle" fill="#F7B600" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ميزة</text></svg>
  )},
  { name: "ValU", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#6C3FA5"/><text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">valU</text></svg>
  )},
  { name: "Sympl", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#1B1464"/><text x="24" y="19" textAnchor="middle" fill="#00E5A0" fontSize="10" fontWeight="bold" fontFamily="sans-serif">sympl.</text></svg>
  )},
  { name: "Installments", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#2563EB"/><text x="24" y="13" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif">6 Month</text><text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif">Bank</text><text x="24" y="25" textAnchor="middle" fill="#FFC107" fontSize="5" fontWeight="bold" fontFamily="sans-serif">Installment</text></svg>
  )},
  { name: "Apple Pay", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#000"/><text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif"> Pay</text></svg>
  )},
  { name: "Cash on Delivery", svg: (
    <svg viewBox="0 0 48 32" className="h-6 w-auto"><rect width="48" height="32" rx="4" fill="#16A34A"/><text x="24" y="13" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">الدفع</text><text x="24" y="22" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">عند الاستلام</text></svg>
  )},
];

interface PaymentMethodsProps {
  compact?: boolean;
}

const PaymentMethods = ({ compact = false }: PaymentMethodsProps) => {
  return (
    <div className={`${compact ? "py-2" : "py-4"}`}>
      <div className={`flex flex-wrap items-center justify-center gap-2 ${compact ? "gap-1.5" : "gap-2"}`}>
        {methods.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-center rounded-md border border-border bg-card p-1.5 transition-colors hover:border-primary/30"
            title={m.name}
          >
            {m.svg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
