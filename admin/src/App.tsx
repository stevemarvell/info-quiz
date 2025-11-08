import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import AssessmentList from './pages/AssessmentList';
import AssessmentCreate from './pages/AssessmentCreate';
import AssessmentEdit from './pages/AssessmentEdit';

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
      <IonRouterOutlet>
        <Route exact path="/">
          <AssessmentList />
        </Route>
        <Route exact path="/create">
          <AssessmentCreate />
        </Route>
        <Route exact path="/edit/:id">
          <AssessmentEdit />
        </Route>
        <Route exact path="/index.html">
          <Redirect to="/" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
