'use client';

import { useEffect, useState } from 'react';

interface Account {
  id: number;
  fname: string;
  lname: string;
  username: string;
  email: string;
  password: string;
  acc_created: string;
}

export default function AccountsPage() {
  const [users, setUsers] = useState<Account[]>([]);
  const [filtered, setFiltered] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState<Partial<Account> | null>(null);
  const [form, setForm] = useState({ fname: '', lname: '', username: '', email: '', password: '' });
  const [showModal, setShowModal] = useState(false);

  const load = async (q = '') => {
    const res = await fetch(`/api/accounts?search=${encodeURIComponent(q)}`);
    const json = await res.json();
    setUsers(json);
    setFiltered(json);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(e.target.value);
    setFiltered(users.filter((u) =>
      ['fname', 'lname', 'username', 'email'].some((k) =>
        String(u[k as keyof Account]).toLowerCase().includes(query)
      )
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = edit ? 'PUT' : 'POST';
    const payload = edit ? { ...form, id: edit.id } : form;

    await fetch('/api/accounts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setForm({ fname: '', lname: '', username: '', email: '', password: '' });
    setEdit(null);
    setShowModal(false);
    load(search);
  };

  const handleEdit = (u: Account) => {
    setEdit(u);
    setForm({ ...u, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this user?')) {
      await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
      load(search);
    }
  };

  const [confirmPassword, setConfirmPassword] = useState('');
const [errors, setErrors] = useState({
  passwordMismatch: false,
  passwordInvalid: false,
});

const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/;


  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">REGISTERED USERS</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="p-2 rounded text-white border border-white bg-transparent"
            value={search}
            onChange={handleSearch}
          />
          <button
            onClick={() => { setForm({ fname: '', lname: '', username: '', email: '', password: '' }); setEdit(null); setShowModal(true); }}
            className="bg-green-600 px-4 py-2 rounded text-white"
          >
            ➕ Create User
          </button>
        </div>
      </div>

      {/* Modal */}
      {/* Modal */}
        {showModal && (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowModal(false)} />
            <div className="fixed inset-0 flex items-center justify-center z-50">
            <form
                className="bg-white text-black p-6 rounded shadow-lg w-full max-w-md"
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold mb-4">{edit ? 'Edit User' : 'Create User'}</h2>
                <div className="grid grid-cols-1 gap-3">
                <input
                    type="text"
                    placeholder="First Name"
                    value={form.fname}
                    onChange={(e) => setForm({ ...form, fname: e.target.value })}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={form.lname}
                    onChange={(e) => setForm({ ...form, lname: e.target.value })}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrors({
                        ...errors,
                        passwordInvalid: !passwordRegex.test(e.target.value),
                        passwordMismatch: e.target.value !== confirmPassword,
                    });
                    }}
                    className="p-2 border rounded"
                    required={!edit} // only required for create
                />
                {!edit && (
                    <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors({
                        ...errors,
                        passwordMismatch: e.target.value !== form.password,
                        });
                    }}
                    className="p-2 border rounded"
                    required
                    />
                )}
                {errors.passwordInvalid && (
                    <p className="text-sm text-red-500">
                    Password must be 8+ characters with an uppercase, number, and special character.
                    </p>
                )}
                {errors.passwordMismatch && (
                    <p className="text-sm text-red-500">Passwords do not match.</p>
                )}
                </div>

                <div className="flex justify-between mt-4">
                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-green-600 text-white"
                    disabled={!form.fname || !form.lname || !form.username || !form.email || (edit ? false : (!form.password || !confirmPassword || errors.passwordInvalid || errors.passwordMismatch))}
                >
                    {edit ? 'Update' : 'Create'}
                </button>
                </div>
            </form>
            </div>
        </>
        )}


      {/* User Table */}
      <table className="w-full table-auto bg-violet-800 rounded">
        <thead>
          <tr>
            {['Name', 'Username', 'Email', 'Password', 'Created', 'Actions'].map(h => (
              <th key={h} className="p-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={8} className="text-center p-4">No available records</td></tr>
          ) : filtered.map(u => (
            <tr key={u.id}>
              {/*<td className="p-2">{u.id}</td>*/}
              <td className="p-2">{u.fname} {u.lname}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">*****@gmail.com</td>
              <td className="p-2">*******</td>
              <td className="p-2">{new Date(u.acc_created).toLocaleDateString()}</td>
              <td className="p-2 space-x-1">
                <button className="bg-yellow-500 px-2 rounded" onClick={() => handleEdit(u)}>Edit</button>
                <button className="bg-red-600 px-2 rounded" onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
