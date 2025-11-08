import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';

const AssessmentResults: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [loading] = useState(true);
  const history = useHistory();

  // NOTE: Full implementation needed with results display
  // This is a stub for initial build verification

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assessment Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading && <IonSpinner />}
        <p style={{ padding: '1rem' }}>
          TODO: Implement results display (Assessment ID: {assessmentId})
        </p>
        <IonButton onClick={() => history.push('/')}>Back to Home</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AssessmentResults;
