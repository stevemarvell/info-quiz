import { useState } from 'react';
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
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonRange
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api } from '../services/api';
import { Quiz, Metric, Question, Answer, MetricScore } from '../types';

const AdminQuizCreate: React.FC = () => {
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const addMetric = () => {
    const newMetric: Metric = {
      id: `metric-${Date.now()}`,
      name: '',
      description: ''
    };
    setMetrics([...metrics, newMetric]);
  };

  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: value };
    setMetrics(updated);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      answers: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], text };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    const newAnswer: Answer = {
      id: `a-${Date.now()}`,
      text: '',
      metricScores: metrics.map(m => ({ metricId: m.id, score: 0 }))
    };
    updated[questionIndex].answers.push(newAnswer);
    setQuestions(updated);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, text: string) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex].text = text;
    setQuestions(updated);
  };

  const updateAnswerMetricScore = (
    questionIndex: number,
    answerIndex: number,
    metricId: string,
    score: number
  ) => {
    const updated = [...questions];
    const answer = updated[questionIndex].answers[answerIndex];
    const scoreIndex = answer.metricScores.findIndex(ms => ms.metricId === metricId);
    if (scoreIndex >= 0) {
      answer.metricScores[scoreIndex].score = score;
    }
    setQuestions(updated);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter(
      (_, i) => i !== answerIndex
    );
    setQuestions(updated);
  };

  const handleSave = async () => {
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title,
      description,
      metrics,
      questions
    };

    try {
      await api.createQuiz(quiz);
      history.push('/admin');
    } catch (error) {
      console.error('Error creating quiz:', error);
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
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '1rem' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Quiz Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                  value={title}
                  onIonChange={e => setTitle(e.detail.value!)}
                  placeholder="Enter quiz title"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={description}
                  onIonChange={e => setDescription(e.detail.value!)}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </IonItem>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Metrics
                <IonButton onClick={addMetric} size="small" style={{ float: 'right' }}>
                  <IonIcon icon={add} />
                  Add Metric
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {metrics.length === 0 ? (
                <p>No metrics added yet</p>
              ) : (
                metrics.map((metric, index) => (
                  <IonCard key={metric.id}>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel position="stacked">Metric Name</IonLabel>
                        <IonInput
                          value={metric.name}
                          onIonChange={e => updateMetric(index, 'name', e.detail.value!)}
                          placeholder="e.g., Physical Health"
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Description</IonLabel>
                        <IonInput
                          value={metric.description}
                          onIonChange={e => updateMetric(index, 'description', e.detail.value!)}
                          placeholder="Brief description"
                        />
                      </IonItem>
                      <IonButton
                        color="danger"
                        size="small"
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
                <IonButton onClick={addQuestion} size="small" style={{ float: 'right' }}>
                  <IonIcon icon={add} />
                  Add Question
                </IonButton>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
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
                        <IonLabel position="stacked">Question Text</IonLabel>
                        <IonTextarea
                          value={question.text}
                          onIonChange={e => updateQuestion(qIndex, e.detail.value!)}
                          placeholder="Enter your question"
                        />
                      </IonItem>
                      <IonButton onClick={() => addAnswer(qIndex)} size="small">
                        <IonIcon icon={add} />
                        Add Answer
                      </IonButton>
                      <IonButton
                        color="danger"
                        size="small"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <IonIcon icon={trash} />
                        Remove Question
                      </IonButton>

                      {question.answers.map((answer, aIndex) => (
                        <IonCard key={answer.id} style={{ marginTop: '1rem' }}>
                          <IonCardContent>
                            <IonItem>
                              <IonLabel position="stacked">Answer Text</IonLabel>
                              <IonInput
                                value={answer.text}
                                onIonChange={e =>
                                  updateAnswer(qIndex, aIndex, e.detail.value!)
                                }
                                placeholder="Enter answer"
                              />
                            </IonItem>

                            <h4 style={{ marginTop: '1rem' }}>Metric Scores (0-5)</h4>
                            {metrics.map(metric => {
                              const metricScore = answer.metricScores.find(
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
                                    onIonChange={e =>
                                      updateAnswerMetricScore(
                                        qIndex,
                                        aIndex,
                                        metric.id,
                                        e.detail.value as number
                                      )
                                    }
                                  />
                                </IonItem>
                              );
                            })}

                            <IonButton
                              color="danger"
                              size="small"
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminQuizCreate;
