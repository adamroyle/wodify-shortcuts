import type { WorkoutComponent } from './types.js'

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
    .replace(/\r/g, '') // remove carriage returns
    .replace(/[\t ]+$/gm, '') // remove trailing whitespace
    .replace(/\n\n\n+/g, '\n\n') // remove extra newlines
}

function formatWorkoutComponent(component: WorkoutComponent): string {
  if (component.IsSection) {
    return component.Name.trim().toLocaleUpperCase()
  }
  return [
    [
      cleanWorkoutName(component.Name, component.Description.trim() || component.Comment.trim()),
      removeFillerText(component.Description),
    ]
      .filter(Boolean)
      .join('\n'),
    component.TotalWeightLiftingComponents.List.join('\n'),
    removeFillerText(component.Comment.trim()),
  ]
    .filter(Boolean)
    .join('\n\n')
}

function excludeEmptySections(c: WorkoutComponent, i: number, arr: WorkoutComponent[]) {
  return !(c.IsSection && (i + 1 === arr.length || arr[i + 1].IsSection))
}

function cleanWorkoutName(name: string, description: string): string {
  name = name.trim()
  if (name.toLowerCase() == 'metcon') {
    return ''
  }
  if (description.toLocaleLowerCase().startsWith(name.toLocaleLowerCase())) {
    return ''
  }
  return name
}

function removeFillerText(text: string): string {
  return text.replace(/^(Athlete Instructions|Instructions|Athlete Notes|Extra Details)$/gim, '')
}
