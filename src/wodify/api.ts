import * as cookieBuilder from 'cookie'
import cookieParser from 'set-cookie-parser'

import {
  Session,
  callApi,
  toJson,
  defaultErrorResolver,
  topLevelErrorResolver,
  getProgramsFromLocationsProgramsResponse,
  scheduleErrorResolver,
} from './network.js'

import type {
  LoginResponse,
  Program,
  LocationsProgramsResponse,
  Class,
  GetClassesResponse,
  WorkoutComponent,
  GetAllWorkoutDataResponse,
  ClassAccess,
  GetClassAccessesResponse,
  ReservationStatus,
  ReservationResponse,
  CustomerDateTime,
  GetCustomerDateTimeResponse,
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

  const cookies = response.headers.getSetCookie().map((c) => cookieParser.parseString(c))
  const csrfToken = cookieParser.parseString(cookies.find((c) => c.name === 'nr2W_Theme_UI')?.value || '').value
  const cookie = cookies.map((c) => cookieBuilder.serialize(c.name, c.value)).join('; ')

  return {
    CsrfToken: csrfToken,
    Cookie: cookie,
    User: loginResponse.data.Response.ResponseUserData,
    Customer: loginResponse.data.Response.Customer,
  }
}

export async function getCustomerDateTime(session: Session): Promise<CustomerDateTime> {
  return callApi('GetCustomerDateTime', session, {
    viewName: 'MainScreens.Scheduler',
    screenData: {
      variables: {
        In_Request: {
          Customer: session.Customer,
        },
      },
    },
  })
    .then(toJson<GetCustomerDateTimeResponse>())
    .then((json) => json.data.Response)
}

export async function listPrograms(session: Session): Promise<Program[]> {
  return callApi('LocationsPrograms', session, {
    viewName: 'Home.Login',
    inputParameters: {
      CustomerId: session.User.CustomerId,
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
        In_Request: {
          RequestClassList: {
            FromDate: date,
            CustomerId: session.User.CustomerId,
            LocationId: session.User.ActiveLocationId,
            UserId: session.User.UserId,
          },
        },
      },
    },
  })
    .then(toJson<GetClassesResponse>(defaultErrorResolver))
    .then((json) => json.data.Response.ResponseClassList.Class.List)
}

export async function listWorkoutComponents(
  session: Session,
  date: string,
  programId?: string
): Promise<WorkoutComponent[]> {
  return callApi('GetAllWorkoutData', session, {
    viewName: 'MainScreens.Exercise',
    screenData: {
      variables: {
        In_Request: {
          SelectedDate: date,
          ActiveLocationId: session.User.ActiveLocationId,
          GymProgramId: programId || session.User.GymProgramId,
          CustomerId: session.User.CustomerId,
          UserId: session.User.UserId,
        },
      },
    },
  })
    .then(toJson<GetAllWorkoutDataResponse>((json) => json.data.Response.ResponseWorkout.WorkoutError))
    .then((json) => json.data.Response.ResponseWorkout.ResponseWorkoutActions.WorkoutComponents.List)
}

export async function getClassAccess(session: Session, classId: string): Promise<ClassAccess> {
  return callApi('GetClassAccesses', session, {
    viewName: 'Classes.Class',
    screenData: {
      variables: {
        ClassId: classId,
        ClientVariables: {
          ActiveLocationId: session.User.ActiveLocationId,
          CustomerId: session.User.CustomerId,
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
        CustomerId: session.User.CustomerId,
        UserId: session.User.UserId,
      },
    },
  })
    .then(toJson<ReservationResponse>(scheduleErrorResolver))
    .then((json) => json.data.Response)
}

export async function signinClass(session: Session, classId: string): Promise<ReservationStatus> {
  return callApi('SignInClass', session, {
    viewName: 'Classes.Class',
    inputParameters: {
      Request: {
        Customer: session.Customer,
        LocationId: session.User.ActiveLocationId,
        RequestSignInClassClient: {
          AutoRenewSessionPlanIfPossible: true,
          ClassId: classId,
          IgnoreSignInClassPolicy: false,
          IsDropIn: false,
          UserId: session.User.UserId,
        },
      },
    },
  })
    .then(toJson<ReservationResponse>(scheduleErrorResolver))
    .then((json) => json.data.Response)
}

export async function cancelReservation(session: Session, classReservationId: string): Promise<ReservationStatus> {
  return callApi('CancelClassReservation', session, {
    viewName: 'Classes.Class',
    inputParameters: {
      Request: {
        ClassReservationId: classReservationId,
        CustomerId: session.User.CustomerId,
        UserId: session.User.UserId,
        IsClient: true,
      },
    },
  })
    .then(toJson<ReservationResponse>(scheduleErrorResolver))
    .then((json) => json.data.Response)
}
