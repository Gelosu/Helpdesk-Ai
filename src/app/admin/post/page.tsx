'use client';

import { useState, useEffect, useRef } from 'react';
import { Post } from '@prisma/client';

interface PostData extends Post {
  Account: {
    fname: string;
    lname: string;
  };
}

export default function AdminPostPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PostData | null>(null);
  const [preview, setPreview] = useState<PostData | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [form, setForm] = useState({ content: '', image_url: '', badge: '' });

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts();
  }, [search]);

  async function fetchPosts() {
    const res = await fetch(`/api/admin/posts?q=${encodeURIComponent(search)}`);
    setPosts(await res.json());
  }

  async function createOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const payload = editing ? { id: editing.id, ...form } : form;

    await fetch('/api/admin/posts', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setForm({ content: '', image_url: '', badge: '' });
    setEditing(null);
    setFormModalOpen(false);
    fetchPosts();
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this post?')) return;
    await fetch('/api/admin/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPosts();
  }

  // Close preview on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (preview && previewRef.current && !previewRef.current.contains(e.target as Node)) {
        setPreview(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [preview]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">📌 Manage Posts</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded border text-black"
          />
          <button
            onClick={() => {
              setForm({ content: '', image_url: '', badge: '' });
              setEditing(null);
              setFormModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Create Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-violet-700 text-white">
            <tr>
             
              <th className="p-3 border-b">NAME</th>
              <th className="p-3 border-b">Content</th>
              <th className="p-3 border-b">Created At</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-violet-900 text-white">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-violet-800 transition">
                <td className="p-3 border-b">
                  {p.Account ? `${p.Account.fname} ${p.Account.lname}` : 'Unknown'}
                </td>
               
                <td className="p-3 border-b">
                  <button onClick={() => setPreview(p)} className="text-blue-300 underline">View</button>
                </td>
                <td className="p-3 border-b">{new Date(p.created_at!).toLocaleString()}</td>
                <td className="p-3 border-b text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setForm({
                        content: p.content,
                        image_url: p.image_url ?? '',
                        badge: p.badge ?? '',
                      });
                      setFormModalOpen(true);
                    }}
                    className="bg-yellow-500 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-300">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg text-black relative">
            <button
              onClick={() => {
                setFormModalOpen(false);
                setEditing(null);
              }}
              className="absolute top-2 right-3 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Post' : 'Create Post'}</h2>
            <form onSubmit={createOrUpdate} className="space-y-3">
              <textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                required
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.image_url}
                onChange={(e) => setForm((s) => ({ ...s, image_url: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Badge"
                value={form.badge}
                onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-2 justify-end">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div
            ref={previewRef}
            className="bg-white text-black p-6 rounded-lg w-full max-w-xl relative"
          >
            <button
              className="absolute top-2 right-2 text-black text-xl"
              onClick={() => setPreview(null)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">🔍 Post Preview</h2>
            <p className="mb-2"><strong>Badge:</strong> {preview.badge}</p>
            <p className="mb-2"><strong>Content:</strong> {preview.content}</p>
            {preview.image_url && (
              <img src={preview.image_url} alt="Preview" className="w-full h-auto mt-2 rounded shadow" />
            )}
            <p className="mt-4 text-sm text-gray-600">
              Posted by {preview.Account?.fname} {preview.Account?.lname} (User #{preview.user_id})<br />
              on {new Date(preview.created_at!).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
