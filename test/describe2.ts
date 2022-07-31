import { formatWorkout, primaryWorkout } from '../src'

const components = [
  {
    Id: '65521360',
    IsSection: true,
    IsVideoURL: false,
    IsImage: false,
    IsWarmup: false,
    IsGymnastics: false,
    IsWeightlifting: false,
    IsMetcon: false,
    IsWeightliftingTotal: false,
    Name: 'Warm-up',
    Comment: '',
    VideoURL: '',
    VideoURLComment: '',
    ImageURL: '',
    ImageFilename: '',
    ImageComment: '',
    PrefixText: '',
    MeasureIsMaxEffort: false,
    MeasureRepScheme: '',
    Description: '',
    Rounds: 0,
    ResultTypeId: 0,
    IsResultTypeEachRound: false,
    IsResultTypeNoMeasure: false,
    IsResultTypeCheckmark: false,
    EachRoundTypeLabel: '',
    ComponentId: '0',
    ComponentVideoURL: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
    WorkoutComponentResults: {
      List: [],
      EmptyListItem: {
        ClassId: '0',
        StartTime: '',
        HasResultsForClass: false,
        PerformanceResultId: '0',
        FullyFormattedResult: '',
        IsRx: false,
        IsRxPlus: false,
      },
    },
    HasPerformedAtLeastOnce: false,
    HasAtLeastOneWorkoutComponentResult: false,
  },
  {
    Id: '65521362',
    IsSection: false,
    IsVideoURL: false,
    IsImage: false,
    IsWarmup: true,
    IsGymnastics: false,
    IsWeightlifting: false,
    IsMetcon: false,
    IsWeightliftingTotal: false,
    Name: 'Warm-up',
    Comment: '',
    VideoURL: '',
    VideoURLComment: '',
    ImageURL: '',
    ImageFilename: '',
    ImageComment: '',
    PrefixText: 'W',
    MeasureIsMaxEffort: false,
    MeasureRepScheme: '',
    Description:
      '8 Minute AMRAP\r\n10 Spiderman Lunges\r\n10m Knuckle Drag\r\n10 Cal Ski/Row\r\n2  Wall Walks\r\n10 Straight Leg Sit Ups\r\n10 Single Leg RDL',
    Rounds: 0,
    ResultTypeId: 0,
    IsResultTypeEachRound: false,
    IsResultTypeNoMeasure: true,
    IsResultTypeCheckmark: false,
    EachRoundTypeLabel: '',
    ComponentId: '26097683',
    ComponentVideoURL: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
    WorkoutComponentResults: {
      List: [],
      EmptyListItem: {
        ClassId: '0',
        StartTime: '',
        HasResultsForClass: false,
        PerformanceResultId: '0',
        FullyFormattedResult: '',
        IsRx: false,
        IsRxPlus: false,
      },
    },
    HasPerformedAtLeastOnce: false,
    HasAtLeastOneWorkoutComponentResult: false,
  },
  {
    Id: '65521373',
    IsSection: true,
    IsVideoURL: false,
    IsImage: false,
    IsWarmup: false,
    IsGymnastics: false,
    IsWeightlifting: false,
    IsMetcon: false,
    IsWeightliftingTotal: false,
    Name: 'Metcon',
    Comment: '',
    VideoURL: '',
    VideoURLComment: '',
    ImageURL: '',
    ImageFilename: '',
    ImageComment: '',
    PrefixText: '',
    MeasureIsMaxEffort: false,
    MeasureRepScheme: '',
    Description: '',
    Rounds: 0,
    ResultTypeId: 0,
    IsResultTypeEachRound: false,
    IsResultTypeNoMeasure: false,
    IsResultTypeCheckmark: false,
    EachRoundTypeLabel: '',
    ComponentId: '0',
    ComponentVideoURL: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
    WorkoutComponentResults: {
      List: [],
      EmptyListItem: {
        ClassId: '0',
        StartTime: '',
        HasResultsForClass: false,
        PerformanceResultId: '0',
        FullyFormattedResult: '',
        IsRx: false,
        IsRxPlus: false,
      },
    },
    HasPerformedAtLeastOnce: false,
    HasAtLeastOneWorkoutComponentResult: false,
  },
  {
    Id: '65521380',
    IsSection: false,
    IsVideoURL: false,
    IsImage: false,
    IsWarmup: false,
    IsGymnastics: false,
    IsWeightlifting: false,
    IsMetcon: false,
    IsWeightliftingTotal: false,
    Name: 'Metcon',
    Comment: '',
    VideoURL: '',
    VideoURLComment: '',
    ImageURL: '',
    ImageFilename: '',
    ImageComment: '',
    PrefixText: '',
    MeasureIsMaxEffort: false,
    MeasureRepScheme: '',
    Description:
      'Every 4:00 for 6 rounds (score each round for time)\r\nRow/Ski 250/200m\r\n15 TTB\r\n15m HS WALK/3 Wall Walks\r\n\r\nRX+:20TTB, 20m HS Walk',
    Rounds: 0,
    ResultTypeId: 0,
    IsResultTypeEachRound: false,
    IsResultTypeNoMeasure: false,
    IsResultTypeCheckmark: false,
    EachRoundTypeLabel: '',
    ComponentId: '26097690',
    ComponentVideoURL: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
    WorkoutComponentResults: {
      List: [],
      EmptyListItem: {
        ClassId: '0',
        StartTime: '',
        HasResultsForClass: false,
        PerformanceResultId: '0',
        FullyFormattedResult: '',
        IsRx: false,
        IsRxPlus: false,
      },
    },
    HasPerformedAtLeastOnce: false,
    HasAtLeastOneWorkoutComponentResult: false,
  },
]

const main = primaryWorkout(components)

console.log(formatWorkout(main))
