import axios, {type AxiosResponse} from "axios";
import type { CharacterApiResponse } from '@/types/CharacterApiResponse.ts'

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BACKEND,
  withCredentials: true,
  withXSRFToken: true,
})

interface CharacterParams {
  term?: string | null,
  field?: string | null,
}

export const getCharacters = async (term?: string | null, field?: string | null): Promise<CharacterApiResponse> => {
  const params: CharacterParams = {}

  if (term) {
    if (!field) {
      throw new Error('When term param field is supplied, field param is also required')
    }

    params.term = term
    params.field = field
  }

  const response: AxiosResponse = await api.get('/character', {
    params: params,
  })

  return response.data
}

export const getCookieValue = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

export const getCsrfToken = async () => {
  await api.get('sanctum/csrf-cookie')

  return getCookieValue('XSRF-TOKEN')
}
