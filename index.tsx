import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { TrainingProvider } from './context/TrainingContext';
import { ShooterProvider } from './context/ShooterContext';
import { MatchProvider } from './context/MatchContext';
import { ClassifierProvider } from './context/ClassifierContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';
import { I18nProvider } from './context/I18nContext';
import { P2PProvider } from './context/P2PContext';
import { ArmoryProvider } from './context/ArmoryContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <NotificationProvider>
        <ModalProvider>
          <AuthProvider>
            <ShooterProvider>
              <ArmoryProvider>
                <TrainingProvider>
                  <ClassifierProvider>
                    <MatchProvider>
                      <P2PProvider>
                        <AppProvider>
                          <App />
                        </AppProvider>
                      </P2PProvider>
                    </MatchProvider>
                  </ClassifierProvider>
                </TrainingProvider>
              </ArmoryProvider>
            </ShooterProvider>
          </AuthProvider>
        </ModalProvider>
      </NotificationProvider>
    </I18nProvider>
  </React.StrictMode>,
);