<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { SearchData } from '@/components/SearchManager.vue'

export interface Props {
  minChars: number
  fields: Record<string, string>
}

export interface SearchPayloadEvent {
  searchTerm?: string | null
  selectedField?: string | null
}

export default defineComponent({
  name: 'SearchInput',
  props: {
    minChars: {
      type: Number,
      required: true,
    },
    fields: {
      type: Object as () => Record<string, string>,
      required: true,
    },
  },
  emits: ['search', 'save', 'manage-search'],
  setup(props: Props, { emit }) {
    const searchTerm = ref('')
    const selectedField = ref(Object.keys(props.fields)[0] ?? '')

    let searchTimeout: ReturnType<typeof setTimeout> | null = null
    const validInputRegex = /^[a-zA-Z][a-zA-Z0-9]*$/

    const handleInput = (event: Event) => {
      const input = (event.target as HTMLInputElement).value

      // Check if the input is valid
      if (input === '' || validInputRegex.test(input)) {
        searchTerm.value = input
        // invalidInput.value = false
      } else {
        // If invalid, keep the last valid value and show error
        // invalidInput.value = true
        return
      }

      if (searchTimeout) clearTimeout(searchTimeout)

      searchTimeout = setTimeout(() => {
        if (
          (searchTerm.value.length >= props.minChars || searchTerm.value === '') &&
          selectedField.value
        ) {
          emit('search', {
            searchTerm: searchTerm.value,
            selectedField: selectedField.value,
          } as SearchPayloadEvent)
        }
      }, 300)
    }

    const saveSearch = () => {
      if (searchTerm.value && selectedField.value) {
        emit('save', {
          searchTerm: searchTerm.value,
          selectedField: selectedField.value,
        })
      }
    }

    const setSearch = (term: string, field: string) => {
      searchTerm.value = term
      selectedField.value = field
    }

    const getSearch = (): SearchData => {
      return {term: searchTerm.value, field: selectedField.value}
    }

    const manageSearch = () => {
      console.log('emitting event manage-search')
      emit('manage-search')
    }

    const clearSearch = () => {
      if (searchTerm.value.length < props.minChars) {return}

      searchTerm.value = ''
      emit('search', null)
    }

    // We need to observe selected field and conditionally trigger search
    watch(selectedField, () => {
      if (searchTerm.value.length >= props.minChars && selectedField.value) {
        emit('search', {
          searchTerm: searchTerm.value,
          selectedField: selectedField.value,
        })
      }
    })

    return {
      searchTerm,
      selectedField,
      handleInput,
      saveSearch,
      clearSearch,
      manageSearch,
      setSearch,
      getSearch,
    }
  },
})
</script>

<template>
  <div class="flex flex-row items-center gap-4 w-full max-w-3xl mx-auto">
    <div class="flex flex-row items-center gap-4 w-full">
      <!-- Search input -->
      <input
        v-model="searchTerm"
        type="text"
        class="input input-neutral w-1/3"
        placeholder="Enter search term..."
        pattern="^[A-Za-z][A-Za-z0-9]*$"
        @input="handleInput"
        @keyup.esc="clearSearch"
      />

      <!-- Select dropdown -->
      <select v-model="selectedField" class="select border-neutral w-1/3">
        <option value="" disabled>Select a field</option>
        <option v-for="(label, key) in fields" :key="key" :value="key">
          {{ label }}
        </option>
      </select>

      <!-- Utility buttons -->
      <div class="flex flex-row gap-2 w-1/2">
        <button
          id="btn-save-search"
          class="btn btn-primary flex-1"
          title="Save this search"
          :disabled="!searchTerm || !selectedField || searchTerm.length < minChars"
          @click="saveSearch"
        >
          Save
        </button>
        <button
          class="btn btn-secondary flex-1"
          @click="clearSearch"
          title="Clear Filter"
          :disabled="searchTerm.length < minChars"
        >
          <i class="bx bx-block text-2xl"></i>
        </button>
        <button
          id="btn-manager-search"
          @click="manageSearch"
          class="btn btn-secondary flex-1"
          title="Manage saved searches"
        >
          <i class="bx bx-cog text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>
