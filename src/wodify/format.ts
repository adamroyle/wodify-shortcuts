import type { WorkoutComponent } from './types.js'

export function filterWorkout(
  workoutComponents: WorkoutComponent[],
  includeSections: string[],
  excludeSections: string[]
): WorkoutComponent[] {
  includeSections = includeSections.map((s) => s.toLocaleLowerCase())
  excludeSections = excludeSections.map((s) => s.toLocaleLowerCase())
  const mainComponents: WorkoutComponent[] = []
  let includeSection = false
  for (let i = 0; i < workoutComponents.length; i++) {
    const component = workoutComponents[i]
    if (component.IsSection) {
      if (includeSections.length > 0) {
        includeSection = includeSections.includes(component.Name.toLocaleLowerCase())
      } else if (excludeSections.length > 0) {
        includeSection = !excludeSections.includes(component.Name.toLocaleLowerCase())
      } else {
        includeSection = true
      }
    }
    if (includeSection) {
      mainComponents.push(component)
    }
  }
  return mainComponents
}

export function getPrimaryWorkout(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  return filterWorkout(workoutComponents, ['Pre-Metcon', 'Metcon'], [])
}

export function formatWorkout(workoutComponents: WorkoutComponent[]): string {
  const includeSections = workoutComponents.filter((c) => c.IsSection).length > 1
  return workoutComponents
    .filter(includeSections ? Boolean : (c) => !c.IsSection)
    .filter(excludeEmptySections)
    .map(trimmed)
    .map(formatWorkoutComponent)
    .join('\n\n')
    .replace(/\r/g, '') // remove carriage returns
    .replace(/[\t ]+$/gm, '') // remove trailing whitespace
    .replace(/\n\n\n+/g, '\n\n') // remove extra newlines
}

function formatWorkoutComponent(c: WorkoutComponent, i: number, arr: WorkoutComponent[]): string {
  if (c.IsSection) {
    return c.Name.toLocaleUpperCase()
  }
  const prevSection = arr[i - 1]?.IsSection ? arr[i - 1] : undefined
  return [
    [workoutName(c, prevSection), removeFillerText(c.Description)].filter(Boolean).join('\n'),
    c.TotalWeightLiftingComponents.List.join('\n'),
    removeFillerText(c.Comment),
  ]
    .filter(Boolean)
    .join('\n\n')
}

function trimmed(c: WorkoutComponent): WorkoutComponent {
  return {
    ...c,
    Name: c.Name.trim(),
    Description: c.Description.trim(),
    Comment: c.Comment.trim(),
  }
}

function excludeEmptySections(c: WorkoutComponent, i: number, arr: WorkoutComponent[]) {
  return !(c.IsSection && (i + 1 === arr.length || arr[i + 1].IsSection))
}

function workoutName(component: WorkoutComponent, section?: WorkoutComponent): string {
  const name = component.Name
  const lcName = name.toLocaleLowerCase()
  const lcSectionName = section?.Name.toLocaleLowerCase() || ''
  const lcDescription = component.Description.toLocaleLowerCase()
  const lcComment = component.Comment.toLocaleLowerCase()

  if (
    lcName === lcSectionName ||
    lcDescription.startsWith(lcName) ||
    (!lcDescription && lcComment.startsWith(lcName)) ||
    lcName === 'metcon'
  ) {
    return ''
  }

  return name
}

function removeFillerText(text: string): string {
  return text.replace(/^(Athlete Instructions|Instructions|Athlete Notes|Extra Details)$/gim, '')
}
