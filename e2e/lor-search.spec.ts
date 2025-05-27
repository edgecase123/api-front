import { test, expect, Page } from '@playwright/test'

async function waitForUrl(page: Page, url: string) {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes(url) && response.status() === 200,
  )

  await responsePromise
}

test.describe('League Search View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForUrl(page, '/api/v1/character')
  })

  test('It can load the page', async ({ page }) => {
    await expect(page).toHaveTitle(/LoR Character Search/)
  })

  test('It creates a new SearchList', async ({ page }) => {
    // Now save the search
    // Open the save form in SearchManager
    const saveButton = page.locator('button#btn-manager-search')
    expect(saveButton).toBeDefined()
    await expect(saveButton).toBeVisible()
    await saveButton.click()
    const form = page.getByRole('form')
    expect(form).toBeDefined()
    // Fill in text for the name of the search list
    const searchListName = page.getByRole('textbox', { name: 'Enter name of new SearchList' })
    expect(searchListName).toBeDefined()
    const unique = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substring(2, 10)
    const name = `TestSave ${unique}`
    await searchListName.fill(name)
    // Now click the Add button
    const addButton = page.getByRole('button', { name: 'Add' })
    expect(addButton).toBeDefined()
    await addButton.click()
    await waitForUrl(page, '/api/v1/searchlist')
    // Verify new search list create is now displayed in select list
    const searchListSelect = page.locator('select')
    expect(searchListSelect).toBeDefined()
    const option = searchListSelect.getByText(name)
    expect(option).toBeDefined()
  })

  test('It filters the list and save the filter', async ({ page }) => {
    await expect(page).toHaveTitle(/LoR Character Search/)
    const searchInput = page.getByRole('textbox', { name: 'Enter search term...' })
    expect(searchInput).toBeDefined()

    const table = page.getByRole('table')
    await expect(table).toBeVisible()
    await expect(table).toHaveCount(1)
    const body = table.locator('tbody')
    await expect(body).toHaveCount(1)
    const rows = body.getByRole('row')
    expect(rows).toBeDefined()
    expect(await rows.count()).toBe(100)

    // Search for Gandalf
    await searchInput.fill('gan')
    await waitForUrl(page, '/api/v1/character')
    expect(await rows.count()).toBe(3)

    // Fill the input with a random data so no dupes are used
    // If dupe is used, api call fails and test fails
    const randoChars = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substring(2, 6)
    console.log('random chars', randoChars)
    await searchInput.fill(randoChars)
    await waitForUrl(page, '/api/v1/character')

    // Activate the save search form
    const saveSearchButton = page.locator('#btn-save-search')
    expect(saveSearchButton).toBeDefined()
    await saveSearchButton.click()
    const form = page.getByRole('form')
    expect(form).toBeDefined()

    // Select the first item in the SearchList select
    const searchListSelect = page.locator('#search-list-select')
    await expect(searchListSelect).toBeVisible()
    await searchListSelect.selectOption({ index: 0 })
    const selected = searchListSelect.locator('option:checked')
    await expect(selected).toBeVisible()

    // Click teh save button on the form to save the search to the selected
    // SearchList
    const addSearchButton = page.locator('#btn-add-search')
    expect(addSearchButton).toBeDefined()
    await addSearchButton.click()
    await waitForUrl(page, 'api/v1/searchlist')
  })
})
