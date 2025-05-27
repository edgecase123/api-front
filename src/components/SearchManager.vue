<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

// Interfaces
interface SearchList {
  id: number
  name: string
}

interface Search {
  id: number
  term: string
  field: string
}

export interface SearchInput {
  term: string
  field: string
}

export default defineComponent({
  name: 'SearchManager',
  emits: ['use-search', 'cancel-search'],
  setup(_, { emit }) {
    // Reactive state
    const searchLists = ref<SearchList[]>([])
    const searches = ref<Search[]>([])
    const selectedSearchListId = ref<string>('')
    const isLoadingSearchLists = ref<boolean>(false)
    const isLoadingSearches = ref<boolean>(false)
    const isSaving = ref<boolean>(false)
    const errorMessage = ref<string>('')
    const form = ref<SearchInput>({ term: '', field: '' })
    const showForm = ref<boolean>(false)
    const newSearchListName = ref<string | null>(null)

    // Show the form and pre-fill form data/fields
    const triggerShowForm = (payload: SearchInput) => {
      form.value = { term: payload.term, field: payload.field }
      showForm.value = true
    }

    // Fetch favorite SearchLists from Laravel
    const fetchSearchLists = async () => {
      isLoadingSearchLists.value = true
      try {
        const url = import.meta.env.VITE_APP_BACKEND + '/searchlist'

        const response = await axios.get(url)
        console.log(response)
        searchLists.value = response.data
      } catch (error) {
        console.error('Error fetching search lists:', error)
      } finally {
        isLoadingSearchLists.value = false
      }
    }

    // Fetch saved searches for the selected SearchList
    const fetchSearches = async () => {
      if (!selectedSearchListId.value) {
        searches.value = []
        return
      }

      isLoadingSearches.value = true
      try {
        // /searchlist/{id}/searches
        const url =
          import.meta.env.VITE_APP_BACKEND + `/searchlist/${selectedSearchListId.value}/searches`
        const response = await axios.get(url)
        searches.value = response.data
      } catch (error) {
        console.error('Error fetching searches:', error)
        searches.value = []
      } finally {
        isLoadingSearches.value = false
      }
    }

    // Create a new SearchList
    const createSearchList = async () => {
      if (!newSearchListName.value) {
        errorMessage.value = 'A name for the new SearchList is required'
        const newNameInput = document.getElementById('newSearchListName')
        if (newNameInput) newNameInput.focus()

        return
      }

      try {
        isSaving.value = true
        errorMessage.value = ''

        const url = import.meta.env.VITE_APP_BACKEND + `/searchlist`

        const response = await axios.post(url, {
          name: newSearchListName.value,
        })

        console.log(response)

        newSearchListName.value = ''
        await fetchSearchLists()
      } catch (error) {
        console.log(error)

        if (axios.isAxiosError(error) && error.status === 419) {
          errorMessage.value = 'Attempt to create duplicate SearchList. Choose another name'
        } else {
          errorMessage.value = 'Failed to create SearchList'
        }
      } finally {
        isSaving.value = false
      }
    }

    // Save a new search
    const saveSearch = async () => {
      if (!selectedSearchListId.value) {
        errorMessage.value = 'A Search List has to be selected'
        return
      }

      if (!form.value.term || !form.value.field) {
        errorMessage.value = 'Both term and field are required'
        return
      }

      isSaving.value = true
      errorMessage.value = ''

      try {
        const url =
          import.meta.env.VITE_APP_BACKEND + `/searchlist/${selectedSearchListId.value}/searches`

        const response = await axios.post(url, {
          term: form.value.term,
          field: form.value.field,
        })

        if (response.status === 409) {
          errorMessage.value = 'Attempt to save duplicate search to same list. Choose another list.'
          return
        }

        resetForm()
        await fetchSearches()
      } catch (error) {
        console.error('Error saving search:', error)

        if (axios.isAxiosError(error) && error.response?.status === 409) {
          errorMessage.value = 'Attempt to save duplicate search. Choose another list.'
        } else {
          errorMessage.value = 'Failed to save search'
        }
      } finally {
        isSaving.value = false
      }
    }

    const deleteSearchList = async () => {
      if (!selectedSearchListId.value) {
        return
      }

      if (!confirm(`Delete the selected SearchList?`)) {
        return
      }

      try {
        isSaving.value = true
        errorMessage.value = ''

        const url = import.meta.env.VITE_APP_BACKEND + `/searchlist/${selectedSearchListId.value}`
        const response = await axios.delete(url)
        console.log(response)
        newSearchListName.value = ''
        searches.value = []
        await fetchSearchLists()
      } catch (error) {
        console.log(error)
        errorMessage.value = 'Failed to delete SearchList'
      } finally {
        isSaving.value = false
      }
    }

    /**
     * delete a saved search.
     * @param searchId
     */
    const deleteSearch = async (searchId: number) => {
      if (!confirm('Are you sure you want to delete this search?')) return

      try {
        ///searchlist/{listId}/searches/{searchId}/delete
        const url =
          import.meta.env.VITE_APP_BACKEND +
          `/searchlist/${selectedSearchListId.value}` +
          `/searches/${searchId}`

        await axios.delete(url)
        await fetchSearches()
      } catch (error) {
        console.error('Error deleting search:', error)
      }
    }

    // Fires when a saved search is "used". Allows the parent/view component
    // apply a selected saved search by the usr
    const useSearch = (search: Search) => {
      emit('use-search', { term: search.term, field: search.field })
    }

    const exitSearch = () => {
      console.log('firing cancel-search')
      emit('cancel-search')
    }

    // Resets the form and hides it
    const resetForm = () => {
      form.value = { term: '', field: '' }
      errorMessage.value = ''
      showForm.value = false
    }

    // Load the Search Lists from the current user
    onMounted(() => {
      fetchSearchLists()
    })

    return {
      errorMessage,
      form,
      isLoadingSearchLists,
      isLoadingSearches,
      isSaving,
      newSearchListName,
      searchLists,
      searches,
      selectedSearchListId,
      showForm,
      createSearchList,
      deleteSearchList,
      deleteSearch,
      exitSearch,
      fetchSearches,
      resetForm,
      saveSearch,
      triggerShowForm,
      useSearch,
    }
  },
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-full min-h-30 w-full gap-4 p-4">
    <!-- Left Div: SearchList Select Shows all SearchLists for the "user" -->
    <div class="w-full md:w-1/3">
      <h1 class="text-lg">Select a Search List</h1>
      <select
        id="search-list-select"
        v-model="selectedSearchListId"
        class="select select-bordered w-full h-3/4 max-h-40 text-lg"
        :disabled="isLoadingSearchLists"
        @change="fetchSearches"
        size="5"
      >
        <option v-for="list in searchLists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>
      <div class="flex flex-row gap-2 w-full justify-end p-2">
        <input
          id="newSearchListName"
          v-model="newSearchListName"
          type="text"
          class="input input-neutral h-8 float-left"
          placeholder="Enter name of new SearchList..."
          pattern="^[A-Za-z]*$"
          @keydown.esc="newSearchListName = ''"
          @keydown.enter="createSearchList"
        />
        <button
          class="btn btn-primary btn-sm flex-1 max-w-18 float-right"
          @click="createSearchList"
        >
          Add
        </button>
        <button class="btn btn-error btn-sm flex-1 max-w-18 float-right" @click="deleteSearchList">
          Delete
        </button>
      </div>
    </div>

    <!-- Right Div: Searches Table and Form. Only one is shown depending on state -->
    <div class="w-full md:w-2/3 flex flex-col gap-4">
      <div class="pl-4">
        <h2 class="text-secondary">Search Count: {{ searches.length }}</h2>
      </div>
      <!-- Saved Searches Table -->
      <div v-show="!showForm" class="overflow-y-auto min-h-36 max-h-40">
        <table class="table text-sm">
          <thead>
            <tr>
              <th>Term</th>
              <th>Field</th>
              <th class="float-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoadingSearches">
              <td colspan="4" class="text-center">Loading searches...</td>
            </tr>
            <tr v-else-if="searches.length === 0">
              <td colspan="4" class="text-center">No searches found</td>
            </tr>
            <tr v-else v-for="search in searches" :key="search.id">
              <td>{{ search.term }}</td>
              <td>{{ search.field }}</td>
              <td class="p-4">
                <button
                  class="btn btn-xs btn-secondary mr-2 float-right"
                  @click="useSearch(search)"
                >
                  Use
                </button>
                <button class="btn btn-xs btn-error float-right" @click="deleteSearch(search.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--
      Search Form (shown only when showForm is true). Provides a way to trigger the
      component to save a new Search to a SearchList. See the triggerShowForm() function
      -->
      <div v-if="showForm" class="card bg-base-100 shadow-xl p-4">
        <h2 class="text-lg font-bold mb-4">Add New Search</h2>
        <form @submit.prevent="saveSearch" class="flex flex-col gap-4">
          <div class="form-control">
            <label class="label mr-10"> <span class="label-text">Term</span>&nbsp;&nbsp; </label>
            <input
              v-model="form.term"
              type="text"
              class="input input-bordered text-sm"
              placeholder="Enter search term"
              readonly
              required
            />
          </div>

          <div class="form-control">
            <label class="label"> <span class="label-text">Field</span>&nbsp;&nbsp; </label>
            <input
              v-model="form.field"
              type="text"
              class="input input-bordered text-sm"
              placeholder="Enter field"
              required
              readonly
            />
          </div>

          <div class="flex gap-2">
            <button
              id="btn-add-search"
              type="submit"
              class="btn btn-primary"
              :disabled="!selectedSearchListId || isSaving"
            >
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>

            <button type="button" class="btn btn-ghost" @click="resetForm" :disabled="isSaving">
              Cancel
            </button>
          </div>

          <p v-if="errorMessage" class="text-error text-sm mt-2">
            {{ errorMessage }}
          </p>
        </form>
      </div>

      <div v-show="!showForm" class="flex flex-row gap-2 w-full justify-between pr-4">
        <p class="text-error font-bold float-left">
          {{ errorMessage }}
        </p>

        <button class="btn btn-error btn-sm flex-1 max-w-18 float-right" @click="exitSearch">
          Close
        </button>
      </div>
    </div>
  </div>
</template>
