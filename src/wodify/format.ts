import decodeEntities from 'entities-decode'

import type { WorkoutComponent } from './types.js'

export function getPrimaryWorkout(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  workoutComponents = excludeWarmup(workoutComponents)
  workoutComponents = excludeExtras(workoutComponents)
  return workoutComponents
}

export function excludeWarmup(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  const excludeNames = ['warm-up', 'warm up', 'warmup']
  return workoutComponents.filter((c) => !excludeNames.includes(c.Name.toLowerCase().trim()))
}

export function excludeExtras(workoutComponents: WorkoutComponent[]): WorkoutComponent[] {
  const extrasIndex = workoutComponents.findIndex((c) => looksLikeExtrasSectionName(c.Name.trim()))
  if (extrasIndex > 0) {
    return workoutComponents.slice(0, extrasIndex)
  }
  return workoutComponents
}

export function formatWorkout(workoutComponents: WorkoutComponent[]): string {
  const includeSections = workoutComponents.filter((c, index) => c.IsSection && index > 0).length > 0
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
    lcName === 'metcon' ||
    lcName === 'workout'
  ) {
    return ''
  }

  return name
}

function removeFillerText(text: string): string {
  return text.replace(/^(Athlete Instructions|Instructions|Athlete Notes|Extra Details)$/gim, '')
}

function looksLikeExtrasSectionName(name: string): boolean {
  return !!name.match(
    /^(Extras|Extra Work|Aerobic Conditioning|Midline|Aerobic Capacity|Gymnastics|Weightlifting|Strength|FOR SCORING PURPOSE ONLY|Mobility)$/i
  )
}
