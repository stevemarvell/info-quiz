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
import { useHistory } from 'react-router-dom';

const AssessmentEdit: React.FC = () => {
  const [saving] = useState(false);
  const history = useHistory();

  // NOTE: Full implementation with React Hook Form needed
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
          <IonTitle>Edit Assessment</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {saving && <IonSpinner />}
        <p style={{ padding: '1rem' }}>
          TODO: Implement full assessment edit form with React Hook Form
        </p>
      </IonContent>
    </IonPage>
  );
};

export default AssessmentEdit;
