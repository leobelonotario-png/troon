import { useAppModel } from './app.model';
import { AppView } from './app.view';
export function App() {
  return <AppView {...useAppModel()} />;
}
