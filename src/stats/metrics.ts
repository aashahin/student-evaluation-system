import { Survey, User } from "@/types/api";

export type Metrics = {
  currentMembers: number;
  yearStartMembers: number;
  totalBooksRead: number;
  averageBooksPerStudent: number;
  activeParticipants: number;
  participationTrend: number;
  discussionAttendance: number;
  totalDiscussions: number;
};

export function calculateActiveParticipants(
  members: User[],
  surveys: Survey[],
): number {
  const participationThreshold = 0.75;
  let activeCount = 0;

  members.forEach((member) => {
    const memberSurveys = surveys.filter(
      (survey) => survey.student_id === member.id,
    );
    if (memberSurveys.length / surveys.length >= participationThreshold) {
      activeCount++;
    }
  });

  return activeCount;
}

export function calculateParticipationTrend(
  surveys: Survey[],
  yearStart: Date,
): number {
  const firstHalfSurveys = surveys.filter(
    (survey) =>
      new Date(survey.created) <
      new Date(yearStart.getTime() + (Date.now() - yearStart.getTime()) / 2),
  ).length;

  const secondHalfSurveys = surveys.length - firstHalfSurveys;

  if (firstHalfSurveys === 0) return 0;

  return Math.round(
    ((secondHalfSurveys - firstHalfSurveys) / firstHalfSurveys) * 100,
  );
}
