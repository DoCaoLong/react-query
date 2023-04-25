import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addStudent, deleteStudent, editStudent, getStudent } from 'apis/student.api'
import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { IStudent } from 'types/student.type'
import { isAxiosError } from 'utils/isAxiosError'
import classNames from 'classnames'
import { toast } from 'react-toastify'
type FormDataType = Omit<IStudent, 'id'>
const initialFormData: FormDataType = {
  avatar: '',
  email: '',
  btc_address: '',
  country: '',
  first_name: '',
  gender: 'other',
  last_name: ''
}
type FormError = { [key in keyof FormDataType]: string } | null
const gender = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}
export default function AddStudent() {
  const addMatch = useMatch('students/add')
  const isAddMode = Boolean(addMatch)
  const { id } = useParams()
  const queryClient = useQueryClient()
  let [formData, setFormData] = useState<FormDataType>(initialFormData)
  const addStudentMutate = useMutation({
    mutationFn: (student: FormDataType) => addStudent(student)
  })

  const studentQuery = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id as string),
    enabled: id !== undefined,
    staleTime: 1000 * 10, // kiểm tra kết quả trc đó quá 10s thì call api
    onSuccess: (data) => setFormData(data.data)
  })

  const editStudentMutate = useMutation({
    mutationFn: () => editStudent(id as string, formData as IStudent),
    onSuccess: (data) => {
      // cập nhật dữ liệu được lấy từ cache hoặc server và lưu vào cache.
      // dữ liệu sẽ được cập nhật trực tiếp trong cache mà không cần thực hiện truy vấn mới.
      // Lưu ý rằng khi sử dụng setQueryData, ta cần đảm bảo dữ liệu mới phải có cùng kiểu dữ liệu với dữ liệu cũ đã được lưu trong cache. Nếu không, sẽ xảy ra lỗi.
      queryClient.setQueryData(['student', id], data)
    }
  })

  const errorForm: FormError = useMemo(() => {
    const error = isAddMode ? addStudentMutate.error : editStudentMutate.error
    if (isAxiosError<{ error: FormError }>(error) && error.response?.status === 422) {
      return error?.response?.data.error
    }
    return null
  }, [addStudentMutate.error, isAddMode, editStudentMutate])

  const handleChange = (name: keyof FormDataType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }))
    if (addStudentMutate.data || addStudentMutate.error) {
      addStudentMutate.reset()
    }
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isAddMode) {
      // c1 using mutate vs onSuccess
      addStudentMutate.mutate(formData, {
        onSuccess: () => {
          setFormData(initialFormData)
          toast.success('Add Success')
        }
      })
    } else {
      editStudentMutate.mutate(undefined, {
        onSuccess: (_) => {
          toast.success('Update Success')
        }
      })
    }
    // c2 using mutateAsync
    // try {
    //   await editStudentMutate.mutateAsync(formData)
    //   setFormData(initialFormData)
    // } catch (error) {
    //   console.log(error)
    // }
  }
  useEffect(() => {
    if (studentQuery.data) {
      setFormData(studentQuery.data.data)
    }
  }, [studentQuery.data])

  return (
    <div>
      <h1 className='text-lg'>{isAddMode ? 'Add' : 'Edit'} Student</h1>
      <form onSubmit={handleSubmit} className='mt-6'>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            value={formData.email}
            onChange={handleChange('email')}
            type='text'
            name='floating_email'
            id='floating_email'
            className={classNames(
              'peer block w-full appearance-none border-0 border-b-2  bg-transparent px-0 py-2.5 text-sm text-gray-900  focus:outline-none focus:ring-0',
              {
                'border-gray-300 focus:border-blue-600': Boolean(!errorForm),
                'border-red-500 focus:border-red-600': Boolean(errorForm)
              }
            )}
            placeholder=' '
            required
          />
          <label
            htmlFor='floating_email'
            className={classNames(
              'ppeer-focus:dark:text-blue-500 absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform  text-sm duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium',
              {
                'text-red-700 peer-focus:text-red-600  ': Boolean(errorForm),
                'text-gray-500 peer-focus:text-blue-600  ': Boolean(!errorForm)
              }
            )}
          >
            Email address
          </label>
          {errorForm && (
            <p className='mt-3 text-sm text-red-700'>
              <span className='font-medium'>Erorr! </span>
              {errorForm.email}
            </p>
          )}
        </div>

        <div className='group relative z-0 mb-6 w-full'>
          <div>
            <div>
              <div className='mb-4 flex items-center'>
                <input
                  onChange={handleChange('gender')}
                  id='gender-1'
                  type='radio'
                  name='gender'
                  value={gender.male}
                  checked={formData.gender === gender.male}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 '
                />
                <label htmlFor='gender-1' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Male
                </label>
              </div>
              <div className='mb-4 flex items-center'>
                <input
                  onChange={handleChange('gender')}
                  id='gender-2'
                  type='radio'
                  name='gender'
                  value={gender.female}
                  checked={formData.gender === gender.female}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 '
                />
                <label htmlFor='gender-2' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Female
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  onChange={handleChange('gender')}
                  value={gender.other}
                  checked={formData.gender === gender.other}
                  id='gender-3'
                  type='radio'
                  name='gender'
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 '
                />
                <label htmlFor='gender-3' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            onChange={handleChange('country')}
            value={formData.country}
            type='text'
            name='country'
            id='country'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 '
            placeholder=' '
            required
          />
          <label
            htmlFor='country'
            className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Country
          </label>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              onChange={handleChange('first_name')}
              value={formData.first_name}
              type='tel'
              // pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}'
              name='first_name'
              id='first_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 '
              placeholder=' '
              required
            />
            <label
              htmlFor='first_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              First Name
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              onChange={handleChange('last_name')}
              value={formData.last_name}
              type='text'
              name='last_name'
              id='last_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 '
              placeholder=' '
              required
            />
            <label
              htmlFor='last_name'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Last Name
            </label>
          </div>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              onChange={handleChange('avatar')}
              value={formData.avatar}
              type='text'
              name='avatar'
              id='avatar'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 '
              placeholder=' '
              required
            />
            <label
              htmlFor='avatar'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Avatar Base64
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              onChange={handleChange('btc_address')}
              value={formData.btc_address}
              type='text'
              name='btc_address'
              id='btc_address'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 '
              placeholder=' '
              required
            />
            <label
              htmlFor='btc_address'
              className='absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              BTC Address
            </label>
          </div>
        </div>

        <button
          type='submit'
          className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto'
        >
          {isAddMode ? 'Add' : 'Edit'}
        </button>
      </form>
    </div>
  )
}
