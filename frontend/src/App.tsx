import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './hooks/useUser';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EntitiesPage } from './pages/EntitiesPage';
import { GridPage } from './pages/GridPage';
import { UserActivityPage } from './pages/UserActivityPage';
import { AuthTestPage } from './pages/AuthTestPage';
import { NotFoundPage } from './pages/NotFoundPage';

const App: FC = () => {
  return (
    <UserProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/entities" element={<EntitiesPage />} />
          <Route path="/grid" element={<GridPage />} />
          <Route path="/user-activities" element={<UserActivityPage />} />
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </UserProvider>
  );
};

export default App;