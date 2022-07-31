import type { Page } from 'puppeteer'

export async function login(page: Page, email: string, password: string): Promise<boolean> {
  await page.goto('https://app.wodify.com/WodifyClient/Login')
  await page.waitForSelector('#Input_UsernameVal')

  await page.type('#Input_UsernameVal', email)
  await page.type('#Input_PasswordVal', password)

  await page.waitForNetworkIdle()
  await page.click('button[type=submit]')

  await page.waitForNetworkIdle()

  // TODO: determine if login worked and throw error if not

  return true
}

export async function workoutComponentsForDate(page: Page, date: Date): Promise<WorkoutComponent[]> {
  await page.evaluate((dateString) => {
    localStorage.setItem('$OS_W_Theme_UI$WodifyClient_CS$ClientVars$SelectedDate', dateString)
  }, date.toISOString().slice(0, 10))
  await page.goto('https://app.wodify.com/WodifyClient/Exercise')
  const response = await page.waitForResponse(
    'https://app.wodify.com/WodifyClient/screenservices/WodifyClient_Performance/Exercise_Server/Exercise/DataActionGetAllData'
  )
  const data = (await response.json()) as GetAllDataResponse
  return data.data.ResponseWorkout.ResponseWorkoutActions.WorkoutComponents.List
}

export function primaryWorkout(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  const mainComponents = []
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
