import cookieBuilder from 'cookie'
import cookieParser from 'set-cookie-parser'

import {
  Session,
  callApi,
  toJson,
  defaultErrorResolver,
  topLevelErrorResolver,
  getProgramsFromLocationsProgramsResponse,
} from './network.js'

import type {
  LoginResponse,
  Program,
  LocationsProgramsResponse,
  Class,
  GetClassesResponse,
  WorkoutComponent,
  GetAllDataResponse,
  ClassAccess,
  GetClassAccessesResponse,
  ReservationStatus,
  ReservationResponse,
} from './types.js'

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
        ClassesAccess: {
          HasEnforcedMembership: true,
        },
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
