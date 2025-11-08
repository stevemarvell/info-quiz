import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';

const TakeAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading] = useState(true);
  const history = useHistory();

  // NOTE: Full implementation needed with question rendering and answer selection
  // This is a stub for initial build verification

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Take Assessment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {loading && <IonSpinner />}
        <p style={{ padding: '1rem' }}>
          TODO: Implement assessment taking UI (ID: {id})
        </p>
      </IonContent>
    </IonPage>
  );
};

export default TakeAssessment;
