import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    api.get('/contact', { params: { q } })
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line
  }, [q]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await api.delete(`/contact/${id}`);
    fetchMessages();
  };

  const handleArchive = async (id) => {
    await api.patch(`/contact/${id}/archive`);
    fetchMessages();
  };

  const filtered = messages.filter(msg => !!msg.archived === showArchived);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: 20 }}>
      <h2>Contact Messages</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Search..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <label>
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
          /> Show archived
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(msg => (
              <tr key={msg._id}>
                <td>{msg.name}</td>
                <td>{msg.email}</td>
                <td>{msg.message}</td>
                <td>{new Date(msg.createdAt).toLocaleString()}</td>
                <td>
                  {!msg.archived && (
                    <button onClick={() => handleArchive(msg._id)}>Archive</button>
                  )}
                  <button onClick={() => handleDelete(msg._id)} style={{ marginLeft: 8, color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminContactMessages;