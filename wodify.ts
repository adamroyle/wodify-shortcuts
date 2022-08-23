import fetch, { AbortError, Response } from 'node-fetch'
import cookieBuilder from 'cookie'
import cookieParser from 'set-cookie-parser'

// data

interface Session {
  CsrfToken: string
  Cookie: string
  User: User
}

interface User {
  ActiveLocationId: string
  ClientHasProgression: boolean
  FirstDayOfWeek: number
  FirstName: string
  GlobalUserId: string
  GymProgramId: string
  IsNonPrd: boolean
  IsUse24HourTime: true
  IsUserSuspended: boolean
  IsWorkoutTrackingEnabled: true
  LastName: string
  LocalTimeZoneDifference: number
  SystemOfMeasureDistance: number
  SystemOfMeasureWeight: number
  TenantId: string
  TenantPublicName: string
  UserAllowedToComment: boolean
  UserId: string
}

interface Program {
  Name: string
  ProgramId: string
  LocationId: string
  LocationName: string
}

interface Class {
  CanSignin: boolean
  ClassLimit: number
  ClassReservationStatusId: string
  Description: string
  EndTime: string
  Id: string
  IsAvailable: boolean
  IsWaitlisting: boolean
  Name: string
  ProgramId: string
  ReservationCount: number
  StartTime: string
  Status: string
  WaitlistCount: number
  WaitlistTypeId: string
}

interface ClassAccess {
  BlockedMessageSpan: string
  BlockedMessageTitle: string
  CanCancelReservation: boolean
  CanCancelSignin: boolean
  CanCancelWaitlist: boolean
  CancelNoShowButtonText: string
  CancelPolicyText: string
  CanReserve: boolean
  CanSignin: boolean
  CanWaitlist: boolean
  ClassLimitModalTerm: string
  ClassLimitModalValue: string
  ClassReservationId: string
  IsBlocked: boolean
  IsSignedIn: boolean
  IsWaitlisting: boolean
  IsWorkoutAvailable: boolean
  NoShowPolicyText: string
  ShowAlternateBlockedMessage: boolean
  ShowClassLimitReachedModal: boolean
  ShowNoClassesRemainingModal: boolean
  ShowClassIsFullFromWaitlistModal: boolean
  IsInLateCancellationWindow: boolean
  ClassAttendanceVisible: boolean
}

export interface WorkoutComponent {
  Name: string
  IsSection: boolean
  Comment: string
  Description: string
  TotalWeightLiftingComponents: { List: string[] }
}

export enum ReservationStatusId {
  None = '0',
  Cancelled = '1',
  Reserved = '2',
  SignedIn = '3',
}

// network

interface RequestError {
  HasError: boolean
  ErrorMessage: string
}

interface LoginResponse {
  data: {
    Response: {
      ResponseUserData: User
      Error: RequestError
    }
  }
}

interface LocationsProgramsResponse {
  data: {
    ErrorMessage: string
    Locations: {
      List: [
        {
          LocationId: string
          LocationName: string
          HasEnforceMembershipLimits: boolean
          LocalPrograms: {
            List: [
              {
                Id: string
                ProgramId: string
                LocalLocationId: string
                Name: string
                Description: string
                Color: string
                PublishExternally: boolean
                CountTowardsAttendanceLimits: boolean
                SecureProgrammingEnabled: boolean
                SecureProgrammingOptionId: number
                IsActive: boolean
              }
            ]
          }
        }
      ]
    }
  }
}

interface GetClassesResponse {
  data: {
    Response: {
      Error: RequestError
      ResponseClassList: {
        Class: {
          List: Class[]
        }
      }
    }
  }
}

interface GetAllDataResponse {
  data: {
    ErrorMessage: string
    ResponseWorkout: {
      Error: RequestError
      ResponseWorkoutActions: {
        WorkoutComponents: {
          List: WorkoutComponent[]
        }
      }
    }
  }
}

interface GetClassAccessesResponse {
  data: {
    Response: {
      ResponseClassAccess: ClassAccess
      Error: RequestError
    }
  }
}

interface ReservationStatus {
  Error: RequestError
  Message: string
  NewStatusId: ReservationStatusId
  MessageTypeId: number
}

interface ReservationResponse {
  data: {
    Response: ReservationStatus
  }
}

// utilities

function toJson<T>(errorResolver?: (json: T) => RequestError) {
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

function toText(response: Response) {
  return response.text()
}

function getProgramsFromLocationsProgramsResponse(data: LocationsProgramsResponse): Program[] {
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

const BASE = 'https://app.wodify.com/WodifyClient'

const defaultErrorResolver = (responseData: { data: { Response: { Error: RequestError } } }) =>
  responseData.data.Response.Error

const topLevelErrorResolver = (responseData: { data: { ErrorMessage: string } }) => {
  return {
    HasError: responseData.data.ErrorMessage.length > 0,
    ErrorMessage: responseData.data.ErrorMessage,
  }
}

type ApiName =
  | 'Login'
  | 'LocationsPrograms'
  | 'GetClasses'
  | 'GetAllData'
  | 'GetClassAccesses'
  | 'CreateClassReservation'
  | 'SignInClass'
  | 'CancelClassReservation'

const apiEndpoints: { [key in ApiName]: string } = {
  Login: 'screenservices/WodifyClient/ActionDo_Login',
  LocationsPrograms: 'screenservices/WodifyClient_CS/ActionSyncLocationsPrograms',
  GetClasses: 'screenservices/WodifyClient_Class/Classes/Classes/DataActionGetClasses',
  GetAllData: 'screenservices/WodifyClient_Performance/Exercise_Server/Exercise/DataActionGetAllData',
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

let apiCache: ApiCache | undefined

async function createApiCache(): Promise<ApiCache> {
  const codebase = await Promise.all([
    fetch(`${BASE}/scripts/WodifyClient.controller.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_CS.controller.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Class.Classes.Classes.mvc.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Class.Classes.Class.mvc.js`).then(toText),
    fetch(`${BASE}/scripts/WodifyClient_Performance.Exercise_Server.Exercise.mvc.js`).then(toText),
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
    apiCache = await createApiCache()
    console.log(`Preloaded api cache in ${Date.now() - start}ms`)
  }
  return apiCache
}

async function getApi(apiName: ApiName): Promise<Api> {
  return preloadApiCache().then((cache) => cache[apiName])
}

async function callApi(apiName: ApiName, session: Session | null, body: object): Promise<Response> {
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

export async function login(username: string, password: string): Promise<Session> {
  const response = await callApi('Login', null, {
    viewName: 'Home.Login',
    inputParameters: {
      Request: {
        UserName: username,
        Password: password,
        IsToLogin: true,
        CustomerId: '0',
        UserId: '0',
      },
    },
  })

  const loginResponse = await toJson<LoginResponse>(defaultErrorResolver)(response)

  const cookies = response.headers.raw()['set-cookie'].map((c) => cookieParser.parseString(c))
  const csrfToken = cookieParser.parseString(cookies.find((c) => c.name === 'nr2W_Theme_UI')?.value || '').value
  const cookie = cookies.map((c) => cookieBuilder.serialize(c.name, c.value)).join('; ')

  return {
    CsrfToken: csrfToken,
    Cookie: cookie,
    User: loginResponse.data.Response.ResponseUserData,
  }
}

export async function listPrograms(session: Session): Promise<Program[]> {
  return callApi('LocationsPrograms', session, {
    viewName: 'Home.Login',
    inputParameters: {
      CustomerId: session.User.TenantId,
      UserId: session.User.UserId,
      ActiveLocationId: session.User.ActiveLocationId,
    },
  })
    .then(toJson<LocationsProgramsResponse>(topLevelErrorResolver))
    .then(getProgramsFromLocationsProgramsResponse)
}

export async function listClasses(session: Session, date: string): Promise<Class[]> {
  return callApi('GetClasses', session, {
    viewName: 'MainScreens.Scheduler',
    screenData: {
      variables: {
        ClassDate: date,
        ClientVariables: {
          ActiveLocationId: session.User.ActiveLocationId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
        },
      },
    },
  })
    .then(toJson<GetClassesResponse>(defaultErrorResolver))
    .then((json) => json.data.Response.ResponseClassList.Class.List)
}

export async function listWorkoutComponents(session: Session, date: string): Promise<WorkoutComponent[]> {
  return callApi('GetAllData', session, {
    viewName: 'MainScreens.Exercise',
    screenData: {
      variables: {
        ClientVariables: {
          SelectedDate: date,
          ActiveLocationId: session.User.ActiveLocationId,
          GymProgramId: session.User.GymProgramId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
        },
      },
    },
  })
    .then(toJson<GetAllDataResponse>(topLevelErrorResolver))
    .then((json) => json.data.ResponseWorkout.ResponseWorkoutActions.WorkoutComponents.List)
}

export async function getClassAccess(session: Session, classId: string): Promise<ClassAccess> {
  return callApi('GetClassAccesses', session, {
    viewName: 'Classes.Class',
    screenData: {
      variables: {
        ClassId: classId,
        ClientVariables: {
          ActiveLocationId: session.User.ActiveLocationId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
        },
      },
    },
  })
    .then(toJson<GetClassAccessesResponse>(defaultErrorResolver))
    .then((json) => json.data.Response.ResponseClassAccess)
}

export async function reserveClass(session: Session, classId: string): Promise<ReservationStatus> {
  return callApi('CreateClassReservation', session, {
    viewName: 'Classes.Class',
    inputParameters: {
      Request: {
        ClassId: classId,
        TenantId: session.User.TenantId,
        UserId: session.User.UserId,
      },
    },
  })
    .then(toJson<ReservationResponse>(defaultErrorResolver))
    .then((json) => json.data.Response)
}

export async function signinClass(session: Session, classId: string): Promise<ReservationStatus> {
  return callApi('SignInClass', session, {
    viewName: 'Classes.Class',
    inputParameters: {
      Request: {
        ClassId: classId,
        TenantId: session.User.TenantId,
        UserId: session.User.UserId,
      },
    },
  })
    .then(toJson<ReservationResponse>(defaultErrorResolver))
    .then((json) => json.data.Response)
}

export async function cancelReservation(session: Session, classReservationId: string): Promise<ReservationStatus> {
  return callApi('CancelClassReservation', session, {
    viewName: 'Classes.Class',
    inputParameters: {
      Request: {
        ClassReservationId: classReservationId,
        TenantId: session.User.TenantId,
        UserId: session.User.UserId,
        IsClient: true,
      },
    },
  })
    .then(toJson<ReservationResponse>(defaultErrorResolver))
    .then((json) => json.data.Response)
}

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

export function isCrossFitProgram(program: Program) {
  return program.Name.toLowerCase().includes('crossfit')
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
  return !(c.IsSection && arr[i + 1].IsSection)
}

// unused

// const response3 = await fetch(
//   'https://app.wodify.com/WodifyClient/screenservices/WodifyClient/MainScreens/Home/DataActionGetClasses',
//   {
//     headers: {
//       'content-type': 'application/json; charset=UTF-8',
//       'x-csrftoken': csrfToken,
//       cookie,
//     },
//     body: JSON.stringify({
//       versionInfo: { apiVersion },
//       viewName: 'MainScreens.Home',
//       screenData: {
//         variables: {},
//       },
//       clientVariables: {
//         UserId: user.UserId,
//         TenantId: user.TenantId,
//       },
//     }),
//     method: 'POST',
//   }
// )
// const json3 = await response3.json()
// console.log(json3.data.Classes.ScheduleList.List)
