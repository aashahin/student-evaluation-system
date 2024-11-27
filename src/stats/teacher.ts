import { ReadingBook, Survey, User } from "@/types/api";

type ClubStats = {
  activityRate: number;
  surveysCount: number;
  memberCount: number;
  maxMembers: number | null;
  averageSurveysPerMember: number;
  readBooksCount: number;
};

export function calculateClubStats(
  surveys: Survey[],
  clubMembers: User[],
  maxMembers: number,
  books: ReadingBook[],
): ClubStats {
  // Calculate number of members
  const memberCount = clubMembers?.length || 0;

  // Total number of surveys
  const surveysCount = surveys.length;

  // Calculate read books count
  const readBooksCount = books.filter((book) => book.is_read).length;

  // Calculate average surveys per member
  const averageSurveysPerMember =
    memberCount > 0 ? Number((surveysCount / memberCount).toFixed(1)) : 0;

  // Calculate activity rate based on both surveys and read books
  const expectedSurveysPerMember = 4;
  const totalExpectedSurveys = memberCount * expectedSurveysPerMember;

  // Calculate expected books per member (assuming 1 book per member)
  const totalExpectedBooks = memberCount;

  // Calculate separate rates for surveys and books
  const surveyRate =
    totalExpectedSurveys > 0 ? (surveysCount / totalExpectedSurveys) * 100 : 0;

  const bookRate =
    totalExpectedBooks > 0 ? (readBooksCount / totalExpectedBooks) * 100 : 0;

  // Combined activity rate (50% surveys, 50% books)
  const activityRate = Math.min(
    Math.round(surveyRate * 0.5 + bookRate * 0.5),
    100,
  );

  return {
    activityRate,
    surveysCount,
    memberCount,
    maxMembers: maxMembers > 0 ? maxMembers : null,
    averageSurveysPerMember,
    readBooksCount,
  };
}
