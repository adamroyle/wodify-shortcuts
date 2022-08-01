import type { Page } from 'puppeteer-core'

const BASE = 'https://app.wodify.com/WodifyClient'
const LOGIN_URL = `${BASE}/Login`
const LOGIN_DATA_URL = `${BASE}/screenservices/WodifyClient/ActionDo_Login`
const WORKOUT_URL = `${BASE}/Exercise`
const WORKOUT_DATA_URL = `${BASE}/screenservices/WodifyClient_Performance/Exercise_Server/Exercise/DataActionGetAllData`

export async function login(page: Page, email: string, password: string): Promise<boolean> {
  await page.goto(LOGIN_URL)
  await page.waitForSelector('#Input_UsernameVal')

  await page.type('#Input_UsernameVal', email)
  await page.type('#Input_PasswordVal', password)

  await page.waitForNetworkIdle()
  await page.click('button[type=submit]')

  await page.waitForResponse(LOGIN_DATA_URL)

  // TODO: determine if login worked and throw error if not?

  return true
}

export async function workoutComponentsForDate(page: Page, date: string): Promise<WorkoutComponent[]> {
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    if (request.url() === WORKOUT_DATA_URL) {
      const body = JSON.parse(request.postData() || '{}')
      body.screenData.variables.ClientVariables.SelectedDate = date
      request.continue({ postData: JSON.stringify(body) })
    } else {
      request.continue()
    }
  })
  await page.goto(WORKOUT_URL)
  const response = await page.waitForResponse(WORKOUT_DATA_URL)
  const data = (await response.json()) as GetAllDataResponse
  return data.data.ResponseWorkout.ResponseWorkoutActions.WorkoutComponents.List
}

export function getPrimaryWorkout(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  const mainComponents: WorkoutComponent[] = []
  let includeSection = false
  for (let i = 0; i < workoutComponents.length; i++) {
    const component = workoutComponents[i]
    if (component.IsSection) {
      includeSection = component.Name === 'Pre-Metcon' || component.Name === 'Metcon'
    }
    if (includeSection) {
      mainComponents.push(component)
    }
  }
  return mainComponents
}

export function formatWorkout(workoutComponents: WorkoutComponent[]): string {
  const includeSections = workoutComponents.filter((c) => c.IsSection).length > 1
  return workoutComponents
    .filter(includeSections ? Boolean : (c) => !c.IsSection)
    .filter(excludeEmptySections)
    .map(formatWorkoutComponent)
    .join('\n\n')
}

function formatWorkoutComponent(component: WorkoutComponent): string {
  if (component.IsSection) {
    return component.Name
  }
  return [
    [component.Name, component.Description].filter(Boolean).join('\n'),
    component.TotalWeightLiftingComponents.List.join('\n'),
    component.Comment,
  ]
    .filter(Boolean)
    .join('\n\n')
}

interface GetAllDataResponse {
  data: {
    ResponseWorkout: {
      ResponseWorkoutActions: {
        WorkoutComponents: {
          List: WorkoutComponent[]
        }
      }
    }
  }
}

export interface WorkoutComponent {
  Name: string
  IsSection: boolean
  Comment: string
  Description: string
  TotalWeightLiftingComponents: { List: string[]; EmptyListItem?: string }
}

function excludeEmptySections(c: WorkoutComponent, i: number, arr: WorkoutComponent[]) {
  return !(c.IsSection && arr[i + 1].IsSection)
}
