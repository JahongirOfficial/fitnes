"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { parseQrData } from "@/lib/qr-utils";

type ScanState = "scanning" | "processing" | "success" | "error";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (memberId: string, memberName: string) => Promise<void>;
  mode: "checkin" | "checkout";
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  mode,
}: QrScannerModalProps) {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [resultMessage, setResultMessage] = useState("");
  const [memberName, setMemberName] = useState("");
  const scannerRef = useRef<any>(null);
  const cooldownRef = useRef(false);
  const lastScanRef = useRef("");
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // State 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      try {
        scannerRef.current.clear();
      } catch {
        // ignore clear errors
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (cooldownRef.current) return;
      if (lastScanRef.current === decodedText) return;

      const qrData = parseQrData(decodedText);
      if (!qrData) {
        cooldownRef.current = true;
        setScanState("error");
        setResultMessage("Noto'g'ri QR kod formati");
        setTimeout(() => {
          cooldownRef.current = false;
          setScanState("scanning");
          setResultMessage("");
        }, 2000);
        return;
      }

      cooldownRef.current = true;
      lastScanRef.current = decodedText;
      setScanState("processing");
      setMemberName(qrData.name);

      try {
        await onScanSuccess(qrData.id, qrData.name);
        setScanState("success");
        setResultMessage(
          mode === "checkin"
            ? `${qrData.name} kirish qayd etildi`
            : `${qrData.name} chiqish qayd etildi`
        );
      } catch (err: any) {
        setScanState("error");
        setResultMessage(err.message || "Xatolik yuz berdi");
      }

      // Auto reset after 2 seconds for next scan
      setTimeout(() => {
        cooldownRef.current = false;
        lastScanRef.current = "";
        setScanState("scanning");
        setResultMessage("");
        setMemberName("");
      }, 2000);
    },
    [onScanSuccess, mode]
  );

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const initScanner = async () => {
      // Dynamic import for SSR safety
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mounted) return;

      // Wait for DOM element to be available
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = document.getElementById("qr-reader");
      if (!element || !mounted) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // QR scan error (no QR found in frame) - silently ignore
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        if (mounted) {
          setScanState("error");
          setResultMessage(
            "Kameraga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan kamera ruxsatini bering."
          );
        }
      }
    };

    // Reset state
    setScanState("scanning");
    setResultMessage("");
    setMemberName("");
    cooldownRef.current = false;
    lastScanRef.current = "";

    initScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen, handleScanSuccess, stopScanner]);

  const handleClose = useCallback(() => {
    stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  if (!isOpen) return null;

  const isCheckin = mode === "checkin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between ${
            isCheckin
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
          }`}
        >
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-white font-semibold">
                {isCheckin ? "QR Kirish" : "QR Chiqish"}
              </h3>
              <p className="text-white/80 text-xs">
                QR kodni kameraga ko&apos;rsating
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative p-4">
          <div
            ref={containerRef}
            className="relative rounded-xl overflow-hidden bg-black"
            style={{ minHeight: 300 }}
          >
            <div id="qr-reader" style={{ width: "100%" }} />

            {/* Scan frame overlay */}
            {scanState === "scanning" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[250px] h-[250px]">
                  {/* Corner accents */}
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg ${isCheckin ? "border-emerald-400" : "border-amber-400"}`} />
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg ${isCheckin ? "border-emerald-400" : "border-amber-400"}`} />
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg ${isCheckin ? "border-emerald-400" : "border-amber-400"}`} />
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg ${isCheckin ? "border-emerald-400" : "border-amber-400"}`} />

                  {/* Scan line animation */}
                  <div
                    className={`absolute left-2 right-2 h-0.5 animate-scan-line ${isCheckin ? "bg-emerald-400" : "bg-amber-400"}`}
                    style={{ boxShadow: `0 0 8px ${isCheckin ? "#34d399" : "#fbbf24"}` }}
                  />
                </div>
              </div>
            )}

            {/* Result overlay */}
            {scanState !== "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                {scanState === "processing" && (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
                    <p className="text-white font-medium">{memberName}</p>
                    <p className="text-white/60 text-sm">Tekshirilmoqda...</p>
                  </div>
                )}

                {scanState === "success" && (
                  <div className="text-center animate-scale-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-9 h-9 text-white" />
                    </div>
                    <p className="text-white font-semibold text-lg">
                      {resultMessage}
                    </p>
                  </div>
                )}

                {scanState === "error" && (
                  <div className="text-center animate-scale-in">
                    <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-9 h-9 text-white" />
                    </div>
                    <p className="text-white font-semibold">{resultMessage}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {scanState === "scanning"
              ? "Kamera avtomatik QR kodni aniqlaydi"
              : scanState === "success" || scanState === "error"
              ? "Keyingi skanerlash uchun kutilmoqda..."
              : "Ma'lumot tekshirilmoqda..."}
          </p>
        </div>
      </div>
    </div>
  );
}
