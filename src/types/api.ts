export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    created: string;
    updated: string;
}

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
}

export type StudentEvaluation = {
    id: string;
    book_id: string;
    student_id: string;
    club_id: string;
    reading_speed: string;
    comprehension_level: string;
    engagement_level: string;
    challenges: string;
    created: string;
    updated: string;
    expand?: {
        student_id?: User;
        book_id?: Book;
    };
}

export type GradeLevel = {
    id: string;
    name: string;
}

export type Book = {
    id: string;
    title: string;
    description: string;
    author?: string;
    cover_image?: string;
    page_count?: number;
    discussion_date: string;
    club_id: string;
    teacher_id: string;
    created: string;
    updated: string;
}
