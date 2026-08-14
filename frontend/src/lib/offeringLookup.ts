import { allOfferings } from './searchData';

const normalize = (value: string) => value.replace(/\s+/g, '').toLowerCase();

export function findOfferingIdByCourseCode(courseCode?: string): number | undefined {
  if (!courseCode) {
    return undefined;
  }
  return allOfferings.find((offering) => offering.course_code === courseCode)?.offering_id;
}

export function findOfferingIdByCourse(
  courseCode?: string,
  title?: string,
  instructor?: string
): number | undefined {
  const byCode = findOfferingIdByCourseCode(courseCode);
  if (byCode) {
    return byCode;
  }

  if (!title || !instructor) {
    return undefined;
  }

  const normalizedTitle = normalize(title);
  const normalizedInstructor = normalize(instructor);

  return allOfferings.find((offering) => {
    const titleMatches = normalize(offering.title) === normalizedTitle;
    const instructorMatches = offering.instructor_names.some((name) => normalize(name) === normalizedInstructor);
    return titleMatches && instructorMatches;
  })?.offering_id;
}
