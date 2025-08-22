import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import { Layout } from './components/Layout';
import { UserActivityPage } from './pages/UserActivityPage';
import { ChatAppActivity } from './pages/ChatAppActivity';
import { NotFoundPage } from './pages/NotFoundPage';

const App: FC = () => {
  return (
    <UserProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/user-activities" replace />} />
          <Route path="/user-activities" element={<UserActivityPage />} />
          <Route path="/user-activities/chat-app" element={<ChatAppActivity />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </UserProvider>
  );
};

export default App;