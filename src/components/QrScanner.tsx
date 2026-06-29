import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

export default function QrScanner({ onScan, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const id = "qr-reader-region";
    if (ref.current) ref.current.id = id;
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          if (stopped) return;
          stopped = true;
          onScan(decoded);
        },
        () => {}
      )
      .catch(() => {});

    return () => {
      stopped = true;
      scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-card p-4">
        <button
          onClick={onClose}
          className="absolute left-3 top-3 z-10 rounded-full bg-muted p-1.5 text-foreground"
        >
          <X size={18} />
        </button>
        <p className="mb-3 text-center font-body text-sm text-foreground">امسح بطاقة العميل (QR)</p>
        <div ref={ref} className="overflow-hidden rounded-xl" />
      </div>
    </div>
  );
}
