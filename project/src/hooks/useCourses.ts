// hooks/useCourses.ts
import { useEffect, useState, useCallback } from "react";
import { 
  collection, 
  query,
  where,
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { User, Course, Enrollment } from "../types";

/**
 * Custom hook to manage courses and enrollments for a user.
 * @param currentUser - the currently logged-in user
 * @param statusFilter - optional, fetch only courses with this status (active, draft, completed)
 */
export const useCourses = (currentUser: User | null, statusFilter?: string) => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  // Fetch courses from Firestore
  useEffect(() => {
    let colRef = collection(db, "courses");

    // If a statusFilter is provided, use a query
    const q = statusFilter ? query(colRef, where("status", "==", statusFilter)) : colRef;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
      setAllCourses(courses);
    });

    return () => unsubscribe();
  }, [statusFilter]);

  // Fetch enrollments for the current user
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "enrollments"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      setEnrollments(data);
      setEnrolledCourseIds(data.map(e => e.courseId));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Enroll a user in a course
  const enrollCourse = useCallback(
    async (courseId: string) => {
      if (!currentUser) throw new Error("User not logged in");

      if (enrolledCourseIds.includes(courseId)) {
        throw new Error("You are already enrolled in this course!");
      }

      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        throw new Error("Course not found.");
      }

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

  return {
    allCourses,
    enrollments,
    enrolledCourseIds,
    enrollCourse,
  };
};
