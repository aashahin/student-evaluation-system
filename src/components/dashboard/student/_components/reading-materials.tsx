import { useState, useEffect } from "react";
import { pb } from "@/lib/api";
import { Book, ReadingBook } from "@/types/api";
import { AnimatePresence } from "framer-motion";
import {
  BookmarkIcon,
  BookOpen,
  BookOpenIcon,
  CalendarIcon,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import PocketBase from "pocketbase";
import Image from "next/image";
import { Input } from "@/components/ui/input";

type FilterType = "all" | "read" | "unread";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
        <div className="aspect-[3/4] bg-gray-200 rounded-t-xl" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <Input
      type="text"
      placeholder="البحث عن كتاب..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white w-full md:w-64"
    />
  </div>
);

const FilterButtons = ({
  selected,
  onSelect,
}: {
  selected: FilterType;
  onSelect: (filter: FilterType) => void;
}) => (
  <div className="flex gap-2">
    <button
      onClick={() => onSelect("all")}
      className={`px-4 py-2 rounded-lg ${
        selected === "all"
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      الكل
    </button>
    <button
      onClick={() => onSelect("read")}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
        selected === "read"
          ? "bg-green-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <CheckCircle className="w-4 h-4" />
      مقروء
    </button>
    <button
      onClick={() => onSelect("unread")}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
        selected === "unread"
          ? "bg-orange-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      <Clock className="w-4 h-4" />
      قيد القراءة
    </button>
  </div>
);

const StatsSection = ({
  books,
  readingStatus,
}: {
  books: Book[];
  readingStatus: ReadingBook[];
}) => {
  const readCount = readingStatus.filter((s) => s.is_read).length;
  const inProgressCount = books.length - readCount;
  const completionRate = books.length
    ? Math.round((readCount / books.length) * 100)
    : 0;

  const stats = [
    {
      title: "إجمالي الكتب",
      value: books.length,
      color: "text-gray-700",
      icon: "📚",
    },
    {
      title: "تمت قراءته",
      value: readCount,
      color: "text-green-600",
      icon: "✅",
    },
    {
      title: "قيد القراءة",
      value: inProgressCount,
      color: "text-orange-600",
      icon: "📖",
    },
    {
      title: "نسبة الإنجاز",
      value: `${completionRate}%`,
      color: "text-blue-600",
      icon: "📊",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <span className="text-xl">{stat.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${stat.color.replace("text", "bg")}`}
              style={{
                width:
                  stat.title === "نسبة الإنجاز" ? `${completionRate}%` : "100%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const BookCard = ({
  book,
  isRead,
  onMarkAsRead,
  client,
}: {
  book: Book;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
  client: PocketBase;
}) => {
  const discussionDate = new Date(book.discussion_date);
  const isUpcoming = discussionDate > new Date();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        {isRead ? (
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            تمت القراءة
          </span>
        ) : isUpcoming ? (
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" />
            قادم
          </span>
        ) : null}
      </div>

      {/* Image Container */}
      <div className="aspect-[3/4] relative overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[1]" />
        <Image
          src={client.files.getURL(book, book.cover)}
          alt={book.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          layout="fill"
        />
        {isRead && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[2] transition-opacity duration-300">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800 text-right line-clamp-1">
            {book.title}
          </h3>
          <p className="text-gray-600 text-right font-medium line-clamp-1">
            {book.author}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              <BookOpenIcon className="w-4 h-4" />
              {book.page_count} صفحة
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              <CalendarIcon className="w-4 h-4" />
              {discussionDate.toLocaleDateString("ar-SA")}
            </span>
          </div>

          <button
            onClick={() => onMarkAsRead(book.id)}
            disabled={isRead}
            className={`
              w-full px-5 py-3 rounded-xl font-medium transition-all duration-300
              flex items-center justify-center gap-2
              ${
                isRead
                  ? "bg-green-100 text-green-600 cursor-default"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg active:scale-95"
              }
            `}
          >
            {isRead ? (
              <>
                <CheckCircle className="w-5 h-5" />
                تمت القراءة
              </>
            ) : (
              <>
                <BookmarkIcon className="w-5 h-5" />
                تحديد كمقروء
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-xl">
    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">لا توجد كتب متطابقة مع البحث</p>
  </div>
);

const ReadingMaterials = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [readingStatus, setReadingStatus] = useState<ReadingBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<FilterType>("all");

  const client = pb();
  const student = client.authStore.record;
  const studentId = student?.id;

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
        console.error("Error fetching data:", error);
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
      console.error("Error marking book as read:", error);
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
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                isRead={readingStatus.some(
                  (status) => status.book_id === book.id && status.is_read,
                )}
                onMarkAsRead={markAsRead}
                client={client}
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
