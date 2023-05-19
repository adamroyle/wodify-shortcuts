import fetch, { AbortError, Response } from 'node-fetch'
import type { User, RequestError, LocationsProgramsResponse, Program } from './types.js'

const BASE = 'https://app.wodify.com/WodifyClient'

// data

export type Session = {
  CsrfToken: string
  Cookie: string
  User: User
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

export const topLevelErrorResolver = (responseData: { data: { ErrorMessage: string } }) => {
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
  | 'GetAllData'
  | 'GetClassAccesses'
  | 'CreateClassReservation'
  | 'SignInClass'
  | 'CancelClassReservation'

const apiEndpoints: { [key in ApiName]: string } = {
  Login: 'screenservices/WodifyClient/ActionDo_Login',
  LocationsPrograms: 'screenservices/WodifyClient_CS/ActionSyncLocationsPrograms',
  GetClassesAttendance: 'screenservices/WodifyClient_Class/Classes/Attendance/DataActionGetClasses',
  GetClasses: 'screenservices/WodifyClient_Class/Classes/Classes/DataActionGetClasses',
  GetAllData: 'screenservices/WodifyClient_Performance/Exercise_Server/Workout/DataActionGetAllData',
  GetClassAccesses: 'screenservices/WodifyClient_Class/Classes/Class/DataActionGetClassAccesses',
  CreateClassReservation: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICreateClassReservation',
  SignInClass: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPISignInClass',
  CancelClassReservation: 'screenservices/WodifyClient_Class/Classes/Class/ServiceAPICancelClassReservation',
}

type Api = {
  endpoint: string
  apiVersion: string
}

type ApiCache = Record<ApiName, Api>

let apiCache: Promise<ApiCache> | undefined

export async function createApiCache(): Promise<ApiCache> {
  const codebase = await Promise.all([
    fetch(`${BASE}/scripts/WodifyClient.controller.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_CS.controller.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Class.Classes.Attendance.mvc.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Class.Classes.Classes.mvc.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Class.Classes.Class.mvc.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Performance.Exercise_Server.Workout.mvc.js`).then(toText),
  ]).then((str) => str.join(''))

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
    GetAllData: createApi('GetAllData'),
    GetClasses: createApi('GetClasses'),
    GetClassAccesses: createApi('GetClassAccesses'),
    CreateClassReservation: createApi('CreateClassReservation'),
    SignInClass: createApi('SignInClass'),
    CancelClassReservation: createApi('CancelClassReservation'),
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
        if (error instanceof AbortError) {
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
