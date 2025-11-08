import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';
import { Assessment } from '../shared/types';
import { useToast } from '../hooks/useToast';

const Home: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { showError } = useToast();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await api.getAllAssessments();
      setAssessments(data);
    } catch (error) {
      showError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessmentId: string) => {
    history.push(`/assessment/${assessmentId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Available Assessments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Available Assessments</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {assessments.length === 0 ? (
              <IonItem>
                <IonLabel>No assessments available</IonLabel>
              </IonItem>
            ) : (
              assessments.map(assessment => (
                <IonItem key={assessment.id}>
                  <IonLabel>
                    <h2>{assessment.title}</h2>
                    <p>{assessment.description}</p>
                    <p>{assessment.questions.length} questions</p>
                  </IonLabel>
                  <IonButton onClick={() => startAssessment(assessment.id)}>Start</IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
