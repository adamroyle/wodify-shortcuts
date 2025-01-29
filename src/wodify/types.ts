export type User = {
  ActiveLocationId: string
  ClientHasProgression: boolean
  CustomerId: string
  CustomerPublicName: string
  DateOfBirth: string
  DefaultTab: number
  FirstDayOfWeek: number
  FirstName: string
  GenderId: string
  GlobalUserId: string
  GymProgramId: string
  IsAdmin: boolean
  IsBirthdayPrivate: boolean
  IsCoach: boolean
  IsManager: boolean
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
  UserProfileImageURL: string
}

export type Program = {
  Name: string
  ProgramId: string
  LocationId: string
  LocationName: string
}

export type Class = {
  CanCancelSignIn: boolean
  CanSignin: boolean
  ClassLimit: number
  ClassReservationStatusId: string
  CoachImgUrl: string
  CoachName: string
  Description: string
  EndTime: string
  Id: string
  IsAvailable: boolean
  IsWaitlisting: boolean
  Name: string
  OnlineMembershipSaleId: string
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
  MeasureRepScheme: string
}

export enum ReservationStatusId {
  None = '0',
  Cancelled = '1',
  Reserved = '2',
  SignedIn = '3',
}

export type CustomerDateTime = {
  CurrentDate: string
  CurrentTime: string
  CurrentDateTime: string
}

// network

export type RequestError = {
  HasError: boolean
  ErrorMessage: string
}

export type ModuleInfoResponse = {
  manifest: {
    urlVersions: { [key: string]: string }
  }
}

export type LoginResponse = {
  data: {
    Response: {
      Customer: string
      ResponseUserData: User
      Error: RequestError
    }
  }
}

export type GetCustomerDateTimeResponse = {
  data: {
    Response: CustomerDateTime
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

export type GetAllWorkoutDataResponse = {
  data: {
    Response: {
      ErrorMessage: string
      ResponseWorkout: {
        WorkoutError: RequestError
        ResponseWorkoutActions: {
          WorkoutComponents: {
            List: WorkoutComponent[]
          }
        }
      }
    }
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
  Error_Schedule: RequestError
  Message: string
  NewStatusId: ReservationStatusId
  MessageTypeId: number
}

export type ReservationResponse = {
  data: {
    Response: ReservationStatus
  }
}
