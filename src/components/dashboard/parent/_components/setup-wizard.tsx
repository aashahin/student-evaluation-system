import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { pb } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { User } from "@/types/api";

type SetupWizardProps = {
  onComplete: () => void;
};

const ParentSetupWizard = ({ onComplete }: SetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [studentData, setStudentData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentIdError, setStudentIdError] = useState<string | null>(null);
  const [secretKeyError, setSecretKeyError] = useState<string | null>(null);

  const client = pb();

  const handleSearchStudent = async () => {
    if (!studentId) {
      setStudentIdError("الرجاء إدخال رقم الطالب");
      return;
    }

    setStudentIdError(null);
    setIsLoading(true);
    setError(null);

    try {
      const response = await client
        .collection("users")
        .getOne<User | null>(studentId);

      if (!response || response.role !== "student") {
        setError("لم يتم العثور على حساب طالب بهذا الرقم");
        return;
      }

      setStudentData(response);
      setStep(2);
    } catch (error) {
      setError("حدث خطأ أثناء البحث. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmStudent = async () => {
    if (!secretKey) {
      setSecretKeyError("الرجاء إدخال المفتاح السري");
      return;
    }

    setSecretKeyError(null);
    setIsLoading(true);
    setError(null);

    try {
      await client.collection("users").getFirstListItem(`
        id = "${studentData?.id}" && secret_key = "${secretKey}"
      `);

      await client.collection("users").update(client.authStore.record!.id, {
        student_id: studentData!.id,
      });

      onComplete();
    } catch (error) {
      setError("المفتاح السري غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">ربط حساب الطالب</h2>
          <Progress value={(step / 2) * 100} className="mt-4" />
          <p className="text-gray-600 mt-4">
            {step === 1 ? "أدخل رقم الطالب" : "تأكيد حساب الطالب"}{" "}
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
            <Input
              type="text"
              placeholder="رقم الطالب"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setStudentIdError(null);
              }}
            />
            {studentIdError && (
              <p className="text-red-500 text-sm mt-1">{studentIdError}</p>
            )}
            <Button
              className="w-full"
              onClick={handleSearchStudent}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  جاري البحث...
                </span>
              ) : (
                "بحث"
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {studentData && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium">معلومات الطالب:</p>
                <p>{studentData.name}</p>
                <p className="text-gray-500">
                  رقم الطالب: {studentData.id}
                </p>{" "}
              </div>
            )}
            <Input
              type="text"
              placeholder="المفتاح السري للطالب"
              value={secretKey}
              onChange={(e) => {
                setSecretKey(e.target.value);
                setSecretKeyError(null);
              }}
            />
            {secretKeyError && (
              <p className="text-red-500 text-sm mt-1">{secretKeyError}</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                رجوع
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmStudent}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    جاري التأكيد...
                  </span>
                ) : (
                  "تأكيد"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ParentSetupWizard;
