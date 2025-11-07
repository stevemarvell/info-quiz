import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonProgressBar,
  IonLabel,
  IonItem
} from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { QuizResult } from '../types';

const QuizResults: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ result?: QuizResult }>();
  const { quizId } = useParams<{ quizId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location]);

  if (!result) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Results</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>No results available</IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  const getColorByPercentage = (percentage: number): string => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'primary';
    if (percentage >= 40) return 'warning';
    return 'danger';
  };

  const getInterpretation = (percentage: number): string => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Your Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '1rem' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Wellbeing Assessment Results</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Here are your personalized results based on your responses. Each metric reflects
                different aspects of your overall wellbeing.
              </p>
            </IonCardContent>
          </IonCard>

          {result.metricScores.map(metric => (
            <IonCard key={metric.metricId}>
              <IonCardHeader>
                <IonCardTitle>{metric.metricName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>
                      Score: {metric.totalScore} / {metric.maxScore}
                    </h3>
                    <p>Percentage: {metric.percentage.toFixed(1)}%</p>
                    <p>
                      <strong>{getInterpretation(metric.percentage)}</strong>
                    </p>
                  </IonLabel>
                </IonItem>
                <IonProgressBar
                  value={metric.percentage / 100}
                  color={getColorByPercentage(metric.percentage)}
                  style={{ height: '12px', borderRadius: '6px' }}
                />
              </IonCardContent>
            </IonCard>
          ))}

          <IonCard>
            <IonCardContent>
              <h3>Summary</h3>
              <p>
                Your wellbeing assessment is complete. These results provide insights into
                different areas of your life. Consider focusing on areas with lower scores to
                improve your overall wellbeing.
              </p>
            </IonCardContent>
          </IonCard>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <IonButton onClick={() => history.push('/home')}>Return to Home</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QuizResults;
