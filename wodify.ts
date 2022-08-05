import fetch, { Response } from 'node-fetch'
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

export async function login(username: string, password: string): Promise<Session> {
  const response = await fetch(`${BASE}/screenservices/WodifyClient/ActionDo_Login`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': '', // empty on login, but must be set
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'PY3D9kBUtXg23g8+7H6tiQ' },
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
    }),
    method: 'POST',
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
  return fetch(`${BASE}/screenservices/WodifyClient_CS/ActionSyncLocationsPrograms`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'kiwpC+bXbgmpSrf5tp3pKg' },
      viewName: 'Home.Login',
      inputParameters: {
        CustomerId: session.User.TenantId,
        UserId: session.User.UserId,
        ActiveLocationId: session.User.ActiveLocationId,
      },
    }),
    method: 'POST',
  })
    .then(toJson<LocationsProgramsResponse>(topLevelErrorResolver))
    .then(getProgramsFromLocationsProgramsResponse)
}

export async function listClasses(session: Session, date: string): Promise<Class[]> {
  return fetch(`${BASE}/screenservices/WodifyClient_Class/Classes/Classes/DataActionGetClasses`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'AujDhvyW55tDCs+3H4v2UA' },
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
    }),
    method: 'POST',
  })
    .then(toJson<GetClassesResponse>(defaultErrorResolver))
    .then((json) => json.data.Response.ResponseClassList.Class.List)
}

export async function listWorkoutComponents(session: Session, date: string): Promise<WorkoutComponent[]> {
  return fetch(`${BASE}/screenservices/WodifyClient_Performance/Exercise_Server/Exercise/DataActionGetAllData`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'KtVVM7Hj6Jt0H8Vht9O7TQ' },
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
    }),
    method: 'POST',
  })
    .then(toJson<GetAllDataResponse>(topLevelErrorResolver))
    .then((json) => json.data.ResponseWorkout.ResponseWorkoutActions.WorkoutComponents.List)
}

export async function getClassAccess(session: Session, classId: string): Promise<ClassAccess> {
  return fetch(`${BASE}/screenservices/WodifyClient_Class/Classes/Class/DataActionGetClassAccesses`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: '23q0VR0cJSiFvyY8+12r8A' },
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
    }),
    method: 'POST',
  })
    .then(toJson<GetClassAccessesResponse>(defaultErrorResolver))
    .then((json) => json.data.Response.ResponseClassAccess)
}

export async function reserveClass(session: Session, classId: string): Promise<ReservationStatus> {
  return fetch(`${BASE}/screenservices/WodifyClient_Class/Classes/Class/ServiceAPICreateClassReservation`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: '1AJRlWfa59_3jei3j+OUmA' },
      viewName: 'Classes.Class',
      inputParameters: {
        Request: {
          ClassId: classId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
        },
      },
    }),
    method: 'POST',
  })
    .then(toJson<ReservationResponse>(defaultErrorResolver))
    .then((json) => json.data.Response)
}

export async function signinClass(session: Session, classId: string): Promise<ReservationStatus> {
  return fetch(`${BASE}/screenservices/WodifyClient_Class/Classes/Class/ServiceAPISignInClass`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'mHpCzhO_XDz0lg2qwtzepw' },
      viewName: 'Classes.Class',
      inputParameters: {
        Request: {
          ClassId: classId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
        },
      },
    }),
    method: 'POST',
  })
    .then(toJson<ReservationResponse>(defaultErrorResolver))
    .then((json) => json.data.Response)
}

export async function cancelReservation(session: Session, classReservationId: string): Promise<ReservationStatus> {
  return fetch(`${BASE}/screenservices/WodifyClient_Class/Classes/Class/ServiceAPICancelClassReservation`, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'x-csrftoken': session.CsrfToken,
      cookie: session.Cookie,
    },
    body: JSON.stringify({
      versionInfo: { apiVersion: 'ntafw2WRQ13h3oCW4JyjBw' },
      viewName: 'Classes.Class',
      inputParameters: {
        Request: {
          ClassReservationId: classReservationId,
          TenantId: session.User.TenantId,
          UserId: session.User.UserId,
          IsClient: true,
        },
      },
    }),
    method: 'POST',
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
//       versionInfo: { apiVersion: 'LpuILuYkRL9qWQXRqHguCg' },
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
