export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'trainer' | 'trainee' | 'user' | 'pending';
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  duration: number; // in hours
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  maxParticipants: number;
  currentParticipants: number;
  startDate: Date;
  endDate: Date;
  materials: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingSession {
  id: string;
  courseId: string;
  title: string;
  date: Date;
  duration: number;
  location: string;
  attendees: string[];
  materials: string[];
  notes?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completedSessions: string[];
  progress: number;
  lastAccessed: Date;
  certificateIssued: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}