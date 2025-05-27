<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type Character from '@/types/Character.ts'
import { getCharacters } from '@/composables/api.ts'
import type { CharacterApiResponse } from '@/types/CharacterApiResponse.ts'
import SearchInput, { type SearchPayloadEvent } from '@/components/SearchInput.vue'
import SearchManager from '@/components/SearchManager.vue'

const data = ref<Character[]>([])
const loading = ref(false)
const searchManager = ref<InstanceType<typeof SearchManager> | null>(null)
const showSearchManager = ref(false)
const searchInput = ref<InstanceType<typeof SearchInput> | null>(null)

const handleSearch = async (payload: SearchPayloadEvent) => {
  if (!payload) {
    console.log('Remove filter and display all')
  } else {
    console.log('Fetch Records based on search', payload)
  }

  await fetchData(payload)
}

const handleSave = (payload: SearchPayloadEvent) => {
  console.log('handleSave', payload)

  if (payload && payload.selectedField && payload.searchTerm) {
    showSearchManager.value = true

    searchManager.value?.triggerShowForm({
      term: payload.searchTerm,
      field: payload.selectedField,
    })
  }
}

// Handle use-search event
const handleUseSearch = async (search: { term: string; field: string }) => {
  console.log('Using a saved search', search)
  showSearchManager.value = false
  searchInput.value?.setSearch(search.term, search.field)
  await fetchData({ searchTerm: search.term, selectedField: search.field })
}

const handleManageSearch = () => {
  showSearchManager.value = true
}

const handleHideSearch = async () => {
  showSearchManager.value = false
}

const fetchData = async (searchData?: SearchPayloadEvent | null) => {
  loading.value = true
  data.value = []

  try {
    const response: CharacterApiResponse = await getCharacters(
      searchData?.searchTerm ?? null,
      searchData?.selectedField ?? null,
    )

    console.log(response)
    data.value = response.data as Character[]
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  document.title = 'LoR Character Search'
})
</script>
<template>
  <div class="flex w-full mx-auto md:mt-40">
    <div class="p-4">
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
                <img alt="Tailwind CSS Navbar component" :src="'/images/gandalf.png'" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="showSearchManager" class="flex w-full">
        <SearchManager
          ref="searchManager"
          @use-search="handleUseSearch"
          @cancel-search="handleHideSearch" />
      </div>

      <div v-show="!showSearchManager" class="pt-4 pb-2 float-right">
        <SearchInput
          :fields="{ name: 'Name', race: 'Race' }"
          :min-chars="3"
          ref="searchInput"
          @search="handleSearch"
          @save="handleSave"
          @manageSearch="handleManageSearch"
        />
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
              <td :colspan="4" class="text-center py-4 text-secondary text-2xl">Loading...</td>
            </tr>

            <tr class="p-0" v-for="(item, index) in data" :key="index">
              <td>
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
