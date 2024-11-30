import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { SurveyType } from "@/types/api";
import { surveyTypeLabels } from "./types";

type FiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: SurveyType | "all";
  setSelectedType: (type: SurveyType | "all") => void;
};

export const Filters = ({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
}: FiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row gap-4 max-w-7xl mx-auto">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في الأسئلة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full transition-shadow focus:shadow-md"
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setSelectedType(value as SurveyType | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="نوع التقييم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع التقييمات</SelectItem>
            {Object.entries(surveyTypeLabels).map(([type, label]) => (
              <SelectItem key={type} value={type}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
