import { IQuizRepository } from './repositories/IQuizRepository';
import { Quiz } from './shared';
import { logger } from './utils/logger';

export function initializeSampleData(quizRepository: IQuizRepository) {
  const wellbeingQuiz: Quiz = {
    id: 'wellbeing-quiz-1',
    title: 'Wellbeing Assessment',
    description: 'Assess your overall wellbeing across multiple dimensions',
    metrics: [
      {
        id: 'physical',
        name: 'Physical Health',
        description: 'Your physical wellbeing and fitness level'
      },
      {
        id: 'mental',
        name: 'Mental Health',
        description: 'Your emotional and mental wellbeing'
      },
      {
        id: 'social',
        name: 'Social Connection',
        description: 'The quality of your relationships and social life'
      },
      {
        id: 'purpose',
        name: 'Purpose & Meaning',
        description: 'Sense of purpose and fulfillment in life'
      },
      {
        id: 'financial',
        name: 'Financial Security',
        description: 'Your financial stability and security'
      }
    ],
    questions: [
      {
        id: 'q1',
        text: 'How would you rate your sleep quality?',
        answers: [
          {
            id: 'q1a1',
            text: 'Excellent - I sleep well and wake refreshed',
            metricScores: [
              { metricId: 'physical', score: 5 },
              { metricId: 'mental', score: 4 }
            ]
          },
          {
            id: 'q1a2',
            text: 'Fair - I sometimes have trouble sleeping',
            metricScores: [
              { metricId: 'physical', score: 2 },
              { metricId: 'mental', score: 2 }
            ]
          },
          {
            id: 'q1a3',
            text: 'Poor - I often struggle with sleep',
            metricScores: [
              { metricId: 'physical', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q2',
        text: 'How often do you engage in physical exercise?',
        answers: [
          {
            id: 'q2a1',
            text: 'Daily or almost every day',
            metricScores: [
              { metricId: 'physical', score: 5 },
              { metricId: 'mental', score: 3 }
            ]
          },
          {
            id: 'q2a2',
            text: '2-3 times per week',
            metricScores: [
              { metricId: 'physical', score: 3 },
              { metricId: 'mental', score: 2 }
            ]
          },
          {
            id: 'q2a3',
            text: 'Rarely or never',
            metricScores: [
              { metricId: 'physical', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q3',
        text: 'How do you feel about your stress levels?',
        answers: [
          {
            id: 'q3a1',
            text: 'Well-managed and under control',
            metricScores: [
              { metricId: 'mental', score: 5 },
              { metricId: 'physical', score: 3 }
            ]
          },
          {
            id: 'q3a2',
            text: 'Sometimes overwhelming',
            metricScores: [
              { metricId: 'mental', score: 2 },
              { metricId: 'physical', score: 1 }
            ]
          },
          {
            id: 'q3a3',
            text: 'Frequently stressed and anxious',
            metricScores: [
              { metricId: 'mental', score: 0 },
              { metricId: 'physical', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q4',
        text: 'How connected do you feel to friends and family?',
        answers: [
          {
            id: 'q4a1',
            text: 'Very connected with regular meaningful interactions',
            metricScores: [
              { metricId: 'social', score: 5 },
              { metricId: 'mental', score: 4 }
            ]
          },
          {
            id: 'q4a2',
            text: 'Somewhat connected but could improve',
            metricScores: [
              { metricId: 'social', score: 2 },
              { metricId: 'mental', score: 2 }
            ]
          },
          {
            id: 'q4a3',
            text: 'Isolated and disconnected',
            metricScores: [
              { metricId: 'social', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q5',
        text: 'Do you feel a sense of purpose in your daily activities?',
        answers: [
          {
            id: 'q5a1',
            text: 'Yes, my days feel meaningful and purposeful',
            metricScores: [
              { metricId: 'purpose', score: 5 },
              { metricId: 'mental', score: 4 }
            ]
          },
          {
            id: 'q5a2',
            text: 'Sometimes, but not consistently',
            metricScores: [
              { metricId: 'purpose', score: 2 },
              { metricId: 'mental', score: 2 }
            ]
          },
          {
            id: 'q5a3',
            text: 'No, I often feel directionless',
            metricScores: [
              { metricId: 'purpose', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q6',
        text: 'How comfortable are you with your current financial situation?',
        answers: [
          {
            id: 'q6a1',
            text: 'Very comfortable and secure',
            metricScores: [
              { metricId: 'financial', score: 5 },
              { metricId: 'mental', score: 3 }
            ]
          },
          {
            id: 'q6a2',
            text: 'Managing but with some concerns',
            metricScores: [
              { metricId: 'financial', score: 2 },
              { metricId: 'mental', score: 1 }
            ]
          },
          {
            id: 'q6a3',
            text: 'Struggling and worried',
            metricScores: [
              { metricId: 'financial', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q7',
        text: 'How would you describe your eating habits?',
        answers: [
          {
            id: 'q7a1',
            text: 'Balanced and nutritious most of the time',
            metricScores: [
              { metricId: 'physical', score: 5 },
              { metricId: 'mental', score: 2 }
            ]
          },
          {
            id: 'q7a2',
            text: 'Inconsistent but trying',
            metricScores: [
              { metricId: 'physical', score: 2 },
              { metricId: 'mental', score: 1 }
            ]
          },
          {
            id: 'q7a3',
            text: 'Poor nutrition habits',
            metricScores: [
              { metricId: 'physical', score: 0 },
              { metricId: 'mental', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q8',
        text: 'Do you engage in hobbies or activities you enjoy?',
        answers: [
          {
            id: 'q8a1',
            text: 'Yes, regularly',
            metricScores: [
              { metricId: 'purpose', score: 4 },
              { metricId: 'mental', score: 5 },
              { metricId: 'social', score: 3 }
            ]
          },
          {
            id: 'q8a2',
            text: 'Occasionally when I have time',
            metricScores: [
              { metricId: 'purpose', score: 2 },
              { metricId: 'mental', score: 2 },
              { metricId: 'social', score: 1 }
            ]
          },
          {
            id: 'q8a3',
            text: 'Rarely or never',
            metricScores: [
              { metricId: 'purpose', score: 0 },
              { metricId: 'mental', score: 0 },
              { metricId: 'social', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q9',
        text: 'How satisfied are you with your work-life balance?',
        answers: [
          {
            id: 'q9a1',
            text: 'Very satisfied',
            metricScores: [
              { metricId: 'mental', score: 5 },
              { metricId: 'social', score: 4 },
              { metricId: 'physical', score: 3 }
            ]
          },
          {
            id: 'q9a2',
            text: 'Somewhat satisfied',
            metricScores: [
              { metricId: 'mental', score: 2 },
              { metricId: 'social', score: 2 },
              { metricId: 'physical', score: 1 }
            ]
          },
          {
            id: 'q9a3',
            text: 'Not satisfied',
            metricScores: [
              { metricId: 'mental', score: 0 },
              { metricId: 'social', score: 0 },
              { metricId: 'physical', score: 0 }
            ]
          }
        ]
      },
      {
        id: 'q10',
        text: 'How often do you practice mindfulness or relaxation techniques?',
        answers: [
          {
            id: 'q10a1',
            text: 'Daily practice',
            metricScores: [
              { metricId: 'mental', score: 5 },
              { metricId: 'physical', score: 3 },
              { metricId: 'purpose', score: 3 }
            ]
          },
          {
            id: 'q10a2',
            text: 'Occasionally',
            metricScores: [
              { metricId: 'mental', score: 2 },
              { metricId: 'physical', score: 1 },
              { metricId: 'purpose', score: 1 }
            ]
          },
          {
            id: 'q10a3',
            text: 'Never',
            metricScores: [
              { metricId: 'mental', score: 0 },
              { metricId: 'physical', score: 0 },
              { metricId: 'purpose', score: 0 }
            ]
          }
        ]
      }
    ]
  };

  quizRepository.create(wellbeingQuiz);
  logger.info('Sample wellbeing quiz created');
}
