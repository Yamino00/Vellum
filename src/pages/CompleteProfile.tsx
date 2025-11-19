import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Stepper, { Step } from '../components/Stepper';

export const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, reloadProfile } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    eta: '',
    genere: ''
  });
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;

    // Validazione
    if (!formData.nome || !formData.cognome || !formData.eta || !formData.genere) {
      alert('Per favore completa tutti i campi');
      return;
    }

    const eta = parseInt(formData.eta);
    if (isNaN(eta) || eta < 1 || eta > 150) {
      alert('Inserisci un\'età valida');
      return;
    }

    setLoading(true);

    try {
      // Aggiorna il record utente con le informazioni mancanti
      const { error } = await supabase
        .from('utenti')
        .update({
          nome: formData.nome,
          cognome: formData.cognome,
          eta: eta,
          genere: formData.genere
        })
        .eq('id', user.id);

      if (error) throw error;

      // Ricarica il profilo per aggiornare i dati nella navbar
      await reloadProfile();

      // Reindirizza alla home
      navigate('/');
    } catch (error) {
      console.error('Error completing profile:', error);
      alert('Errore durante il salvataggio dei dati');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Stepper
        initialStep={1}
        onFinalStepCompleted={handleComplete}
        stepCircleContainerClassName="bg-white shadow-2xl"
        nextButtonProps={{ disabled: loading }}
      >
        <Step>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Benvenuto!</h2>
            <p className="text-gray-600">
              Completa il tuo profilo per iniziare a utilizzare la biblioteca
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci il tuo nome"
              />
            </div>
          </div>
        </Step>

        <Step>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Informazioni personali</h2>
            <p className="text-gray-600">
              Aiutaci a conoscerti meglio
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cognome
              </label>
              <input
                type="text"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci il tuo cognome"
              />
            </div>
          </div>
        </Step>

        <Step>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Età e Genere</h2>
            <p className="text-gray-600">
              Ultimi dettagli per completare il profilo
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Età
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={formData.eta}
                  onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci la tua età"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Genere
                </label>
                <select
                  value={formData.genere}
                  onChange={(e) => setFormData({ ...formData, genere: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleziona...</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                  <option value="Altro">Altro</option>
                  <option value="Preferisco non rispondere">Preferisco non rispondere</option>
                </select>
              </div>
            </div>
          </div>
        </Step>
      </Stepper>
    </div>
  );
};
