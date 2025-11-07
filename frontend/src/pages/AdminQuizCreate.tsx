import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonIcon,
  IonRange,
  IonNote
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Quiz, QuizSchema } from '@quiz-app/shared';
import { api } from '../services/api';
import { FormField } from '../components/FormField';
import { useToast } from '../hooks/useToast';

const AdminQuizCreate: React.FC = () => {
  const history = useHistory();
  const { showSuccess, showError } = useToast();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Quiz>({
    resolver: zodResolver(QuizSchema),
    defaultValues: {
      id: `quiz-${uuidv4()}`,
      title: '',
      description: '',
      metrics: [],
      questions: []
    }
  });

  const {
    fields: metrics,
    append: appendMetric,
    remove: removeMetric
  } = useFieldArray({ control, name: 'metrics' });

  const {
    fields: questions,
    append: appendQuestion,
    remove: removeQuestion
  } = useFieldArray({ control, name: 'questions' });

  const watchedMetrics = watch('metrics');
  const watchedQuestions = watch('questions');

  const addMetric = () => {
    appendMetric({ id: `m-${uuidv4()}`, name: '', description: '' });
  };

  const addQuestion = () => {
    appendQuestion({ id: `q-${uuidv4()}`, text: '', answers: [] });
  };

  const addAnswer = (questionIndex: number) => {
    const answers = watchedQuestions[questionIndex]?.answers || [];
    setValue(`questions.${questionIndex}.answers`, [
      ...answers,
      {
        id: `a-${uuidv4()}`,
        text: '',
        metricScores: watchedMetrics.map(m => ({ metricId: m.id, score: 0 }))
      }
    ]);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const answers = watchedQuestions[questionIndex]?.answers || [];
    setValue(
      `questions.${questionIndex}.answers`,
      answers.filter((_, i) => i !== answerIndex)
    );
  };

  const onSubmit = async (data: Quiz) => {
    try {
      await api.createQuiz(data);
      showSuccess('Quiz created successfully!');
      history.push('/admin');
    } catch (error: any) {
      // Error creating quiz
      showError(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin" />
          </IonButtons>
          <IonTitle>Create Quiz</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <form style={{ padding: '1rem' }}>
          {/* Quiz Details */}
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

          {/* Metrics */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Metrics
                <IonButton onClick={addMetric} size="small" style={{ float: 'right' }}>
                  <IonIcon icon={add} /> Add
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {metrics.length === 0 && <p>Add at least one metric</p>}
              {metrics.map((metric, index) => (
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
                      <IonNote color="danger">{errors.metrics[index]?.name?.message}</IonNote>
                    )}
                    <IonItem>
                      <IonLabel position="stacked">Description</IonLabel>
                      <IonInput {...register(`metrics.${index}.description`)} />
                    </IonItem>
                    <IonButton color="danger" size="small" onClick={() => removeMetric(index)}>
                      <IonIcon icon={trash} /> Remove
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
              {errors.metrics && typeof errors.metrics === 'object' && !Array.isArray(errors.metrics) && (
                <IonNote color="danger">{(errors.metrics as any).message}</IonNote>
              )}
            </IonCardContent>
          </IonCard>

          {/* Questions */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Questions
                <IonButton
                  onClick={addQuestion}
                  size="small"
                  style={{ float: 'right' }}
                  disabled={metrics.length === 0}
                >
                  <IonIcon icon={add} /> Add
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {metrics.length === 0 && (
                <IonNote color="warning">Add metrics first</IonNote>
              )}
              {questions.map((question, qIndex) => (
                <IonCard key={question.id}>
                  <IonCardHeader>
                    <IonCardTitle>Question {qIndex + 1}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonLabel position="stacked">Question Text *</IonLabel>
                      <IonTextarea {...register(`questions.${qIndex}.text`)} />
                    </IonItem>
                    {errors.questions?.[qIndex]?.text && (
                      <IonNote color="danger">{errors.questions[qIndex]?.text?.message}</IonNote>
                    )}

                    <div style={{ marginTop: '1rem' }}>
                      <IonButton onClick={() => addAnswer(qIndex)} size="small">
                        <IonIcon icon={add} /> Add Answer
                      </IonButton>
                      <IonButton color="danger" size="small" onClick={() => removeQuestion(qIndex)}>
                        <IonIcon icon={trash} /> Remove Question
                      </IonButton>
                    </div>

                    {/* Answers */}
                    {watchedQuestions[qIndex]?.answers?.map((answer, aIndex) => (
                      <IonCard key={answer.id} style={{ marginTop: '1rem' }}>
                        <IonCardContent>
                          <IonItem>
                            <IonLabel position="stacked">Answer Text *</IonLabel>
                            <IonInput
                              {...register(`questions.${qIndex}.answers.${aIndex}.text`)}
                            />
                          </IonItem>
                          {errors.questions?.[qIndex]?.answers?.[aIndex]?.text && (
                            <IonNote color="danger">
                              {errors.questions[qIndex]?.answers?.[aIndex]?.text?.message}
                            </IonNote>
                          )}

                          <h4 style={{ marginTop: '1rem' }}>Metric Scores (0-5)</h4>
                          {watchedMetrics.map((metric, mIndex) => {
                            const score =
                              watchedQuestions[qIndex]?.answers?.[aIndex]?.metricScores?.find(
                                ms => ms.metricId === metric.id
                              )?.score || 0;

                            return (
                              <IonItem key={metric.id}>
                                <IonLabel>{metric.name}: {score}</IonLabel>
                                <IonRange
                                  min={0}
                                  max={5}
                                  value={score}
                                  onIonChange={(e) => {
                                    const newScore = e.detail.value as number;
                                    const scores = watchedQuestions[qIndex]?.answers?.[aIndex]?.metricScores || [];
                                    const updatedScores = scores.map(ms =>
                                      ms.metricId === metric.id ? { ...ms, score: newScore } : ms
                                    );
                                    setValue(
                                      `questions.${qIndex}.answers.${aIndex}.metricScores`,
                                      updatedScores
                                    );
                                  }}
                                />
                              </IonItem>
                            );
                          })}

                          <IonButton
                            color="danger"
                            size="small"
                            onClick={() => removeAnswer(qIndex, aIndex)}
                          >
                            <IonIcon icon={trash} /> Remove Answer
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    ))}
                    {errors.questions?.[qIndex]?.answers && (
                      <IonNote color="danger">At least 2 answers required</IonNote>
                    )}
                  </IonCardContent>
                </IonCard>
              ))}
            </IonCardContent>
          </IonCard>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default AdminQuizCreate;
