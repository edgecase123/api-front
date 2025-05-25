<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type Character from '@/types/Character.ts'
import { getCharacters } from '@/composables/api.ts'
import type { CharacterApiResponse } from '@/types/CharacterApiResponse.ts'

const data = ref<Character[]>([])
const loading = ref(false)

const fetchData = async () => {

  loading.value = true

  try {
    const response: CharacterApiResponse = await getCharacters('Dwarf', 'race')
    console.log(response)

    data.value = response.data as Character[]

  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
<template>
  <div class="flex w-full mx-auto md:mt-40">
    <div id="app" class="p-4">
      <div class="navbar bg-base-100 shadow-sm">
        <div class="flex-1">
          <a class="btn btn-ghost text-xl">LoR Character Search</a>
          <div class="ml-4 pl-4">
            <span class="text-neutral-400">Records: {{ data.length }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="dropdown dropdown-end">
            <div tabindex="0" class="btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  :src="'/images/gandalf.png'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="table-container overflow-x-hidden">
        <table class="table table-lg table-fixed row-hover w-full">
          <thead>
            <tr class="bg-base-200">
              <th class="text-lg">Name</th>
              <th class="text-lg">Race</th>
              <th class="text-lg">Birth</th>
              <th class="text-lg">Death</th>
            </tr>
          </thead>
          <tbody>
            <!-- Conditionally show busy indicator row or no data row -->
            <tr v-if="data.length === 0 && !loading">
              <td :colspan="4" class="text-center py-4 text-secondary text-2xl">
                No data available
              </td>
            </tr>

            <tr v-if="loading">
              <td :colspan="4" class="text-center py-4 text-secondary text-2xl">
                Loading...
              </td>
            </tr>

            <tr class="p-0" v-for="(item, index) in data" :key="index">
              <td v-if="item.wikiUrl">
                <a v-if="item.wikiUrl" :href="item.wikiUrl" target="_blank" class="app-link">{{
                  item.name
                }}</a>
                <span v-else>{{ item.name }}</span>
              </td>
              <td>{{ item.race }}</td>
              <td>{{ item.birth ?? 'Unknown' }}</td>
              <td>{{ item.death ?? 'Unknown' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
