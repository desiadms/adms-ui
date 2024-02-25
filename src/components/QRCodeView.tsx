import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function QRCodeView() {
  const [id, setId] = useState<string>();

  return (
    <div>
      <button
        className="p-2 bg-slate-500 w-fit text-white rounded-lg"
        type="button"
        onClick={() => setId(uuidv4())}
      >
        Generate QRCode with random uuidv4
      </button>
      {id && <QRCodeCanvas value={id} includeMargin />}
      <p>{id}</p>
    </div>
  );
}
