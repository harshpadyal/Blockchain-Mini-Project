import { useState } from "react";
import { getContract } from "./utils/contract";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileId, setFileId] = useState("");
  const [receiver, setReceiver] = useState("");
  const [fileCount, setFileCount] = useState("0");
  const [fileDetails, setFileDetails] = useState(null);
  const [history, setHistory] = useState([
    {
      title: "File Created/Moved",
      from: "0xf39...2266",
      to: "0x709...79C8",
      hash: "transaction hash:78c3h...",
      timestamp: "4/14/2026, 10:57 PM",
    },
  ]);
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

  const createFile = async () => {
    try {
      if (!fileName.trim()) {
        alert("Enter file name");
        return;
      }

      setLoading(true);
      const contract = await getContract();
      const tx = await contract.createFile(fileName);
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
      await getFileCount();
      alert("File created successfully!");
    } catch (error) {
      console.error(error);
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
          title: "File Created/Moved",
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
      console.error(error);
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
        currentOwner: file.currentOwner,
        lastAccessed: "--",
        status: "Not Loaded",
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
        title: "File Created/Moved",
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
            <button className="primary-btn" onClick={createFile} disabled={loading}>
              {loading ? "Processing..." : "⊕ Create File"}
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
          </div>
        </div>

        <footer className="footer">
          <span>Blockchain Status: Mainnet</span>
          <span>Privacy · Privacy · Docs</span>
          <span>Command · Docs</span>
        </footer>
      </div>
    </div>
  );
}

export default App;