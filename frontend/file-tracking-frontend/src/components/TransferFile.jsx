import { useState } from "react";
import { transferFile } from "../utils/blockchain";

export default function TransferFile() {
  const [receiver, setReceiver] = useState("");

  const handleTransfer = async () => {
    if (!receiver.trim()) return;
    await transferFile(receiver);
    setReceiver("");
  };

  return (
    <div className="card">
      <h3>TRANSFER FILE</h3>
      <input
        type="text"
        placeholder="Receiver Address"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />

      <button className="arrow-btn" onClick={handleTransfer}>
        Transfer File →
      </button>
    </div>
  );
}
