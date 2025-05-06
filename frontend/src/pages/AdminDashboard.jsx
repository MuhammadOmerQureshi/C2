import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axiosConfig';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function AdminDashboard({ openModal }) {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    api.get('/admin/users?role=employer').then(res => {
      setEmployers(res.data.users || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => employers.filter(e =>
      `${e.firstName} ${e.lastName} ${e.username}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
    [employers, search]
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const counts = useMemo(() => {
    const c = { active: 0, inactive: 0, suspended: 0 };
    employers.forEach(e => c[e.status]++);
    return c;
  }, [employers]);

  const pieData = [
    { name: 'Active', value: counts.active },
    { name: 'Inactive', value: counts.inactive },
    { name: 'Suspended', value: counts.suspended }
  ];
  const COLORS = ['#34D399', '#FBBF24', '#F87171'];

  return (
    <>
      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total', value: employers.length },
          { label: 'Active', value: counts.active },
          { label: 'Inactive', value: counts.inactive },
          { label: 'Suspended', value: counts.suspended }
        ].map((c, i) => (
          <motion.div key={i} className="stat-card" whileHover={{ scale: 1.05 }}>
            <div className="text-sm">{c.label}</div>
            <div className="text-2xl font-bold">{c.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <Card className="w-full lg:w-1/3 h-48">
          <CardHeader>Employer Status</CardHeader>
          <CardContent className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="80%" label>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Input
          className="search-input"
          placeholder="Search employers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-rounded">
        <Table>
          <TableHeader>
            <TableRow>
              {['Name', 'Username', 'Email', 'Status', 'Actions'].map(h => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map(emp => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>{emp.username}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell className="capitalize">{emp.status}</TableCell>
                  <TableCell>
                    <button className="text-blue-600 hover:underline" onClick={() => openModal(emp)}>
                      Details
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No results found</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="flex justify-end">
                <Pagination
                  currentPage={page}
                  total={filtered.length}
                  pageSize={perPage}
                  onPageChange={setPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}







// import React, { useEffect, useState } from 'react';
// import api from '../api/axiosConfig';

// export default function AdminDashboard() {
//   const [employers, setEmployers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [form, setForm] = useState({
//     firstName: '', lastName: '', username: '', email: '', password: ''
//   });
//   const [selected, setSelected] = useState([]);
//   const [showDetails, setShowDetails] = useState(null);
//   const [resetId, setResetId] = useState(null);
//   const [resetPassword, setResetPassword] = useState('');
//   const [bulkStatus, setBulkStatus] = useState('active');

//   // Pagination
//   const [page, setPage] = useState(1);
//   const pageSize = 8;
//   const totalPages = Math.ceil(employers.length / pageSize);
//   const pagedEmployers = employers.slice((page - 1) * pageSize, page * pageSize);

//   const fetchEmployers = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await api.get('/admin/users?role=employer');
//       setEmployers(res.data.users || []);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to fetch employers');
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchEmployers();
//   }, []);

//   const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

//   const onCreate = async e => {
//     e.preventDefault();
//     setError('');
//     try {
//       await api.post('/admin/employers', form);
//       setForm({ firstName: '', lastName: '', username: '', email: '', password: '' });
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create employer');
//     }
//   };

//   const onStatusChange = async (id, status) => {
//     setError('');
//     try {
//       await api.put('/admin/status', { userId: id, status });
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to update status');
//     }
//   };

//   const onDelete = async (id) => {
//     setError('');
//     if (!window.confirm('Are you sure you want to delete this employer?')) return;
//     try {
//       await api.delete(`/admin/users/${id}`);
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete employer');
//     }
//   };

//   // Bulk actions
//   const onSelect = (id) => {
//     setSelected(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id]);
//   };

//   const onSelectAll = () => {
//     if (selected.length === pagedEmployers.length) setSelected([]);
//     else setSelected(pagedEmployers.map(e => e._id));
//   };

//   const onBulkStatus = async () => {
//     setError('');
//     try {
//       await api.put('/admin/bulk-status', { userIds: selected, status: bulkStatus });
//       setSelected([]);
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Bulk status update failed');
//     }
//   };

//   const onBulkDelete = async () => {
//     setError('');
//     if (!window.confirm('Delete selected employers?')) return;
//     try {
//       await api.delete('/admin/bulk-delete', { data: { userIds: selected } });
//       setSelected([]);
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Bulk delete failed');
//     }
//   };

//   // Reset password
//   const onResetPassword = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await api.put(`/admin/users/${resetId}/password`, { password: resetPassword });
//       setResetId(null);
//       setResetPassword('');
//       fetchEmployers();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Password reset failed');
//     }
//   };

//   return (
//     <section>
//       <h2 className="text-xl mb-2 font-semibold">Create Employer</h2>
//       <form onSubmit={onCreate} className="mb-6 flex flex-wrap gap-2 bg-white p-4 rounded shadow">
//         <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First Name" required className="p-2 border rounded flex-1" />
//         <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last Name" required className="p-2 border rounded flex-1" />
//         <input name="username" value={form.username} onChange={onChange} placeholder="Username" required className="p-2 border rounded flex-1" />
//         <input name="email" value={form.email} onChange={onChange} placeholder="Email" type="email" required className="p-2 border rounded flex-1" />
//         <input name="password" value={form.password} onChange={onChange} placeholder="Password" type="password" required className="p-2 border rounded flex-1" />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition">Create</button>
//       </form>

//       {error && <div className="mb-4 text-red-600">{error}</div>}

//       <div className="mb-4 flex flex-wrap items-center gap-2">
//         <button onClick={onSelectAll} className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition">
//           {selected.length === pagedEmployers.length ? 'Unselect All' : 'Select All'}
//         </button>
//         <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="p-1 border rounded">
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//           <option value="suspended">Suspended</option>
//         </select>
//         <button onClick={onBulkStatus} disabled={!selected.length} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition disabled:opacity-50">
//           Bulk Update Status
//         </button>
//         <button onClick={onBulkDelete} disabled={!selected.length} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition disabled:opacity-50">
//           Bulk Delete
//         </button>
//       </div>

//       <h2 className="text-xl mb-2 font-semibold">Employers</h2>
//       {loading ? (
//         <div className="flex items-center justify-center h-32">
//           <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//           </svg>
//         </div>
//       ) : (
//         <div className="overflow-x-auto bg-white rounded shadow">
//           <table className="min-w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border px-2 py-1">
//                   <input type="checkbox" checked={selected.length === pagedEmployers.length && pagedEmployers.length > 0} onChange={onSelectAll} />
//                 </th>
//                 <th className="border px-2 py-1">Name</th>
//                 <th className="border px-2 py-1">Username</th>
//                 <th className="border px-2 py-1">Email</th>
//                 <th className="border px-2 py-1">Status</th>
//                 <th className="border px-2 py-1">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pagedEmployers.map(emp => (
//                 <tr key={emp._id} className="hover:bg-blue-50 transition">
//                   <td className="border px-2 py-1 text-center">
//                     <input
//                       type="checkbox"
//                       checked={selected.includes(emp._id)}
//                       onChange={() => onSelect(emp._id)}
//                     />
//                   </td>
//                   <td className="border px-2 py-1">{emp.firstName} {emp.lastName}</td>
//                   <td className="border px-2 py-1">{emp.username}</td>
//                   <td className="border px-2 py-1">{emp.email}</td>
//                   <td className="border px-2 py-1">
//                     <select
//                       value={emp.status}
//                       onChange={e => onStatusChange(emp._id, e.target.value)}
//                       className="p-1 border rounded"
//                     >
//                       <option value="active">Active</option>
//                       <option value="inactive">Inactive</option>
//                       <option value="suspended">Suspended</option>
//                     </select>
//                   </td>
//                   <td className="border px-2 py-1 flex gap-1">
//                     <button
//                       onClick={() => setShowDetails(emp)}
//                       className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 transition"
//                     >
//                       Details
//                     </button>
//                     <button
//                       onClick={() => { setResetId(emp._id); setResetPassword(''); }}
//                       className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 transition"
//                     >
//                       Reset Password
//                     </button>
//                     <button
//                       onClick={() => onDelete(emp._id)}
//                       className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {pagedEmployers.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="text-center py-2">No employers found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           {/* Pagination Controls */}
//           <div className="flex justify-between items-center p-2">
//             <span className="text-sm text-gray-600">
//               Page {page} of {totalPages || 1}
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages || totalPages === 0}
//                 className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Employer Details Modal */}
//       {showDetails && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 transition-all">
//           <div className="bg-white p-6 rounded shadow-lg w-full max-w-md animate-fade-in">
//             <h3 className="text-xl mb-2 font-semibold">Employer Details</h3>
//             <pre className="mb-4 text-sm bg-gray-100 p-2 rounded">{JSON.stringify(showDetails, null, 2)}</pre>
//             <button onClick={() => setShowDetails(null)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Close</button>
//           </div>
//         </div>
//       )}

//       {/* Reset Password Modal */}
//       {resetId && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 transition-all">
//           <form onSubmit={onResetPassword} className="bg-white p-6 rounded shadow-lg w-full max-w-sm animate-fade-in">
//             <h3 className="text-xl mb-2 font-semibold">Reset Password</h3>
//             <input
//               type="password"
//               value={resetPassword}
//               onChange={e => setResetPassword(e.target.value)}
//               placeholder="New Password"
//               required
//               className="w-full p-2 border rounded mb-4"
//             />
//             <div className="flex gap-2">
//               <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Set Password</button>
//               <button type="button" onClick={() => setResetId(null)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
//             </div>
//           </form>
//         </div>
//       )}
//     </section>
//   );
// }
