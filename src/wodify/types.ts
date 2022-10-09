export interface User {
  ActiveLocationId: string
  ClientHasProgression: boolean
  FirstDayOfWeek: number
  FirstName: string
  GlobalUserId: string
  GymProgramId: string
  IsCoachOrAbove: boolean
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

export interface Program {
  Name: string
  ProgramId: string
  LocationId: string
  LocationName: string
}

export interface Class {
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

export interface ClassAccess {
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
  IsWeightlifting: boolean
  TotalWeightLiftingComponents: { List: string[] }
}

export enum ReservationStatusId {
  None = '0',
  Cancelled = '1',
  Reserved = '2',
  SignedIn = '3',
}

// network

export interface RequestError {
  HasError: boolean
  ErrorMessage: string
}

export interface LoginResponse {
  data: {
    Response: {
      ResponseUserData: User
      Error: RequestError
    }
  }
}

export interface LocationsProgramsResponse {
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

export interface GetClassesResponse {
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

export interface GetAllDataResponse {
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

export interface GetClassAccessesResponse {
  data: {
    Response: {
      ResponseClassAccess: ClassAccess
      Error: RequestError
    }
  }
}

export interface ReservationStatus {
  Error: RequestError
  Message: string
  NewStatusId: ReservationStatusId
  MessageTypeId: number
}

export interface ReservationResponse {
  data: {
    Response: ReservationStatus
  }
}
