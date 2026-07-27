import { useAppModel } from './app.model';
import { AppView } from './app.view';
import { useAuth } from './auth';
import { LoginView } from './login.view';
export function App() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginView />;
  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  return <AppView {...useAppModel()} />;
}
