import { Book, ReadingBook } from "@/types/api";
import { BookOpen, CheckCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FilterType } from "@/components/dashboard/student/_components/reading-materials";

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
          <div className="mt-2 w-full bg-gray-100 overflow-hidden rounded-full h-1.5">
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

export const LoadingSkeleton = () => (
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

export const SearchBar = ({
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

export const FilterButtons = ({
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

export const EmptyState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-xl">
    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">لا توجد كتب متطابقة مع البحث</p>
  </div>
);

export default StatsSection;
