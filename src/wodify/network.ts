import type { User, RequestError, LocationsProgramsResponse, Program, ModuleInfoResponse } from './types.js'

const BASE = 'https://app.wodify.com/WodifyClient'

// data

export type Session = {
  CsrfToken: string
  Cookie: string
  User: User
  Customer: string
}

// utilities

export function toJson<T>(errorResolver?: (json: T) => RequestError) {
  return async (response: Response) => {
    const data = (await response.json()) as T
    if (errorResolver) {
      const error = errorResolver(data)
      if (error.HasError) {
        throw new Error(error.ErrorMessage)
      }
    }
    return data
  }
}

export function toText(response: Response) {
  return response.text()
}

export function getProgramsFromLocationsProgramsResponse(data: LocationsProgramsResponse): Program[] {
  return data.data.Locations.List.map((location) => {
    return location.LocalPrograms.List.map((program) => {
      return {
        Name: program.Name,
        ProgramId: program.ProgramId,
        LocationId: program.LocalLocationId,
        LocationName: location.LocationName,
      }
    })
  }).flat()
}

export const defaultErrorResolver = (responseData: { data: { Response: { Error: RequestError } } }) =>
  responseData.data.Response.Error

export const scheduleErrorResolver = (responseData: { data: { Response: { Error_Schedule: RequestError } } }) =>
  responseData.data.Response.Error_Schedule

export const topLevelErrorResolver = (responseData: { data: { ErrorMessage: string } }): RequestError => {
  return {
    HasError: responseData.data.ErrorMessage.length > 0,
    ErrorMessage: responseData.data.ErrorMessage,
  }
}

type ApiName =
  | 'Login'
  | 'LocationsPrograms'
  | 'GetClassesAttendance'
  | 'GetClasses'
  | 'GetAllWorkoutData'
  | 'GetClassAccesses'
  | 'CreateClassReservation'
  | 'SignInClass'
  | 'CancelClassReservation'
  | 'GetCustomerDateTime'

const apiEndpoints: { [key in ApiName]: string } = {
  Login: 'screenservices/WodifyClient/ActionDo_Login',
  LocationsPrograms: 'screenservices/WodifyClient_CS/ActionSyncLocationsPrograms',
  GetClassesAttendance: 'screenservices/WodifyClient_Class/Classes/Attendance/DataActionGetClasses',
  GetClasses:
    'screenservices/WodifyClient_DataFetch_WB/Schedule_OS/GetClassList_ForClient_WithReservationCounts_WB/DataActionGetClassList_ForClient_WithReservationCounts',
  GetAllWorkoutData:
    'screenservices/WodifyClient_DataFetch_WB/WOD_Flow/GetAllWorkoutData_WB/DataActionGetAllWorkoutData',
  GetClassAccesses:
    'screenservices/WodifyClient_DataFetch_WB/Schedule_OS/GetClassListAccesses_WB/DataActionGetClassListAccesses',
  CreateClassReservation: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICreateClassReservation',
  SignInClass: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPISignInClass_Mobile',
  CancelClassReservation: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICancelClassReservation',
  GetCustomerDateTime:
    'screenservices/WodifyClient_DataFetch_WB/Customer_OS/GetCustomerDateTime_WB/DataActionGetCustomerDateTime',
}

type Api = {
  endpoint: string
  apiVersion: string
}

type ApiCache = Record<ApiName, Api>

let apiCache: Promise<ApiCache> | undefined

async function getModuleInfo(): Promise<ModuleInfoResponse> {
  const response = await fetch(`${BASE}/moduleservices/moduleinfo`)
  return await toJson<ModuleInfoResponse>()(response)
}

export async function createApiCache(): Promise<ApiCache> {
  const moduleInfo = await getModuleInfo()

  const withVersion = (moduleUrl: string) => {
    const url = new URL(moduleUrl)
    url.search = moduleInfo.manifest.urlVersions[url.pathname]
    return url.toString()
  }

  const codebase = await Promise.all(
    // prettier-ignore
    [
      // Login
      fetch(withVersion(`${BASE}/scripts/WodifyClient.controller.js`)).then(toText),
      // LocationsPrograms
      fetch(withVersion(`${BASE}/scripts/WodifyClient_CS.controller.js`)).then(toText),
      // GetClassesAttendance
      fetch(withVersion(`${BASE}/scripts/WodifyClient_Class.Classes.Attendance.mvc.js`)).then(toText),
      // CreateClassReservation
      // CancelClassReservation
      // SignInClass
      fetch(withVersion(`${BASE}/scripts/WodifyClient_Class.Classes.Class.mvc.js`)).then(toText),
      // GetClasses
      fetch(withVersion(`${BASE}/scripts/WodifyClient_Performance.Exercise.Modal_WorkoutSignInToClass.mvc.js`)).then(toText),
      // GetAllWorkoutData
      fetch(withVersion(`${BASE}/scripts/WodifyClient_DataFetch_WB.WOD_Flow.GetAllWorkoutData_WB.mvc.js`)).then(toText),
      // GetClasses
      fetch(withVersion(`${BASE}/scripts/WodifyClient_DataFetch_WB.Schedule_OS.GetClassList_ForClient_WithReservationCounts_WB.mvc.js`)).then(toText),
      // GetClassAccesses
      fetch(withVersion(`${BASE}/scripts/WodifyClient_DataFetch_WB.Schedule_OS.GetClassListAccesses_WB.mvc.js`)).then(toText),
      // GetCustomerDateTime
      fetch(withVersion(`${BASE}/scripts/WodifyClient_DataFetch_WB.Customer_OS.GetCustomerDateTime_WB.mvc.js`)).then(toText),
    ]
  )
    .catch((error) => {
      console.error('Error fetching codebase:', error)
      throw error
    })
    .then((str) => str.join(''))

  const createApi: (apiName: ApiName) => Api = (apiName: ApiName) => {
    const matches = codebase.match(new RegExp(`"${apiEndpoints[apiName]}", "(.*?)"`))
    if (!matches) {
      throw new Error(`Could not find api ${apiName}`)
    }
    return {
      endpoint: `${BASE}/${apiEndpoints[apiName]}`,
      apiVersion: matches[1],
    }
  }

  return {
    Login: createApi('Login'),
    LocationsPrograms: createApi('LocationsPrograms'),
    GetClassesAttendance: createApi('GetClassesAttendance'),
    GetAllWorkoutData: createApi('GetAllWorkoutData'),
    GetClasses: createApi('GetClasses'),
    GetClassAccesses: createApi('GetClassAccesses'),
    CreateClassReservation: createApi('CreateClassReservation'),
    SignInClass: createApi('SignInClass'),
    CancelClassReservation: createApi('CancelClassReservation'),
    GetCustomerDateTime: createApi('GetCustomerDateTime'),
  }
}

export async function preloadApiCache(): Promise<ApiCache> {
  if (!apiCache) {
    const start = Date.now()
    apiCache = createApiCache()
    apiCache.then(() => console.log('Preloaded API cache in', Date.now() - start, 'ms'))
  }
  return apiCache
}

export async function getApi(apiName: ApiName): Promise<Api> {
  return preloadApiCache().then((cache) => cache[apiName])
}

export async function callApi(apiName: ApiName, session: Session | null, body: object): Promise<Response> {
  const { endpoint, apiVersion } = await getApi(apiName)
  const start = Date.now()
  console.log(`callApi ${apiName}`)

  const response = await (async () => {
    const maxRetries = 1
    for (let retries = 0; retries <= maxRetries; retries++) {
      const timeoutController = new AbortController()
      const timeoutMs = 3000 * (retries + 1)
      const timeout = setTimeout(() => timeoutController.abort(), timeoutMs)
      try {
        return await fetch(endpoint, {
          signal: timeoutController.signal,
          method: 'POST',
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            'x-csrftoken': session?.CsrfToken || '',
            cookie: session?.Cookie || '',
          },
          body: JSON.stringify({
            versionInfo: { apiVersion },
            ...body,
          }),
        })
      } catch (error) {
        // if error is DOMException (reason is AbortError)
        if (error instanceof DOMException) {
          console.log(`${apiName} TIMED OUT after ${timeoutMs}ms`)
        } else {
          console.log(`${apiName} error`, error)
        }
        if (retries < maxRetries) {
          console.log(`${apiName} Retrying`)
        } else {
          console.log(`${apiName} Giving up`)
          throw error
        }
      } finally {
        clearTimeout(timeout)
      }
    }
    throw new Error('unreachable')
  })()

  console.log(`${apiName} took ${Date.now() - start}ms [${response.status}] ${response.statusText}`)
  return response
}
