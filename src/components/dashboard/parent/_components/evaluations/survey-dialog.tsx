import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Survey } from "@/types/api";
import { surveyTypeStyles, surveyTypeLabels } from "./types";
import SurveyDetails from "@/components/dashboard/_components/survey-details";

type SurveyDialogProps = {
  survey: Survey | null;
  onOpenChange: (open: boolean) => void;
};

export const SurveyDialog = ({ survey, onOpenChange }: SurveyDialogProps) => {
  if (!survey) return null;

  return (
    <Dialog open={!!survey} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                surveyTypeStyles[survey.type]
              }`}
            >
              {surveyTypeLabels[survey.type]}
            </span>
          </DialogTitle>
        </DialogHeader>
        <SurveyDetails survey={survey} />
      </DialogContent>
    </Dialog>
  );
};
