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

function excludeEmptySections(c: WorkoutComponent, i: number, arr: WorkoutComponent[]) {
  return !(c.IsSection && arr[i + 1]?.IsSection)
}
