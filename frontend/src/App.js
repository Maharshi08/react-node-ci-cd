import { useState, useEffect } from "react";

const API_URL = "/api";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    setName("");
    setEmail("");
    fetchUsers();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>User Form</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <br /><br />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <br /><br />

        <button type="submit">Submit</button>
      </form>

      <h2>Saved Users</h2>

      {users.map((u, i) => (
        <p key={i}>{u.name} - {u.email}</p>
      ))}
    </div>
  );
}

export default App;