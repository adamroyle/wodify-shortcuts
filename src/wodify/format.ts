import decodeEntities from 'entities-decode'

import type { WorkoutComponent } from './types.js'

// really wish we didn't need this, but apparently we do
export function fixCrossAxedWorkoutComponents(components: WorkoutComponent[]): WorkoutComponent[] {
  let comps = components.slice()

  // add a section for each component that is missing one
  for (let i = 0; i < comps.length; i++) {
    const c = comps[i]
    if (!c.IsSection && looksLikeSectionName(c.Name) && !comps[i - 1]?.IsSection) {
      comps.splice(i, 0, { ...c, IsSection: true })
    }

    if (!c.IsSection && !comps[i - 1]?.IsSection && c.IsWeightlifting && comps[i + 1]?.Name == 'Metcon') {
      comps.splice(i, 0, {
        IsSection: true,
        Name: 'Pre-Metcon',
        Comment: '',
        Description: '',
        IsWeightlifting: false,
        TotalWeightLiftingComponents: { List: [] },
      })
    }
  }

  // rename warm up to warm-up
  comps = comps.map((c) => {
    if (c.Name.match(/Warm up/i)) {
      return { ...c, Name: 'Warm-up' }
    }
    return c
  })

  return comps
}

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
  workoutComponents = excludeWarmup(workoutComponents)
  workoutComponents = excludeExtras(workoutComponents)
  return workoutComponents
}

export function excludeWarmup(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  return filterWorkout(workoutComponents, [], ['Warm-up', 'Warm up', 'Warmup'])
}

export function excludeExtras(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  const extrasIndex = workoutComponents.findIndex((c) => looksLikeExtrasSectionName(c.Name))
  if (extrasIndex > 0) {
    return workoutComponents.slice(0, extrasIndex)
  }
  return workoutComponents
}

export function formatWorkout(workoutComponents: WorkoutComponent[]): string {
  const includeSections = workoutComponents.filter((c) => c.IsSection).length > 1
  return workoutComponents
    .filter(includeSections ? Boolean : (c) => !c.IsSection)
    .filter(excludeEmptySections)
    .map(cleanText)
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

function cleanText(c: WorkoutComponent): WorkoutComponent {
  return {
    ...c,
    Name: c.Name.trim(),
    Description: htmlToPlainText(c.Description).trim(),
    Comment: htmlToPlainText(c.Comment).trim(),
  }
}

function htmlToPlainText(html: string): string {
  html = html.replace(/<\/p>/g, '\n')
  html = html.replace(/<br \/>/g, '\n')
  html = html.replace(/<[^>]+>/g, '')
  return decodeEntities(html)
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

function looksLikeSectionName(name: string): boolean {
  return !!name.match(
    /^(Metcon|Warm-up|Warm up|Aerobic Conditioning|Midline|Aerobic Capacity|Gymnastics|Weightlifting|Strength)$/i
  )
}

function looksLikeExtrasSectionName(name: string): boolean {
  return !!name.match(
    /^(Extra Work|Aerobic Conditioning|Midline|Aerobic Capacity|Gymnastics|Weightlifting|Strength|FOR SCORING PURPOSE ONLY)$/i
  )
}
