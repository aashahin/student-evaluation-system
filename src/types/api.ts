export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string; // admin, student, parent, teacher
  age: number;
  club_id?: string;
  performance?: JSON;
  created: string;
  updated: string;
};

export type ReadingClub = {
  id: string;
  name: string;
  description?: string;
  grade_level: string; // id
  max_members: number;
  teacher_id: string;
  created: string;
  updated: string;
  expand?: {
    teacher_id?: User;
    grade_level?: GradeLevel;
  };
};

export type GradeLevel = {
  id: string;
  name: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  page_count: number;
  discussion_date: Date;
  club_id: string;
  teacher_id: string;
  created: string;
  updated: string;
};

export type ReadingBook = {
  id: string;
  book_id: string;
  student_id: string;
  club_id: string;
  is_read: boolean;
  created: string;
  updated: string;
};

export type SurveyType =
  | "self-assessment"
  | "teacher-assessment"
  | "parent-assessment";

export type Survey = {
  id: string;
  type: SurveyType;
  club_id: string;
  student_id: string;
  questions: {
    data: {
      question: string;
      rating: number;
    }[];
  };
  expand?: {
    student_id?: User;
  };
  created: string;
  updated: string;
};

export type Guide = {
  id: string;
  type: string;
  files: string[];
  created: string;
  updated: string;
};

export type Discussion = {
  id: string;
  club_id: string;
  student_id: string;
  book_id: string;
  discussion_date: Date;
  attended: boolean;
  expand?: {
    book_id?: Book;
    student_id?: User;
  };
  created: string;
  updated: string;
};
