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
import { Quiz } from '../types';

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const data = await api.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quizId: string) => {
    history.push(`/quiz/${quizId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Available Quizzes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Available Quizzes</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {quizzes.length === 0 ? (
              <IonItem>
                <IonLabel>No quizzes available</IonLabel>
              </IonItem>
            ) : (
              quizzes.map(quiz => (
                <IonItem key={quiz.id}>
                  <IonLabel>
                    <h2>{quiz.title}</h2>
                    <p>{quiz.description}</p>
                    <p>{quiz.questions.length} questions</p>
                  </IonLabel>
                  <IonButton onClick={() => startQuiz(quiz.id)}>Start</IonButton>
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
