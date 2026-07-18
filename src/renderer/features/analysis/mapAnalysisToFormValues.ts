import type { AssignmentAnalysisResult } from '@shared/types/api'
import { emptyTaskFormValues, type TaskFormValues } from '@renderer/schemas/taskForm'
import { splitDeadline } from '@renderer/lib/deadline'

/** Converts an analysis API result into initial values for the review form. */
export function mapAnalysisResultToFormValues(
  result: AssignmentAnalysisResult | null
): TaskFormValues {
  if (!result) {
    return emptyTaskFormValues
  }
  const { date, time } = splitDeadline(result.deadline)
  return {
    title: result.title ?? '',
    subject: result.subject ?? '',
    deadlineDate: date,
    deadlineTime: time,
    submissionMethod: result.submissionMethod ?? '',
    description: result.description ?? ''
  }
}
