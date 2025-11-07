import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonRange,
  IonSpinner,
  IonNote
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../services/api';
import { Quiz, Answer } from '../types';
import { FormField } from '../components/FormField';
import { useToast } from '../hooks/useToast';

const AdminQuizEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<Quiz>({
    defaultValues: {
      id: '',
      title: '',
      description: '',
      metrics: [],
      questions: []
    }
  });

  const { fields: metrics, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'metrics'
  });

  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchedMetrics = watch('metrics');
  const watchedQuestions = watch('questions');

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    if (!id) {
      showError('Quiz ID is missing');
      setLoading(false);
      return;
    }
    try {
      const quiz = await api.getQuiz(id);
      reset(quiz);
    } catch (error) {
      showError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Quiz) => {
    if (!id) {
      showError('Quiz ID is missing');
      return;
    }
    try {
      await api.updateQuiz(id, data);
      showSuccess('Quiz updated successfully!');
      history.push('/admin');
    } catch (error) {
      showError('Failed to update quiz');
    }
  };

  const addMetric = () => {
    appendMetric({
      id: `metric-${uuidv4()}`,
      name: '',
      description: ''
    });
  };

  const addQuestion = () => {
    appendQuestion({
      id: `q-${uuidv4()}`,
      text: '',
      answers: []
    });
  };

  const addAnswer = (questionIndex: number) => {
    const currentAnswers = watchedQuestions[questionIndex]?.answers || [];
    const newAnswer: Answer = {
      id: `a-${uuidv4()}`,
      text: '',
      metricScores: watchedMetrics.map(m => ({ metricId: m.id, score: 0 }))
    };
    setValue(`questions.${questionIndex}.answers`, [...currentAnswers, newAnswer]);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const currentAnswers = watchedQuestions[questionIndex]?.answers || [];
    setValue(
      `questions.${questionIndex}.answers`,
      currentAnswers.filter((_, i) => i !== answerIndex)
    );
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Quiz</IonTitle>
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>Edit Quiz</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '1rem' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quiz Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <FormField
                label="Title"
                name="title"
                register={register}
                error={errors.title}
                placeholder="Enter quiz title"
                required
              />
              <FormField
                label="Description"
                name="description"
                register={register}
                error={errors.description}
                placeholder="Enter quiz description"
                multiline
                rows={3}
              />
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Metrics
                <IonButton onClick={addMetric} size="small" type="button" style={{ float: 'right' }}>
                  <IonIcon icon={add} />
                  Add Metric
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {errors.metrics && (
                <IonNote color="danger">{errors.metrics.message}</IonNote>
              )}
              {metrics.length === 0 ? (
                <p>No metrics added yet</p>
              ) : (
                metrics.map((metric, index) => (
                  <IonCard key={metric.id}>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel position="stacked">Metric Name *</IonLabel>
                        <IonInput
                          {...register(`metrics.${index}.name`)}
                          placeholder="e.g., Physical Health"
                        />
                      </IonItem>
                      {errors.metrics?.[index]?.name && (
                        <IonNote color="danger">
                          {errors.metrics[index]?.name?.message}
                        </IonNote>
                      )}
                      <IonItem>
                        <IonLabel position="stacked">Description</IonLabel>
                        <IonInput
                          {...register(`metrics.${index}.description`)}
                          placeholder="Brief description"
                        />
                      </IonItem>
                      <IonButton
                        color="danger"
                        size="small"
                        type="button"
                        onClick={() => removeMetric(index)}
                      >
                        <IonIcon icon={trash} />
                        Remove
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))
              )}
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Questions
                <IonButton onClick={addQuestion} size="small" type="button" style={{ float: 'right' }}>
                  <IonIcon icon={add} />
                  Add Question
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {errors.questions && (
                <IonNote color="danger">{errors.questions.message}</IonNote>
              )}
              {questions.length === 0 ? (
                <p>No questions added yet</p>
              ) : (
                questions.map((question, qIndex) => (
                  <IonCard key={question.id}>
                    <IonCardHeader>
                      <IonCardTitle>Question {qIndex + 1}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel position="stacked">Question Text *</IonLabel>
                        <IonTextarea
                          {...register(`questions.${qIndex}.text`)}
                          placeholder="Enter your question"
                        />
                      </IonItem>
                      {errors.questions?.[qIndex]?.text && (
                        <IonNote color="danger">
                          {errors.questions[qIndex]?.text?.message}
                        </IonNote>
                      )}
                      <IonButton onClick={() => addAnswer(qIndex)} size="small" type="button">
                        <IonIcon icon={add} />
                        Add Answer
                      </IonButton>
                      <IonButton
                        color="danger"
                        size="small"
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <IonIcon icon={trash} />
                        Remove Question
                      </IonButton>

                      {watchedQuestions[qIndex]?.answers?.map((answer, aIndex) => (
                        <IonCard key={answer.id} style={{ marginTop: '1rem' }}>
                          <IonCardContent>
                            <IonItem>
                              <IonLabel position="stacked">Answer Text *</IonLabel>
                              <IonInput
                                {...register(`questions.${qIndex}.answers.${aIndex}.text`)}
                                placeholder="Enter answer"
                              />
                            </IonItem>
                            {errors.questions?.[qIndex]?.answers?.[aIndex]?.text && (
                              <IonNote color="danger">
                                {errors.questions[qIndex]?.answers?.[aIndex]?.text?.message}
                              </IonNote>
                            )}

                            <h4 style={{ marginTop: '1rem' }}>Metric Scores (0-5)</h4>
                            {watchedMetrics.map((metric, _mIndex) => {
                              const metricScore = answer.metricScores?.find(
                                ms => ms.metricId === metric.id
                              );
                              const scoreIndex = answer.metricScores?.findIndex(
                                ms => ms.metricId === metric.id
                              );

                              return (
                                <IonItem key={metric.id}>
                                  <IonLabel>
                                    {metric.name}: {metricScore?.score || 0}
                                  </IonLabel>
                                  <IonRange
                                    min={0}
                                    max={5}
                                    value={metricScore?.score || 0}
                                    onIonChange={e => {
                                      if (scoreIndex !== undefined && scoreIndex >= 0) {
                                        setValue(
                                          `questions.${qIndex}.answers.${aIndex}.metricScores.${scoreIndex}.score`,
                                          e.detail.value as number
                                        );
                                      }
                                    }}
                                  />
                                </IonItem>
                              );
                            })}

                            <IonButton
                              color="danger"
                              size="small"
                              type="button"
                              onClick={() => removeAnswer(qIndex, aIndex)}
                            >
                              <IonIcon icon={trash} />
                              Remove Answer
                            </IonButton>
                          </IonCardContent>
                        </IonCard>
                      ))}
                    </IonCardContent>
                  </IonCard>
                ))
              )}
            </IonCardContent>
          </IonCard>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminQuizEdit;
