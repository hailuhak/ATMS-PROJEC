// hooks/useCourses.ts
import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  getDocs, // ✅ must import getDocs
  deleteDoc,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { User, Course, Enrollment } from "../types";

export const useCourses = (currentUser: User | null, statusFilter?: string) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Fetch courses (real-time)
  useEffect(() => {
    let colRef = collection(db, "courses");
    const q = statusFilter ? query(colRef, where("status", "==", statusFilter)) : colRef;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[];
      setAllCourses(courses);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  // Fetch enrollments for the current user (real-time)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "enrollments"), where("userId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Enrollment)
      );
      setEnrollments(data);
      setEnrolledCourseIds(data.map((e) => e.courseId));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Enroll a user in a course
  const enrollCourse = useCallback(
    async (courseId: string) => {
      if (!currentUser) throw new Error("User not logged in");
      if (enrolledCourseIds.includes(courseId)) throw new Error("Already enrolled!");

      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) throw new Error("Course not found.");

      const courseData = courseSnap.data() as Course;

      await addDoc(collection(db, "enrollments"), {
        userId: currentUser.uid,
        courseId,
        enrolledAt: new Date(),
        title: courseData.title || "",
        instructorId: courseData.instructorId || "",
        instructorName: courseData.instructorName || "",
        hours: courseData.hours || 0,
        level: courseData.level || "beginner",
        category: courseData.category || "",
        startDate: courseData.startDate || null,
        endDate: courseData.endDate || null,
        materials: courseData.materials || [],
        status: courseData.status || "active",
      });
    },
    [currentUser, enrolledCourseIds]
  );

  // Unenroll a user from a course
  const unenrollCourse = useCallback(
    async (courseId: string) => {
      if (!currentUser) throw new Error("User not logged in");

      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", currentUser.uid),
        where("courseId", "==", courseId)
      );

      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

      snapshot.docs.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "enrollments", docSnap.id));
      });
    },
    [currentUser]
  );

  return {
    allCourses,
    enrollments,
    enrolledCourseIds,
    enrollCourse,
    unenrollCourse, // ✅ added
  };
};
