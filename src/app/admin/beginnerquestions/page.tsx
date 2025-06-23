'use client';

import { useEffect, useState } from 'react';

interface BeginnerQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number;
  createdAt: string;
}

export default function BeginnerQuestionsPage() {
  const [questions, setQuestions] = useState<BeginnerQuestion[]>([]);
  const [filtered, setFiltered] = useState<BeginnerQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], answer: 0 });
  const [editId, setEditId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [viewModalData, setViewModalData] = useState<BeginnerQuestion | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await fetch('/api/questions/beginner');
    const json = await res.json();
    setQuestions(json);
    setFiltered(json);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearch(q);
    setFiltered(
      questions.filter(qn =>
        qn.question.toLowerCase().includes(q)
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const payload = editId ? { ...form, id: editId } : form;

    await fetch('/api/questions/beginner', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    load();
    setForm({ question: '', options: ['', '', '', ''], answer: 0 });
    setEditId(null);
    setShowFormModal(false);
  };

  const handleEdit = (q: BeginnerQuestion) => {
    setForm({ question: q.question, options: [...q.options], answer: q.answer });
    setEditId(q.id);
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this question?')) {
      await fetch(`/api/questions/beginner?id=${id}`, { method: 'DELETE' });
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">BEGINNER QUESTIONS</h1>
        
      </div>

      <div className="flex justify-between items-center">
      <button
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        onClick={() => {
          setForm({ question: '', options: ['', '', '', ''], answer: 0 });
          setEditId(null);
          setShowFormModal(true);
        }}
      >
        ➕ Add Question
      </button>

      <input
        type="text"
        placeholder="Search questions..."
        value={search}
        onChange={handleSearch}
        className="p-2 rounded text-white border border-white bg-transparent"
      />
    </div>


      <table className="w-full bg-violet-800 rounded table-auto">
        <thead>
          <tr>
            {['ID', 'Question', 'Answer', 'Actions'].map(h => (
              <th key={h} className="p-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4">No available records</td>
            </tr>
          ) : (
            filtered.map((q, index) => (
              <tr key={q.id}>
                {/* <td>{q.id}</td> */}
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{q.question}</td>
                <td className="p-2">
                  <button className="text-blue-300 underline" onClick={() => setViewModalData(q)}>
                    View
                  </button>
                </td>
                <td className="p-2 space-x-1">
                  <button onClick={() => handleEdit(q)} className="bg-yellow-500 px-2 rounded">Edit</button>
                  <button onClick={() => handleDelete(q.id)} className="bg-red-600 px-2 rounded">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>


      </table>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Question"
                className="w-full p-2 border rounded"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
              />
              {form.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  className="w-full p-2 border rounded"
                  value={opt}
                  onChange={(e) => {
                    const updated = [...form.options];
                    updated[i] = e.target.value;
                    setForm({ ...form, options: updated });
                  }}
                  required
                />
              ))}
              <select
                className="w-full p-2 border rounded"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: Number(e.target.value) })}
              >
                {form.options.map((_, i) => (
                  <option key={i} value={i}>Correct Answer: Option {i + 1}</option>
                ))}
              </select>

              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Answer Modal */}
      {viewModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4 text-center">Question Preview</h2>
            <div className="space-y-4">
              <div className="p-4 bg-violet-800 rounded shadow text-white">
                <h2 className="font-bold text-lg mb-2">{viewModalData.question}</h2>
                <ul className="list-disc list-inside space-y-1">
                  {viewModalData.options.map((opt, i) => (
                    <li
                      key={i}
                      className={i === viewModalData.answer ? 'text-green-400 font-semibold' : ''}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                onClick={() => setViewModalData(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
