import { useIonToast } from '@ionic/react';

export const useToast = () => {
  const [present] = useIonToast();

  const showSuccess = (message: string) => {
    present({
      message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
  };

  const showError = (message: string) => {
    present({
      message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
  };

  const showInfo = (message: string) => {
    present({
      message,
      duration: 3000,
      position: 'top',
      color: 'primary'
    });
  };

  return { showSuccess, showError, showInfo };
};
