# Notes

### Project Overview
The project consists of a Vue.js front-end application for the take home challenge. The following projects are used substantially in this project.

- Typescript. Typescript was chosen as the default language. 
  - I wanted to take the opportunity to re-immerse myself with the language since it's been a few years since I've used it.
  - I also took the opportunity to take advantage of Typescript's typing and interfaces.
- TailwindCss. I used tailwindcss for quick and easy styling of the application.
- DaisyUI. I used DaisyUI for standardized UI widgets and semantic markup and styling utilities that leverage tailwindcss.
- Composition API. I used this as an opportunity to become familiar with Vue.js Composition API. My last experiences with Vue.js involved using the older, Options API. Composition API seems better suited for re-use and separating logic.
- Playwright Headless Testing. I used Playwright for testing in lieu of granular unit testing given the time constraints. Given more time, I would have opted for also unit testing Vue components, probably using vitest which is compatible with jasmine's `expect()` api. 

#### Project Structure
The project follows standard structure for Vue.js applications. The application root (`/`) points to the HomeView.vue.

##### Components
Components central to the challenge are located in the `/components/` folder.
- SearchInput.vue
  - Reusable input and related buttons to handle searching by user. 
  - `HomeView.vue` listens for these events:
    - `search` event fires when user types 3 or more chars into SearchInput, indicating intent to retrieve character records using 2 data points
      - `term` This is the string search term to be used. This is based on the user's typed chars.
      - `field` This is the field to search on. This can be set to `name|race` and is set to `name` by default. Represented by a dropdown select
    - `save` event fires when user clicks the `Save` button of the SearchInput component. Instructs HomeView to trigger showing add Search form, allowing the user to save the current search.
    - `manage-search` event fires when uses clicks the "gear" icon button. This allows the user to view manage their searches directly. 
- SearchManager.vue
  - Reusable component to allow the user to manage their searches including:
    - Add/Remove SearchLists
    - Add/Remove Searches assigned to SearchLists
    - Apply a saved Search
  - `HomeView.vue` listens for these events:
    - `use-search` event fires when a user clicks on a `Use` action button for a saved Search in the table of saved searches in the SearchManager. This signals the parent control (HomeView.vue) to fetch data based on `term` and `field` as prescribed by the saved Search.
    - `cancel-search` event fires when the user clicks the `Close` button signalling intent to close the SearchManager. Also handled by HomeView.vue.

#### Testing
As mentioned, testing centered around e2e testing using Playwright testing framework. Time constraints and resources typically dictate testing strategy. 

In this case, e2e or feature tests were a good choice, given constraints. Ideally, granular unit testing components would be implemented. Essentially, I am relying on "implied test assertions" for the component by virtue of the fact they work in the e2e tests.

e2e tests could have had more edge cases covered, particularly in proofing minutiae of UI interaction between elements, disabling/enabling and state management for widgets between SearchManager and SearchInput constituent controls.