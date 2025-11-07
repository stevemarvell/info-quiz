import { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonSpinner,
  IonButtons,
  IonBackButton,
  IonProgressBar
} from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Quiz, QuizResponse } from '../types';
import { useToast } from '../hooks/useToast';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const { showError } = useToast();

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const data = await api.getQuiz(id);
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      showError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers({
      ...answers,
      [questionId]: answerId
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const response: QuizResponse = {
      quizId: quiz.id,
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      }))
    };

    try {
      const result = await api.submitQuiz(quiz.id, response);
      history.push(`/results/${quiz.id}`, { result });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showError('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading Quiz...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!quiz) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Quiz Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardContent>Quiz not found</IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{quiz.title}</IonTitle>
        </IonToolbar>
        <IonProgressBar value={progress}></IonProgressBar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '1rem' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <h2>{currentQuestion.text}</h2>
              <IonRadioGroup
                value={answers[currentQuestion.id]}
                onIonChange={e => handleAnswerSelect(currentQuestion.id, e.detail.value)}
              >
                {currentQuestion.answers.map(answer => (
                  <IonItem key={answer.id}>
                    <IonLabel>{answer.text}</IonLabel>
                    <IonRadio slot="start" value={answer.id} />
                  </IonItem>
                ))}
              </IonRadioGroup>
            </IonCardContent>
          </IonCard>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <IonButton onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              Previous
            </IonButton>
            {isLastQuestion ? (
              <IonButton onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                Submit
              </IonButton>
            ) : (
              <IonButton onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                Next
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TakeQuiz;
