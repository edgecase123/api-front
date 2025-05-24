<script setup lang="ts">
import {ref} from 'vue'
import type Character from '@/types/Character.ts'
const data: Character[] = ref<Character[]>([
  {
    "name": "Belegorn",
    "wikiUrl": "http://lotr.wikia.com//wiki/Belegorn",
    "race": "Human",
    "birth": "TA 2074",
    "death": "TA 2204",
  },
  {
    "name": "Celegorm",
    "wikiUrl": "http://lotr.wikia.com//wiki/Celegorm",
    "race": "Elf",
    "birth": "During in the ,Noontide of Valinor",
    "death": "FA 506",
  },
  {
    "name": "Legolas",
    "wikiUrl": "http://lotr.wikia.com//wiki/Legolas",
    "race": "Elf",
    "birth": null,
    "death": "Still alive, departed to ,Aman ,FO 120",
  },
  {
    "name": "Legolas (elf of Gondolin)",
    "wikiUrl": "http://lotr.wikia.com//wiki/Legolas_(elf_of_Gondolin)",
    "race": "Elf",
    "birth": null,
    "death": null,
  }
])

</script>

<template>
  <div class="flex w-full mx-auto md:mt-40">
      <div id="app" class="p-4">
        <div class="navbar bg-base-100 shadow-sm">
          <div class="flex-1">
            <a class="btn btn-ghost text-xl">daisyUI</a>
          </div>
          <div class="flex gap-2">
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
              </div>
              <ul
                tabindex="0"
                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li>
                  <a class="justify-between">
                    Profile
                    <span class="badge">New</span>
                  </a>
                </li>
                <li><a>Settings</a></li>
                <li><a>Logout</a></li>
              </ul>
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
            <tr v-if="data.length === 0">
              <td :colspan="4" class="text-center py-4 text-secondary text-2xl">
                No data available
              </td>
            </tr>

            <tr
              class="p-0"
              v-for="(item, index) in data"
              :key="index">
              <td v-if="item.wikiUrl">
                <a v-if="item.wikiUrl" :href="item.wikiUrl" target="_blank"
                  class="app-link">{{ item.name }}</a>
                <span v-else>{{ item.name }}</span>
              </td>
              <td>{{ item.race }}</td>
              <td>{{ item.birth ?? 'Unknown' }}</td>
              <td>{{ item.death ?? 'Unknown' }}</td>
            </tr>
            </tbody>
          </table>
          <!--    <div class="flex items-center justify-center mt-4">-->
          <!--      <div v-if="busy" class="text-info vertical">-->
          <!--        <i class='bx bx-loader bx-spin mt-8 bx-lg'></i>-->
          <!--      </div>-->
          <!--    </div>-->
        </div>
      </div>
  </div>
</template>
