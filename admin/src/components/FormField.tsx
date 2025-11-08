import React from 'react';
import { IonItem, IonLabel, IonInput, IonTextarea, IonNote } from '@ionic/react';
import { FieldError, UseFormRegister } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  register,
  error,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  required = false
}) => {
  return (
    <IonItem>
      <IonLabel position="stacked">
        {label}
        {required && <span style={{ color: 'var(--ion-color-danger)' }}> *</span>}
      </IonLabel>
      {multiline ? (
        <IonTextarea
          {...register(name)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <IonInput
          {...register(name)}
          type={type}
          placeholder={placeholder}
        />
      )}
      {error && (
        <IonNote slot="error" color="danger">
          {error.message}
        </IonNote>
      )}
    </IonItem>
  );
};
