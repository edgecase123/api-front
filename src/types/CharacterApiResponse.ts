import type Character from '@/types/Character.ts'

export interface CharacterApiResponse {
  count: number,
  data: Character[],
}
