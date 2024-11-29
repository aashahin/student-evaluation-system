import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { GradeLevel, ReadingClub } from "@/types/api";
import { pb } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type SetupWizardProps = {
  studentId: string;
  onComplete: () => void;
};

const SetupWizard = ({ studentId, onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [grades, setGrades] = useState<GradeLevel[]>([]);
  const [clubs, setClubs] = useState<ReadingClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [clubError, setClubError] = useState<string | null>(null);

  const client = pb();

  React.useEffect(() => {
    const fetchGrades = async () => {
      setIsLoadingGrades(true);
      setError(null);
      try {
        const response = await client
          .collection("grade_levels")
          .getList<GradeLevel>(1, 50, {
            requestKey: Math.random().toString(),
          });
        setGrades(response.items);
      } catch (error) {
        setError(
          "حدث خطأ أثناء تحميل المراحل الدراسية. الرجاء المحاولة مرة أخرى.",
        );
      } finally {
        setIsLoadingGrades(false);
      }
    };
    fetchGrades();
  }, [client]);

  React.useEffect(() => {
    if (selectedGrade) {
      const fetchClubs = async () => {
        setIsLoadingClubs(true);
        setError(null);
        try {
          const response = await client
            .collection("reading_clubs")
            .getList<ReadingClub>(1, 50, {
              filter: `grade_level = "${selectedGrade}"`,
              requestKey: Math.random().toString(),
            });
          setClubs(response.items);
        } catch (error) {
          setError(
            "حدث خطأ أثناء تحميل نوادي القراءة. الرجاء المحاولة مرة أخرى.",
          );
        } finally {
          setIsLoadingClubs(false);
        }
      };
      fetchClubs();
    }
  }, [client, selectedGrade]);

  const handleComplete = async () => {
    if (!selectedClub) {
      setClubError("الرجاء اختيار نادي القراءة");
      return;
    }

    setClubError(null);
    setIsLoading(true);
    setError(null);

    try {
      await client.collection("users").update(studentId, {
        grade_level: selectedGrade,
        club_id: selectedClub,
      });
      onComplete();
    } catch (error) {
      setError("حدث خطأ أثناء حفظ البيانات. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!selectedGrade) {
      setGradeError("الرجاء اختيار المرحلة الدراسية");
      return;
    }
    setGradeError(null);
    setStep(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">إعداد حسابك</h2>
          <Progress value={(step / 2) * 100} className="mt-4" />
          <p className="text-gray-600 mt-4">
            {step === 1 ? "اختر مرحلتك الدراسية" : "اختر نادي القراءة"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <Select
              value={selectedGrade}
              onValueChange={(value) => {
                setSelectedGrade(value);
                setGradeError(null);
              }}
              disabled={isLoadingGrades}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المرحلة الدراسية" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingGrades ? (
                  <div className="p-2 text-center">
                    <Loader2 className="animate-spin mx-auto" />
                  </div>
                ) : (
                  grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {gradeError && (
              <p className="text-red-500 text-sm mt-1">{gradeError}</p>
            )}
            <Button
              className="w-full"
              onClick={handleNextStep}
              disabled={!selectedGrade || isLoadingGrades}
            >
              التالي
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Select
              value={selectedClub}
              onValueChange={setSelectedClub}
              disabled={isLoadingClubs}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نادي القراءة" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingClubs ? (
                  <div className="p-2 text-center">
                    <Loader2 className="animate-spin mx-auto" />
                  </div>
                ) : (
                  clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {clubError && (
              <p className="text-red-500 text-sm mt-1">{clubError}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                رجوع
              </Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={!selectedClub || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    جاري الحفظ...
                  </span>
                ) : (
                  "إنهاء"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SetupWizard;
