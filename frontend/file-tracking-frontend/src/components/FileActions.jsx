import { useState } from "react";
import { getFileCount, getFileDetails, getFileHistory } from "../utils/blockchain";

export default function FileActions() {
  const [fileId, setFileId] = useState("");

  return (
    <div className="card">
      <h3>FILE ACTIONS</h3>

      <input
        type="number"
        placeholder="File ID"
        value={fileId}
        onChange={(e) => setFileId(e.target.value)}
      />

      <div className="row">
        <button onClick={getFileCount}>Get File Count</button>
        <button onClick={() => getFileDetails(fileId)}>Get File Details</button>
        <button onClick={() => getFileHistory(fileId)}>Get File History</button>
      </div>
    </div>
  );
}
