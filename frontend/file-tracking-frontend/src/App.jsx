import { useState } from "react";
import { getContract } from "./utils/contract";

function App() {
  const [account, setAccount] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileId, setFileId] = useState("");
  const [receiver, setReceiver] = useState("");
  const [fileCount, setFileCount] = useState("0");
  const [fileDetails, setFileDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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

      alert("File created successfully!");
      setFileName("");
      await getFileCount();
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

      alert("File transferred successfully!");
      setReceiver("");
      await getFileDetails();
      await getHistory();
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
        from: item.from,
        to: item.to,
        timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString(),
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error(error);
      alert("Could not fetch history");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>File Movement Tracking System</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={connectWallet}>Connect Wallet</button>
        <p>
          <strong>Connected Account:</strong> {account || "Not connected"}
        </p>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h2>Create File</h2>
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <button onClick={createFile} disabled={loading}>
          {loading ? "Processing..." : "Create File"}
        </button>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h2>File Actions</h2>
        <input
          type="number"
          placeholder="Enter file ID"
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />
        <button onClick={getFileCount} style={{ marginRight: "10px" }}>
          Get File Count
        </button>
        <button onClick={getFileDetails} style={{ marginRight: "10px" }}>
          Get File Details
        </button>
        <button onClick={getHistory}>Get File History</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Total Files:</strong> {fileCount}
        </p>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h2>Transfer File</h2>
        <input
          type="text"
          placeholder="Receiver address"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          style={{ marginRight: "10px", padding: "8px", width: "420px" }}
        />
        <button onClick={transferFile} disabled={loading}>
          {loading ? "Processing..." : "Transfer File"}
        </button>
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h2>File Details</h2>
        {fileDetails ? (
          <div>
            <p><strong>ID:</strong> {fileDetails.id}</p>
            <p><strong>Name:</strong> {fileDetails.name}</p>
            <p><strong>Current Owner:</strong> {fileDetails.currentOwner}</p>
          </div>
        ) : (
          <p>No file details loaded</p>
        )}
      </div>

      <hr />

      <div style={{ marginTop: "20px" }}>
        <h2>File History</h2>
        {history.length > 0 ? (
          <ul>
            {history.map((item, index) => (
              <li key={index} style={{ marginBottom: "10px" }}>
                <p><strong>From:</strong> {item.from}</p>
                <p><strong>To:</strong> {item.to}</p>
                <p><strong>Time:</strong> {item.timestamp}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No history found</p>
        )}
      </div>
    </div>
  );
}

export default App;