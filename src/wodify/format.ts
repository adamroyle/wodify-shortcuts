import type { WorkoutComponent } from './types.js'

export function filterWorkout(
  workoutComponents: WorkoutComponent[],
  includeSections: string[],
  excludeSections: string[]
): WorkoutComponent[] {
  includeSections = includeSections.map((s) => s.toLowerCase())
  excludeSections = excludeSections.map((s) => s.toLowerCase())
  const mainComponents: WorkoutComponent[] = []
  let includeSection = false
  for (let i = 0; i < workoutComponents.length; i++) {
    const component = workoutComponents[i]
    if (component.IsSection) {
      includeSection = true
      if (includeSections.length > 0) {
        includeSection = includeSections.some((s) => component.Name.toLowerCase().includes(s))
      }
      if (includeSection && excludeSections.length > 0) {
        includeSection = !excludeSections.some((s) => component.Name.toLowerCase().includes(s))
      }
    }
    if (includeSection) {
      mainComponents.push(component)
    }
  }
  return mainComponents
}

export function getPrimaryWorkout(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  return filterWorkout(workoutComponents, ['Metcon'], [])
}

export function formatWorkout(workoutComponents: WorkoutComponent[]): string {
  const includeSections = workoutComponents.filter((c) => c.IsSection).length > 1
  return workoutComponents
    .filter(includeSections ? Boolean : (c) => !c.IsSection)
    .filter(excludeEmptySections)
    .map(htmlToPlainText)
    .map(trimmed)
    .map(formatWorkoutComponent)
    .join('\n\n')
    .replace(/\r/g, '') // remove carriage returns
    .replace(/[\t ]+$/gm, '') // remove trailing whitespace
    .replace(/\n\n\n+/g, '\n\n') // remove extra newlines
}

function formatWorkoutComponent(c: WorkoutComponent, i: number, arr: WorkoutComponent[]): string {
  if (c.IsSection) {
    return [c.Name.toLocaleUpperCase(), removeFillerText(c.Comment)].filter(Boolean).join('\n\n')
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

function htmlToPlainText(c: WorkoutComponent): WorkoutComponent {
  const Comment = c.Comment.replace(/<br \/>/g, '\n').replace(/<[^>]+>/g, '')
  const Description = c.Description.replace(/<br \/>/g, '\n').replace(/<[^>]+>/g, '')
  return { ...c, Comment, Description }
}

function excludeEmptySections(c: WorkoutComponent, i: number, arr: WorkoutComponent[]) {
  return !(c.IsSection && !c.Comment && (i + 1 === arr.length || arr[i + 1].IsSection))
}

function workoutName(component: WorkoutComponent, section?: WorkoutComponent): string {
  const name = component.Name
  const lcName = name.toLowerCase()
  const lcSectionName = section?.Name.toLowerCase() || ''
  const lcDescription = component.Description.toLowerCase()
  const lcComment = component.Comment.toLowerCase()

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
