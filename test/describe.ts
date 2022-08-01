import { formatWorkout, getPrimaryWorkout } from '../lib'

const components = [
  {
    IsSection: true,
    Name: 'Warm-up',
    Description: '',
    Comment: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: false,
    Name: 'Warm-up',
    Description:
      '3 Rounds\r\n' +
      '10 Goblet Squats\r\n' +
      '5 Jefferson Curl\r\n' +
      '5 Good Mornings\r\n' +
      '10 Prone Dowel Presses (lying face down, press dowel from back rack to OH position)\r\n' +
      '5 90/90 Hip rotations, seated\r\n' +
      '10 Cal Row',
    Comment: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: true,
    Name: 'Metcon',
    Description: '',
    Comment: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: false,
    Name: 'The CrossFit Total',
    Description: '',
    Comment: '',
    TotalWeightLiftingComponents: { List: ['Back Squat', 'Shoulder Press', 'Deadlift'] },
  },
  {
    IsSection: true,
    Name: 'Extra Work',
    Description: '',
    Comment: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: true,
    Name: 'Weightlifting',
    Description: '',
    Comment: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: false,
    Name: 'Snatch Pull',
    Comment: '3RM\r\n3 @95%  \r\n3 @90% ',
    Description: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: true,
    Name: 'Gymnastics',
    Comment: '',
    Description: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
  {
    IsSection: false,
    Name: 'Strict Pull-up',
    Comment:
      'EMOM 10\r\n' + 'x Strict Pull Ups\r\n' + '\r\n' + '*Find a rep range you can hold each minute for 10 sets"',
    Description: '',
    TotalWeightLiftingComponents: { List: [], EmptyListItem: '' },
  },
]

const main = getPrimaryWorkout(components)

console.log(formatWorkout(main))
