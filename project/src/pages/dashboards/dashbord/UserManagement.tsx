import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { db, auth } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, updateEmail } from "firebase/auth";

export const UserManagement: React.FC = () => {
  // Firestore query
  const { data: usersFromDB, loading: usersLoading } =
    useFirestoreQuery<any>("users", [orderBy("createdAt", "desc"), limit(20)]);

  // Local state
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const [newUser, setNewUser] = useState({
    displayName: "",
    email: "",
    password: "",
    role: "trainee",
    status: "active",
  });

  // Sync users
  useEffect(() => {
    if (usersFromDB) {
      const formattedUsers = usersFromDB.map((user: any) => ({
        ...user,
        createdAt: user.createdAt?.toDate ? user.createdAt.toDate() : new Date(),
      }));
      setUsers(formattedUsers);
    }
  }, [usersFromDB]);

  // Add user
  const handleAddUser = async () => {
    if (!newUser.displayName || !newUser.email || !newUser.password) {
      alert("Please fill all fields.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );
      const uid = userCredential.user.uid;

      const userRef = await addDoc(collection(db, "users"), {
        uid,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        createdAt: serverTimestamp(),
      });

      setUsers(prev => [{ ...newUser, id: userRef.id, createdAt: new Date() }, ...prev]);
      setNewUser({ displayName: "", email: "", password: "", role: "trainee", status: "active" });
      setShowAddUserForm(false);
      alert(`User added successfully!`);
    } catch (err: any) {
      console.error("Error adding user:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      // 1. Update Firestore
      await updateDoc(doc(db, "users", editingUser.id), {
        displayName: editingUser.displayName,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status,
      });

      // 2. Update Firebase Auth email if changed
      if (editingUser.authUid && editingUser.email !== users.find(u => u.id === editingUser.id)?.email) {
        const userRecord = auth.currentUser;
        if (userRecord && userRecord.uid === editingUser.authUid) {
          // Update current user email
          await updateEmail(userRecord, editingUser.email);
        } else {
          // If editing another user, updating Auth requires Admin SDK on a server
          console.warn("To update Auth email for other users, use Firebase Admin SDK on your server.");
        }
      }

      // 3. Update local state
      setUsers(prev =>
        prev.map(u => (u.id === editingUser.id ? { ...editingUser } : u))
      );
      setEditingUser(null);
      alert("User updated successfully!");
    } catch (err: any) {
      console.error("Error updating user:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and their roles</p>
        </div>
        <Button onClick={() => setShowAddUserForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Add User Form */}
      {showAddUserForm && (
        <Card>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={newUser.displayName}
                onChange={e => setNewUser({ ...newUser, displayName: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="trainee">Trainee</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={newUser.status}
                onChange={e => setNewUser({ ...newUser, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddUser}>Save User</Button>
                <Button variant="outline" onClick={() => setShowAddUserForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={editingUser.displayName}
                onChange={e => setEditingUser({ ...editingUser, displayName: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={editingUser.email}
                onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
              />
              <select
                value={editingUser.role}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="trainee">Trainee</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={editingUser.status}
                onChange={e => setEditingUser({ ...editingUser, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b dark:border-gray-600">
                      <td className="px-4 py-2">{user.displayName || "N/A"}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">{user.status}</td>
                      <td className="px-4 py-2">{user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Edit2
                          className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                          onClick={() => setEditingUser(user)}
                          // title="Edit User"
                        />
                        <Trash2
                          className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                          // title="Delete User"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
