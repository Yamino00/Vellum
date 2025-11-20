import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Inizializzazione...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setDebugInfo('Inizio processo di autenticazione...');
        console.log('AuthCallback: Starting authentication process...');
        console.log('AuthCallback: Current URL:', window.location.href);
        console.log('AuthCallback: Hash:', window.location.hash);
        
        // Aspetta che Supabase elabori automaticamente l'hash della URL
        // Supabase gestisce automaticamente i token OAuth nell'hash
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDebugInfo('Verifica sessione...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('AuthCallback: Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          email: session?.user?.email,
          error: sessionError 
        });

        if (sessionError) {
          console.error('AuthCallback: Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log('AuthCallback: No session found, redirecting to login');
          setDebugInfo('Nessuna sessione trovata');
          setError('Sessione non trovata. Riprova.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setDebugInfo(`Sessione trovata per ${session.user.email}`);
        console.log('AuthCallback: Session found, user ID:', session.user.id);
        
        // Aspetta che il trigger crei l'utente nel database
        setDebugInfo('Attesa creazione profilo...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verifica se l'utente esiste nel database
        setDebugInfo('Verifica profilo utente...');
        console.log('AuthCallback: Checking user in database...');
        
        let userData = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        // Riprova fino a 5 volte con pause tra un tentativo e l'altro
        while (attempts < maxAttempts && !userData) {
          attempts++;
          console.log(`AuthCallback: Attempt ${attempts} to fetch user data...`);
          
          const { data, error: userError } = await supabase
            .from('utenti')
            .select('id, nome, cognome, eta, genere, is_admin, email')
            .eq('id', session.user.id)
            .maybeSingle();

          if (data) {
            userData = data;
            console.log('AuthCallback: User data found:', userData);
          } else if (userError && userError.code !== 'PGRST116') {
            console.error('AuthCallback: Error fetching user data:', userError);
          } else {
            console.log(`AuthCallback: User not found yet, waiting... (attempt ${attempts}/${maxAttempts})`);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        // Se dopo tutti i tentativi non c'è l'utente, crealo manualmente
        if (!userData) {
          console.log('AuthCallback: User not found after all attempts, creating manually...');
          setDebugInfo('Creazione profilo manuale...');
          
          const { data: newUser, error: insertError } = await supabase
            .from('utenti')
            .insert([{
              id: session.user.id,
              email: session.user.email || '',
              nome: '',
              cognome: '',
              genere: '',
              eta: 0,
              is_admin: false
            }])
            .select()
            .single();
          
          if (insertError) {
            console.error('AuthCallback: Error creating user:', insertError);
            throw new Error(`Impossibile creare l'utente: ${insertError.message}`);
          }
          
          userData = newUser;
          console.log('AuthCallback: User created:', userData);
        }

        // Verifica se il profilo è completo
        const isProfileComplete = !!(
          userData.nome && 
          userData.nome !== 'Da' &&  // Valore temporaneo del trigger
          userData.cognome && 
          userData.cognome !== 'Completare' &&  // Valore temporaneo del trigger
          userData.eta && 
          userData.eta !== 18 &&  // Valore temporaneo del trigger (a meno che non abbia davvero 18 anni)
          userData.genere &&
          userData.genere !== 'Altro'  // Verifica che non sia il valore di default
        );

        console.log('AuthCallback: Profile check:', {
          nome: userData.nome,
          cognome: userData.cognome,
          eta: userData.eta,
          genere: userData.genere,
          isComplete: isProfileComplete
        });

        if (!isProfileComplete) {
          console.log('AuthCallback: Profile incomplete, redirecting to complete profile');
          setDebugInfo('Profilo incompleto, reindirizzamento...');
          navigate('/complete-profile');
          return;
        }

        // Profilo completo, reindirizza alla dashboard appropriata
        console.log('AuthCallback: Profile complete, redirecting to dashboard');
        setDebugInfo('Profilo completo, reindirizzamento...');
        
        if (userData.is_admin) {
          console.log('AuthCallback: Admin user, redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('AuthCallback: Regular user, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('AuthCallback: Fatal error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'autenticazione';
        setError(errorMessage);
        setDebugInfo(`Errore: ${errorMessage}`);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-600 text-xl font-semibold">⚠️ Errore</div>
            <p className="text-gray-700 font-medium">{error}</p>
            <p className="text-sm text-gray-500">Reindirizzamento alla pagina di login...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-700 text-lg font-semibold">Accesso in corso...</p>
            <p className="text-sm text-gray-600">{debugInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};
