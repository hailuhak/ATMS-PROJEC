import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Filter, Plus, Edit2, Trash2 } from "lucide-react";
import { Course } from "../../../types";
import { useFirestoreQuery } from "../../../hooks/useFirestoreQuery";
import { db } from "../../../lib/firebase";
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

export const CourseManagement: React.FC = () => {
  const { data: coursesFromDB, loading: coursesLoading } = useFirestoreQuery<Course>(
    "courses",
    [orderBy("createdAt", "desc"), limit(20)]
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Omit<Course, "id" | "createdAt" | "updatedAt"> | null>(null);

  // Initialize new course state
  const defaultCourse = {
    title: "",
    description: "",
    instructorName: "",
    instructorId: "",
    duration: 0,
    level: "beginner" as const,
    category: "",
    maxParticipants: 0,
    currentParticipants: 0,
    startDate: new Date(),
    endDate: new Date(),
    materials: [] as string[],
    status: "active" as const,
  };

  const [newCourse, setNewCourse] = useState(defaultCourse);

  // Sync courses
  useEffect(() => {
    if (coursesFromDB) {
      const formatted = coursesFromDB.map(course => ({
        ...course,
        createdAt: course.createdAt instanceof Date ? course.createdAt : course.createdAt?.toDate(),
        updatedAt: course.updatedAt instanceof Date ? course.updatedAt : course.updatedAt?.toDate(),
      }));
      setCourses(formatted);
    }
  }, [coursesFromDB]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Add course
  const handleAddCourse = async () => {
    if (!newCourse.title || !newCourse.instructorName) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      const courseRef = await addDoc(collection(db, "courses"), {
        ...newCourse,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setCourses(prev => [
        { ...newCourse, id: courseRef.id, createdAt: new Date(), updatedAt: new Date() },
        ...prev,
      ]);

      setNewCourse(defaultCourse);
      setShowForm(false);
      alert("Course added successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingCourse) return;

    try {
      await updateDoc(doc(db, "courses", editingCourse.id!), {
        ...editingCourse,
        updatedAt: serverTimestamp(),
      });

      setCourses(prev =>
        prev.map(c => (c.id === editingCourse.id ? { ...c, ...editingCourse, updatedAt: new Date() } : c))
      );

      setEditingCourse(null);
      setShowForm(false);
      alert("Course updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "courses", id));
      setCourses(prev => prev.filter(c => c.id !== id));
      alert("Course deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all courses</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingCourse(null);
            setNewCourse(defaultCourse);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Create Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Form */}
      {showForm && (
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{editingCourse ? "Edit Course" : "Add New Course"}</h2>
            <div className="space-y-4">
              <Input
                placeholder="Course Title"
                value={editingCourse ? editingCourse.title : newCourse.title}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, title: e.target.value })
                    : setNewCourse({ ...newCourse, title: e.target.value })
                }
              />
              <Input
                placeholder="Instructor Name"
                value={editingCourse ? editingCourse.instructorName : newCourse.instructorName}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, instructorName: e.target.value })
                    : setNewCourse({ ...newCourse, instructorName: e.target.value })
                }
              />
              <Input
                placeholder="Instructor ID"
                value={editingCourse ? editingCourse.instructorId : newCourse.instructorId}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, instructorId: e.target.value })
                    : setNewCourse({ ...newCourse, instructorId: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={editingCourse ? editingCourse.description : newCourse.description}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, description: e.target.value })
                    : setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Duration (hours)"
                value={editingCourse ? editingCourse.duration : newCourse.duration}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, duration: Number(e.target.value) })
                    : setNewCourse({ ...newCourse, duration: Number(e.target.value) })
                }
              />
              <select
                value={editingCourse ? editingCourse.level : newCourse.level}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, level: e.target.value as any })
                    : setNewCourse({ ...newCourse, level: e.target.value as any })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Input
                placeholder="Category"
                value={editingCourse ? editingCourse.category : newCourse.category}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, category: e.target.value })
                    : setNewCourse({ ...newCourse, category: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Max Participants"
                value={editingCourse ? editingCourse.maxParticipants : newCourse.maxParticipants}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, maxParticipants: Number(e.target.value) })
                    : setNewCourse({ ...newCourse, maxParticipants: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="Current Participants"
                value={editingCourse ? editingCourse.currentParticipants : newCourse.currentParticipants}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, currentParticipants: Number(e.target.value) })
                    : setNewCourse({ ...newCourse, currentParticipants: Number(e.target.value) })
                }
              />
              <Input
                type="date"
                placeholder="Start Date"
                value={
                  editingCourse ? editingCourse.startDate.toISOString().split("T")[0] : newCourse.startDate.toISOString().split("T")[0]
                }
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, startDate: new Date(e.target.value) })
                    : setNewCourse({ ...newCourse, startDate: new Date(e.target.value) })
                }
              />
              <Input
                type="date"
                placeholder="End Date"
                value={
                  editingCourse ? editingCourse.endDate.toISOString().split("T")[0] : newCourse.endDate.toISOString().split("T")[0]
                }
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, endDate: new Date(e.target.value) })
                    : setNewCourse({ ...newCourse, endDate: new Date(e.target.value) })
                }
              />
              <Input
                placeholder="Materials (comma separated)"
                value={editingCourse ? editingCourse.materials.join(", ") : newCourse.materials.join(", ")}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, materials: e.target.value.split(",").map(m => m.trim()) })
                    : setNewCourse({ ...newCourse, materials: e.target.value.split(",").map(m => m.trim()) })
                }
              />
              <select
                value={editingCourse ? editingCourse.status : newCourse.status}
                onChange={e =>
                  editingCourse
                    ? setEditingCourse({ ...editingCourse, status: e.target.value as any })
                    : setNewCourse({ ...newCourse, status: e.target.value as any })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="flex gap-2">
                <Button onClick={editingCourse ? handleSaveEdit : handleAddCourse}>
                  {editingCourse ? "Save Changes" : "Add Course"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingCourse(null);
                    setNewCourse(defaultCourse);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesLoading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
              </div>
            ))
          : filteredCourses.length === 0
          ? <p className="text-center text-gray-500 dark:text-gray-400">No courses found.</p>
          : filteredCourses.map(course => (
              <Card key={course.id}>
                <CardContent>
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{course.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Instructor: {course.instructorName} | Status: {course.status}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Edit2
                      className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700"
                      onClick={() => {
                        setEditingCourse(course);
                        setShowForm(true);
                      }}
                    />
                    <Trash2
                      className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteCourse(course.id!)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};
