export default function FileLogs() {
  return (
    <div className="card logs">
      <h2>📄 Total Files: 0</h2>

      <div className="details">
        <h4>Details</h4>
        <p>Last Accessed: --</p>
        <p>Owner: Not Loaded</p>
        <p>Status: Not Loaded</p>
      </div>

      <div className="history">
        <h4>History</h4>
        <div className="history-card">
          <p><strong>File Created/Moved</strong></p>
          <p>From: 0xf39…2266</p>
          <p>To: 0x709…79C8</p>
          <p>Hash: {`{transaction hash:78c3h...}`}</p>
          <p>Timestamp: 4/14/2026, 10:57 PM</p>
        </div>
      </div>
    </div>
  );
}
