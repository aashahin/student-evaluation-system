import { GradeLevel, ReadingClub, Survey } from "@/types/api";
import PocketBase from "pocketbase";
import React, { useState } from "react";
import { toast } from "sonner";
import { Book, Loader, Search, Trash2, Users } from "lucide-react";
import CreateClubDialog from "@/components/dashboard/_components/create-club";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ClubsSection = ({
  readingClubs,
  setSelectedClub,
  setEvaluations,
  gradeLevels,
  fetchClubs,
  setIsLoadingEvaluations,
  client,
  isLoading,
  clubMemberCounts,
  selectedClub,
}: {
  readingClubs: ReadingClub[];
  setSelectedClub: (club: ReadingClub | null) => void;
  setEvaluations: (evaluations: Survey[]) => void;
  gradeLevels: GradeLevel[];
  fetchClubs: () => Promise<void>;
  setIsLoadingEvaluations: (isLoadingEvaluations: boolean) => void;
  client: PocketBase;
  isLoading: boolean;
  clubMemberCounts: Record<string, number>;
  selectedClub: ReadingClub | null;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClubEvaluations = async (clubId: string) => {
    setIsLoadingEvaluations(true);
    try {
      const records = await client.collection("surveys").getFullList<Survey>({
        filter: `club_id = "${clubId}"`,
        expand: "student_id",
        sort: "-created",
        requestKey: Math.random().toString(),
      });
      setEvaluations(records);
    } catch (error) {
      toast.error("حدث خطأ ما أثناء إستدعاء الإستبيانات");
    } finally {
      setIsLoadingEvaluations(false);
    }
  };

  const handleClubSelect = (club: ReadingClub) => {
    setSelectedClub(club);
    fetchClubEvaluations(club.id).then(() => setIsLoadingEvaluations(false));
  };

  const handleDeleteClub = async (clubId: string) => {
    try {
      await client.collection("reading_clubs").delete(clubId);
      toast.success("تم حذف النادي بنجاح");
      setSelectedClub(null);
      await fetchClubs();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف النادي");
    }
  };

  const filteredClubs = readingClubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Book className="text-blue-600" />
          نوادي القراءة
        </h2>
        <CreateClubDialog
          gradeLevels={gradeLevels}
          onClubCreated={fetchClubs}
        />
      </div>

      <div className="relative mb-6">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="البحث في النوادي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full ps-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto ps-2">
          {filteredClubs.map((club) => {
            return (
              <div
                key={club.id}
                className={`border p-5 rounded-xl transition-all duration-200 hover:shadow ${
                  selectedClub?.id === club.id
                    ? "border-blue-500 bg-blue-50 shadow"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => handleClubSelect(club)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="font-bold text-lg mb-2">{club.name}</h3>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center text-sm text-gray-600">
                        <Users className="inline-block me-1 w-4 h-4" />
                        {
                          clubMemberCounts[club.id]
                        }/
                        {clubMemberCounts[club.id] > 0 ? club.max_members : "∞"}
                      </span>
                      <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {club.expand?.grade_level?.name}
                      </span>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          هل أنت متأكد من حذف النادي؟
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف النادي وجميع البيانات المرتبطة به بشكل نهائي.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteClub(club.id)}
                        >
                          حذف النادي
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubsSection;
