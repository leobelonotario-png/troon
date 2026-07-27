import { useState, type FormEvent } from 'react';
import { Button, Field, Input } from '../shared/components/ui';
import { useAuth } from './auth';

export function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível iniciar a sessão.');
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm"
      >
        <img src="/logo.png" alt="Troon Capital" className="mb-6 h-12 w-fit" />
        <h1 className="m-0 text-2xl">Acessar plataforma</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Entre com as credenciais de administrador.
        </p>
        <div className="grid gap-4">
          <Field label="E-mail">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          {error && (
            <p className="m-0 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>
        </div>
      </form>
    </main>
  );
}
