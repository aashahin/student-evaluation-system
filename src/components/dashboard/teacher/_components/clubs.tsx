"use client";

import React, {useEffect, useState} from "react";
import {Book, Loader, Search, Users} from "lucide-react";
import {GradeLevel, ReadingClub, StudentEvaluation, User} from "@/types/api";
import {pb} from "@/lib/api";
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
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Trash2} from "lucide-react";
import {toast} from "sonner";
import ClubStudentCard from "@/components/dashboard/teacher/_components/club-student-card";

export default function Clubs() {
    const [readingClubs, setReadingClubs] = useState<ReadingClub[]>([]);
    const [selectedClub, setSelectedClub] = useState<ReadingClub | null>(null);
    const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
    const [clubMemberCounts, setClubMemberCounts] = useState<Record<string, number>>({});
    const [clubMembers, setClubMembers] = useState<Record<string, User[]>>({});

    const client = pb();

    useEffect(() => {
        fetchClubs();
        fetchGradeLevels();
    }, []);

    const fetchClubMemberCounts = async (clubIds: string[]) => {
        try {
            const counts: Record<string, number> = {};
            for (const clubId of clubIds) {
                const records = await client.collection('reading_club_members').getFullList({
                    filter: `club_id = "${clubId}"`,
                    requestKey: Math.random().toString(),
                    expand: 'user_id',
                });
                counts[clubId] = records.length;
                setClubMembers(prevClubMembers => ({...prevClubMembers, [clubId]: records.map(item => item.expand?.user_id)}));
            }
            setClubMemberCounts(counts);
        } catch (error) {
            console.error('Error fetching member counts:', error);
        }
    };

    const fetchGradeLevels = async () => {
        try {
            const records = await client.collection('grade_levels').getFullList<GradeLevel>({
                requestKey: Math.random().toString(),
            });
            setGradeLevels(records);
        } catch (error) {
            console.error('Error fetching grade levels:', error);
        }
    };

    const fetchClubs = async () => {
        setIsLoading(true);
        try {
            const teacherId = client.authStore.record?.id;
            const records = await client.collection('reading_clubs').getFullList<ReadingClub>({
                filter: `teacher_id = '${teacherId}'`,
                sort: '-created',
                requestKey: Math.random().toString(),
                expand: 'grade_level',
            });
            setReadingClubs(records);
            await fetchClubMemberCounts(records.map(club => club.id));
        } catch (error) {
            console.error('Error fetching reading clubs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClubEvaluations = async (clubId: string) => {
        setIsLoadingEvaluations(true);
        try {
            const records = await client.collection('self_evaluations').getFullList<StudentEvaluation>({
                filter: `club_id = "${clubId}"`,
                expand: 'student_id,book_id',
                requestKey: Math.random().toString(),
            });
            setEvaluations(records);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
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
            await client.collection('reading_clubs').delete(clubId);
            toast.success('تم حذف النادي بنجاح');
            setSelectedClub(null);
            await fetchClubs();
        } catch (error) {
            console.error('Error deleting club:', error);
            toast.error('حدث خطأ أثناء حذف النادي');
        }
    };

    const filteredClubs = readingClubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white shadow rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Book className="text-blue-600"/>
                        نوادي القراءة
                    </h2>
                    <CreateClubDialog
                        gradeLevels={gradeLevels}
                        onClubCreated={fetchClubs}
                    />
                </div>

                <div className="relative mb-6">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"/>
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
                        <Loader className="animate-spin text-blue-600"/>
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
    <Users className="inline-block me-1 w-4 h-4"/>
            {clubMemberCounts[club.id]}/{clubMemberCounts[club.id] > 0 ? club.max_members : '∞'}
</span>
                                                <span
                                                    className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600">
            {club.expand?.grade_level?.name}
          </span>
                                            </div>
                                        </div>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>هل أنت متأكد من حذف النادي؟</AlertDialogTitle>
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
                            )
                        })
                        }
                    </div>
                )}
            </div>

            {selectedClub ? (
                <ClubStudentCard
                    selectedClub={selectedClub}
                    evaluations={evaluations}
                    isLoadingEvaluations={isLoadingEvaluations}
                    countMembers={clubMemberCounts[selectedClub.id]}
                    clubMembers={clubMembers[selectedClub.id]}
                />
            ) : (
                <div className="bg-white shadow rounded-xl p-6 flex items-center justify-center text-gray-500">
                    اختر ناديًا لعرض التفاصيل
                </div>
            )}
        </div>
    )
}