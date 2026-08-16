import assert from 'node:assert/strict'
import { createApiCache } from '../src/wodify/network.js'

const BASE = 'https://app.wodify.com/WodifyClient'
const MODULE_INFO_PATH = 'moduleservices/moduleinfo?current-version'

const assetPaths = [
  '/WodifyClient/scripts/WodifyClient.controller__version.js',
  '/WodifyClient/scripts/WodifyClient_CS.controller__version.js',
  '/WodifyClient/scripts/WodifyClient_Class.Classes.Attendance.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_Class.Classes.Class.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_Performance.Exercise.Modal_WorkoutSignInToClass.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_DataFetch_WB.WOD_Flow.GetAllWorkoutData_WB.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_DataFetch_WB.Schedule_OS.GetClassList_ForClient_WithReservationCounts_WB.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_DataFetch_WB.Schedule_OS.GetClassListAccesses_WB.mvc__version.js',
  '/WodifyClient/scripts/WodifyClient_DataFetch_WB.Customer_OS.GetCustomerDateTime_WB.mvc__version.js',
]

const apiVersions = {
  PrepareLogin: ['screenservices/WodifyClient/ActionPrepare_Login', 'prepare-version'],
  Login: ['screenservices/WodifyClient/ActionDo_Login', 'login-version'],
  LocationsPrograms: ['screenservices/WodifyClient_CS/ActionSyncLocationsPrograms', 'locations-version'],
  GetClassesAttendance: [
    'screenservices/WodifyClient_Class/Classes/Attendance/DataActionGetClasses',
    'attendance-version',
  ],
  GetClasses: [
    'screenservices/WodifyClient_DataFetch_WB/Schedule_OS/GetClassList_ForClient_WithReservationCounts_WB/DataActionGetClassList_ForClient_WithReservationCounts',
    'classes-version',
  ],
  GetAllWorkoutData: [
    'screenservices/WodifyClient_DataFetch_WB/WOD_Flow/GetAllWorkoutData_WB/DataActionGetAllWorkoutData',
    'workouts-version',
  ],
  GetClassAccesses: [
    'screenservices/WodifyClient_DataFetch_WB/Schedule_OS/GetClassListAccesses_WB/DataActionGetClassListAccesses',
    'accesses-version',
  ],
  CreateClassReservation: [
    'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICreateClassReservation',
    'reserve-version',
  ],
  SignInClass: [
    'screenservices/WodifyClient_Class/Classes/Class/ServiceAPISignInClass_Mobile',
    'signin-version',
  ],
  CancelClassReservation: [
    'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICancelClassReservation',
    'cancel-version',
  ],
  GetCustomerDateTime: [
    'screenservices/WodifyClient_DataFetch_WB/Customer_OS/GetCustomerDateTime_WB/DataActionGetCustomerDateTime',
    'datetime-version',
  ],
} as const

const codebase = Object.values(apiVersions)
  .map(([endpoint, version]) => `"${endpoint}", "${version}"`)
  .join('\n')

const originalFetch = globalThis.fetch
const requestedUrls: string[] = []

globalThis.fetch = async (input) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  requestedUrls.push(url)

  if (url === `${BASE}/`) {
    return new Response(`<link rel="preload" href="${MODULE_INFO_PATH}" as="fetch">`)
  }
  if (url === `${BASE}/${MODULE_INFO_PATH}`) {
    return Response.json({
      manifest: {
        urlVersions: Object.fromEntries(assetPaths.map((path) => [path, '?version'])),
      },
    })
  }
  if (assetPaths.some((path) => url === new URL(path, BASE).toString())) {
    return new Response(codebase)
  }
  return new Response('Not found', { status: 404 })
}

try {
  const cache = await createApiCache()

  assert.deepEqual(
    Object.fromEntries(Object.entries(cache).map(([name, api]) => [name, api.apiVersion])),
    Object.fromEntries(Object.entries(apiVersions).map(([name, [, version]]) => [name, version]))
  )
  assert(requestedUrls.includes(`${BASE}/${MODULE_INFO_PATH}`))
  assert(!requestedUrls.includes(`${BASE}/pwaServiceWorker.js`))
} finally {
  globalThis.fetch = originalFetch
}
