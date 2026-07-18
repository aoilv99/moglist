import { z } from 'zod'

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '課題名を入力してください')
    .max(100, '課題名は100文字以内で入力してください'),
  subject: z
    .string()
    .trim()
    .max(50, '科目名は50文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  deadlineDate: z.string().min(1, '締切日を入力してください'),
  deadlineTime: z.string().min(1, '締切時刻を入力してください'),
  submissionMethod: z
    .string()
    .trim()
    .max(200, '提出方法は200文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(2000, '説明は2000文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const emptyTaskFormValues: TaskFormValues = {
  title: '',
  subject: '',
  deadlineDate: '',
  deadlineTime: '23:59',
  submissionMethod: '',
  description: ''
}
