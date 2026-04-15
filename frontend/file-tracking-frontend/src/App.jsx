import { useState } from "react";
import { getContract } from "./utils/contract";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [fileId, setFileId] = useState("");
  const [receiver, setReceiver] = useState("");
  const [fileCount, setFileCount] = useState("0");
  const [fileDetails, setFileDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const shortAddress = (addr) => {
    if (!addr) return "Not connected";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      alert("Copy failed");
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
      alert("Wallet connection failed");
    }
  };

  const generateFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const createFile = async () => {
    try {
      if (!fileName.trim()) {
        alert("Enter file name");
        return;
      }

      if (!pdfFile) {
        alert("Please select a PDF file");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const uploadResponse = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Upload failed");
      }

      const fileHash = await generateFileHash(pdfFile);

      const contract = await getContract();
      const tx = await contract.createFile(
        fileName,
        fileHash,
        uploadData.fileUrl,
        uploadData.size
      );

      await tx.wait();

      setHistory((prev) => [
        {
          title: "File Created",
          from: shortAddress(account),
          to: shortAddress(account),
          hash: tx.hash,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      setFileName("");
      setPdfFile(null);
      await getFileCount();
      alert("PDF uploaded and metadata stored on blockchain!");
    } catch (error) {
      console.error("Create file error:", error);
      alert("Create file failed");
    } finally {
      setLoading(false);
    }
  };

  const transferFile = async () => {
    try {
      if (!fileId || !receiver) {
        alert("Enter file ID and receiver address");
        return;
      }

      setLoading(true);
      const contract = await getContract();
      const tx = await contract.transferFile(fileId, receiver);
      await tx.wait();

      setHistory((prev) => [
        {
          title: "File Transferred",
          from: shortAddress(account),
          to: shortAddress(receiver),
          hash: tx.hash,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);

      setReceiver("");
      await getFileDetails();
      await getHistory();
      alert("File transferred successfully!");
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const getFileCount = async () => {
    try {
      const contract = await getContract();
      const count = await contract.fileCount();
      setFileCount(count.toString());
    } catch (error) {
      console.error(error);
      alert("Could not fetch file count");
    }
  };

  const getFileDetails = async () => {
    try {
      if (!fileId) {
        alert("Enter file ID");
        return;
      }

      const contract = await getContract();
      const file = await contract.files(fileId);

      setFileDetails({
        id: file.id.toString(),
        name: file.name,
        fileHash: file.fileHash,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize.toString(),
        currentOwner: file.currentOwner,
        lastAccessed: new Date().toLocaleString(),
        status: "Stored",
      });
    } catch (error) {
      console.error(error);
      alert("Could not fetch file details");
    }
  };

  const getHistory = async () => {
    try {
      if (!fileId) {
        alert("Enter file ID");
        return;
      }

      const contract = await getContract();
      const fileHistory = await contract.getHistory(fileId);

      const formattedHistory = fileHistory.map((item) => ({
        title: "File Transferred",
        from: shortAddress(item.from),
        to: shortAddress(item.to),
        hash: "-",
        timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString(),
      }));

      setHistory(formattedHistory.reverse());
    } catch (error) {
      console.error(error);
      alert("Could not fetch history");
    }
  };

  return (
    <div className="app-shell">
      <div className="page">
        <h1 className="main-title">File Movement Tracking System</h1>

        <div className="wallet-section">
          <button className="wallet-btn" onClick={connectWallet}>
            <span className="wallet-icon">◫</span>
            Connect Wallet
          </button>

          <div className="connected-box">
            <span className="online-dot"></span>
            <span className="connected-label">
              Connected Account: {shortAddress(account)}
            </span>
            <span className="profile-badge">🟣</span>
          </div>
        </div>

        <div className="top-grid">
          <div className="card">
            <h2 className="card-title">CREATE FILE</h2>

            <input
              className="input"
              type="text"
              placeholder="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <input
              className="input"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              style={{ marginTop: "12px" }}
            />

            <button className="primary-btn" onClick={createFile} disabled={loading}>
              {loading ? "Processing..." : "⊕ Upload PDF & Create File"}
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">FILE ACTIONS</h2>

            <div className="search-wrap">
              <input
                className="input"
                type="number"
                placeholder="File ID"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
              />
              <span className="search-mark">⌕</span>
            </div>

            <div className="action-row">
              <button className="action-btn" onClick={getFileCount}>
                ☰ Get File Count
              </button>
              <button className="action-btn active" onClick={getFileDetails}>
                📄 Get File Details
              </button>
              <button className="action-btn" onClick={getHistory}>
                ↺ Get File History
              </button>
            </div>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="card transfer-card">
            <h2 className="card-title">TRANSFER FILE</h2>
            <input
              className="input"
              type="text"
              placeholder="Receiver Address"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
            <button className="secondary-btn" onClick={transferFile} disabled={loading}>
              {loading ? "Processing..." : "Transfer File →"}
            </button>
          </div>

          <div className="card logs-card">
            <h2 className="card-title">FILE LOGS</h2>

            <div className="file-count-box">🧾 Total Files: {fileCount}</div>

            <div className="logs-grid">
              <div className="details-panel">
                <h3>Details</h3>

                <div className="detail-item">
                  <span>Last Accessed</span>
                  <span>{fileDetails?.lastAccessed || "--"}</span>
                </div>

                <div className="detail-item">
                  <span>Owner</span>
                  <span>
                    {fileDetails ? shortAddress(fileDetails.currentOwner) : "Not Loaded"}
                  </span>
                </div>

                <div className="detail-item">
                  <span>Status</span>
                  <span>{fileDetails?.status || "Not Loaded"}</span>
                </div>

                <div className="detail-item">
                  <span>File Name</span>
                  <span>{fileDetails?.name || "Not Loaded"}</span>
                </div>

                <div className="detail-item">
                  <span>Size</span>
                  <span>{fileDetails?.fileSize ? `${fileDetails.fileSize} bytes` : "Not Loaded"}</span>
                </div>

                <div className="detail-item">
                  <span>PDF</span>
                  <span>
                    {fileDetails?.fileUrl ? (
                      <a href={fileDetails.fileUrl} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : (
                      "Not Loaded"
                    )}
                  </span>
                </div>
              </div>

              <div className="history-panel">
                <h3>History</h3>

                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div className="history-card" key={index}>
                      <p className="history-title">{item.title}</p>

                      <div className="history-row">
                        <span>From: {item.from}</span>
                        <button className="copy-btn" onClick={() => copyText(item.from)}>
                          copy
                        </button>
                      </div>

                      <div className="history-row">
                        <span>To: {item.to}</span>
                        <button className="copy-btn" onClick={() => copyText(item.to)}>
                          copy
                        </button>
                      </div>

                      <div className="history-row">
                        <span>Hash: {item.hash}</span>
                        <button className="copy-btn" onClick={() => copyText(item.hash)}>
                          copy
                        </button>
                      </div>

                      <p>Timestamp: {item.timestamp}</p>
                    </div>
                  ))
                ) : (
                  <div className="history-card">No history found</div>
                )}
              </div>
            </div>

            {fileDetails?.fileHash && (
              <div style={{ marginTop: "16px", fontSize: "14px", wordBreak: "break-all" }}>
                <strong>File Hash:</strong> {fileDetails.fileHash}
              </div>
            )}
          </div>
        </div>

        <footer className="footer">
          <span>Blockchain Status: Localhost</span>
          <span>Privacy · Metadata on Blockchain</span>
          <span>PDF Stored Locally</span>
        </footer>
      </div>
    </div>
  );
}

export default App;