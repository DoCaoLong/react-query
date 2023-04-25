import { IStudent, IStudents } from 'types/student.type'
import http from 'utils/http'

export const getStudents = (page: number | string, limit: number | string, signal?: AbortSignal) => {
  return http.get<IStudents>('students', {
    params: {
      _page: page,
      _limit: limit
    },
    signal
  })
}

export const getStudent = (id: number | string) => http.get<IStudent>(`students/${id}`)

export const addStudent = (student: Omit<IStudent, 'id'>) => http.post<IStudent>('students', student)

export const editStudent = (id: number | string, student: IStudent) => http.put<IStudent>(`students/${id} `, student)

export const deleteStudent = (id: number | string) => http.delete<{}>(`students/${id}`)
