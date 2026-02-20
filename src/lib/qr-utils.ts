/**
 * QR kod yordamchi funksiyalar
 */

interface QrData {
  id: string;
  memberId?: string;
  name: string;
}

/**
 * QR kod ma'lumotini parse va validatsiya qilish
 */
export function parseQrData(rawText: string): QrData | null {
  try {
    const data = JSON.parse(rawText);
    if (
      data &&
      typeof data.id === "string" &&
      typeof data.name === "string" &&
      isValidObjectId(data.id)
    ) {
      return { id: data.id, memberId: data.memberId || undefined, name: data.name };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * MongoDB ObjectId formatini tekshirish
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * QR kodni PNG sifatida yuklab olish
 */
export function downloadQrCode(dataUrl: string, memberName: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `QR-${memberName.replace(/\s+/g, "-")}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * QR kartani chop etish (yangi oyna ochib)
 */
export function printQrCard(
  dataUrl: string,
  memberName: string,
  memberPhone: string,
  memberId?: string
): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>QR Card - ${memberName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f8fafc;
        }
        .card {
          width: 320px;
          background: white;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          border: 2px solid #e2e8f0;
        }
        .logo {
          font-size: 20px;
          font-weight: 800;
          color: #2563eb;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .qr-wrapper {
          display: inline-block;
          padding: 12px;
          background: white;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .qr-wrapper img { width: 200px; height: 200px; }
        .name {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .phone {
          font-size: 14px;
          color: #64748b;
        }
        @media print {
          body { background: white; }
          .card { box-shadow: none; border: 1px solid #e2e8f0; }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">FitnessPro</div>
        <div class="subtitle">A'zolik kartasi</div>
        <div class="qr-wrapper">
          <img src="${dataUrl}" alt="QR Code" />
        </div>
        <div class="name">${memberName}</div>
        ${memberId ? `<div style="font-size:13px;color:#2563eb;font-family:monospace;letter-spacing:2px;margin-top:4px;font-weight:600;">ID: ${memberId}</div>` : ""}
        <div class="phone">${memberPhone}</div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 300);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
