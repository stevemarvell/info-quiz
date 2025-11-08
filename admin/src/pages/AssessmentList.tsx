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
import { Assessment } from '../shared/types';
import { useToast } from '../hooks/useToast';

const AssessmentList: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteAssessmentId, setDeleteAssessmentId] = useState<string>('');
  const history = useHistory();
  const { showSuccess, showError } = useToast();

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

  const handleDelete = async () => {
    try {
      await api.deleteAssessment(deleteAssessmentId);
      showSuccess('Assessment deleted successfully!');
      await loadAssessments();
      setShowDeleteAlert(false);
    } catch (error) {
      showError('Failed to delete assessment');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assessment Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/create')}>
              <IonIcon icon={add} />
              Create Assessment
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
            {assessments.length === 0 ? (
              <IonItem>
                <IonLabel>No assessments created yet</IonLabel>
              </IonItem>
            ) : (
              assessments.map(assessment => (
                <IonItem key={assessment.id}>
                  <IonLabel>
                    <h2>{assessment.title}</h2>
                    <p>{assessment.description}</p>
                    <p>{assessment.questions.length} questions, {assessment.metrics.length} metrics</p>
                  </IonLabel>
                  <IonButton onClick={() => history.push(`/edit/${assessment.id}`)}>
                    <IonIcon icon={create} />
                  </IonButton>
                  <IonButton
                    color="danger"
                    onClick={() => {
                      setDeleteAssessmentId(assessment.id);
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
          header="Delete Assessment"
          message="Are you sure you want to delete this assessment?"
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

export default AssessmentList;
