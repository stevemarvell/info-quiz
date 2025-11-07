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
  IonButtons,
  IonIcon,
  IonSpinner,
  IonAlert
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';
import { Quiz } from '../types';

const AdminQuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState<string>('');
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

  const handleDelete = async () => {
    try {
      await api.deleteQuiz(deleteQuizId);
      await loadQuizzes();
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin - Quiz Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/admin/create')}>
              <IonIcon icon={add} />
              Create Quiz
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {quizzes.length === 0 ? (
              <IonItem>
                <IonLabel>No quizzes created yet</IonLabel>
              </IonItem>
            ) : (
              quizzes.map(quiz => (
                <IonItem key={quiz.id}>
                  <IonLabel>
                    <h2>{quiz.title}</h2>
                    <p>{quiz.description}</p>
                    <p>{quiz.questions.length} questions, {quiz.metrics.length} metrics</p>
                  </IonLabel>
                  <IonButton onClick={() => history.push(`/admin/edit/${quiz.id}`)}>
                    <IonIcon icon={create} />
                  </IonButton>
                  <IonButton
                    color="danger"
                    onClick={() => {
                      setDeleteQuizId(quiz.id);
                      setShowDeleteAlert(true);
                    }}
                  >
                    <IonIcon icon={trash} />
                  </IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        )}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Quiz"
          message="Are you sure you want to delete this quiz?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Delete',
              handler: handleDelete
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminQuizList;
