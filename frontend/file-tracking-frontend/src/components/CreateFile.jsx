import { useState } from "react";
import { createFile } from "../utils/blockchain";

export default function CreateFile() {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createFile(name);
    setName("");
  };

  return (
    <div className="card">
      <h3>CREATE FILE</h3>
      <input
        type="text"
        placeholder="File Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleCreate} className="primary-btn">
        + Create File
      </button>
    </div>
  );
}
