import { useState, useEffect } from "react";
import { pb } from "@/lib/api";
import { Book, ReadingBook } from "@/types/api";
import { AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import BookCard from "@/components/dashboard/student/_components/reading-materials/book-card";
import StatsSection, {
  EmptyState,
  FilterButtons,
  LoadingSkeleton,
  SearchBar,
} from "@/components/dashboard/student/_components/reading-materials/stats-sections";
import { toast } from "sonner";

export type FilterType = "all" | "read" | "unread";

const ReadingMaterials = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [readingStatus, setReadingStatus] = useState<ReadingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<FilterType>("all");

  const client = pb();
  const student = client.authStore.record;
  const studentId = student?.id;
  const gradeLevel = student?.grade_level;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksResponse, readingStatusResponse] = await Promise.all([
          client.collection("books").getList<Book>(1, 50, {
            filter: `club_id = "${student!.club_id}"`,
            sort: "-created",
            expand: "teacher_id",
            requestKey: Math.random().toString(),
          }),
          client.collection("reading_books").getList<ReadingBook>(1, 50, {
            filter: `student_id = "${studentId}"`,
            expand: "book_id",
            requestKey: Math.random().toString(),
          }),
        ]);

        setBooks(booksResponse.items);
        setReadingStatus(readingStatusResponse.items);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل المواد المقروءة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [client, studentId]);

  const markAsRead = async (bookId: string) => {
    try {
      await client.collection("reading_books").create({
        book_id: bookId,
        student_id: studentId,
        club_id: books.find((b) => b.id === bookId)?.club_id,
        is_read: true,
      });

      const updatedStatus = await client
        .collection("reading_books")
        .getList<ReadingBook>(1, 50, {
          filter: `student_id = "${studentId}"`,
          expand: "book_id",
        });
      setReadingStatus(updatedStatus.items);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة الكتاب");
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const isRead = readingStatus.some(
      (status) => status.book_id === book.id && status.is_read,
    );

    if (filterRead === "read") return matchesSearch && isRead;
    if (filterRead === "unread") return matchesSearch && !isRead;
    return matchesSearch;
  });

  if (!studentId || !gradeLevel) {
    return <div>لا يوجد معرف الطالب أو المرحلة الدراسية</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">المواد المقروءة</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterButtons selected={filterRead} onSelect={setFilterRead} />
        </div>
      </div>

      <StatsSection books={books} readingStatus={readingStatus} />

      <AnimatePresence>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isRead={readingStatus.some(
                  (status) => status.book_id === book.id && status.is_read,
                )}
                onMarkAsRead={markAsRead}
                client={client}
                gradeLevel={gradeLevel}
                studentId={studentId}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {!isLoading && filteredBooks.length === 0 && <EmptyState />}
    </div>
  );
};

export default ReadingMaterials;
