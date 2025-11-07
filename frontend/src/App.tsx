import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { create, list } from 'ionicons/icons';

import Home from './pages/Home';
import AdminQuizList from './pages/AdminQuizList';
import AdminQuizCreate from './pages/AdminQuizCreate';
import AdminQuizEdit from './pages/AdminQuizEdit';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/admin">
            <AdminQuizList />
          </Route>
          <Route exact path="/admin/create">
            <AdminQuizCreate />
          </Route>
          <Route exact path="/admin/edit/:id">
            <AdminQuizEdit />
          </Route>
          <Route exact path="/quiz/:id">
            <TakeQuiz />
          </Route>
          <Route exact path="/results/:quizId">
            <QuizResults />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon icon={list} />
            <IonLabel>Quizzes</IonLabel>
          </IonTabButton>
          <IonTabButton tab="admin" href="/admin">
            <IonIcon icon={create} />
            <IonLabel>Admin</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
