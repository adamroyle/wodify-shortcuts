export type User = {
  ActiveLocationId: string
  ClientHasProgression: boolean
  CustomerId: string
  CustomerPublicName: string
  FirstDayOfWeek: number
  FirstName: string
  GlobalUserId: string
  GymProgramId: string
  IsCoachOrAbove: boolean
  IsNonPrd: boolean
  IsUse24HourTime: boolean
  IsUserSuspended: boolean
  IsWorkoutTrackingEnabled: boolean
  LastName: string
  LocalTimeZoneDifference: number
  SystemOfMeasureDistance: number
  SystemOfMeasureWeight: number
  UserAllowedToComment: boolean
  UserId: string
}

export type Program = {
  Name: string
  ProgramId: string
  LocationId: string
  LocationName: string
}

export type Class = {
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

export type ClassAccess = {
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

export type WorkoutComponent = {
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

export type GymDateTime = {
  GymCurrDate: string
  GymCurrTime: string
}

// network

export type RequestError = {
  HasError: boolean
  ErrorMessage: string
}

export type LoginResponse = {
  data: {
    Response: {
      ResponseUserData: User
      Error: RequestError
    }
  }
}

export type LocationsProgramsResponse = {
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

export type GetClassesResponse = {
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

export type GetAllDataResponse = {
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

export type GetClassesAttendanceResponse = {
  data: {
    GymCurrDate: string
    GymCurrTime: string
    Classes: RequestError
  }
}

export type GetClassAccessesResponse = {
  data: {
    Response: {
      ResponseClassAccess: ClassAccess
      Error: RequestError
    }
  }
}

export type ReservationStatus = {
  Error: RequestError
  Message: string
  NewStatusId: ReservationStatusId
  MessageTypeId: number
}

export type ReservationResponse = {
  data: {
    Response: ReservationStatus
  }
}
