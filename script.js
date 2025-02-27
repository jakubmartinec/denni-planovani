document.addEventListener('DOMContentLoaded', function() {
    // DOM elementy
    const eveningPrompt = document.getElementById('evening-prompt');
    const morningView = document.getElementById('morning-view');
    const activityInput = document.getElementById('activity-input');
    const saveButton = document.getElementById('save-button');
    const todaysActivity = document.getElementById('todays-activity');
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const morningTimeEl = document.getElementById('morning-time');
    const morningDateEl = document.getElementById('morning-date');
    
    // Aktualizace času a data
    function updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        timeEl.textContent = timeString;
        dateEl.textContent = dateString;
        morningTimeEl.textContent = timeString;
        morningDateEl.textContent = dateString;
        
        return now;
    }
    
    // Zobrazí správný pohled na základě času
    function setAppropriateView() {
        const now = updateDateTime();
        const hours = now.getHours();
        
        // Kontrola, jestli je večer (po 18:00) nebo ráno/den (před 18:00)
        if (hours >= 18) {
            // Je večer - zobrazit formulář pro zadání zítřejšího plánu
            document.body.classList.add('evening-mode');
            document.body.classList.remove('morning-mode');
            eveningPrompt.classList.remove('hidden');
            morningView.classList.add('hidden');
        } else {
            // Je ráno/den - zobrazit dnešní plán
            document.body.classList.add('morning-mode');
            document.body.classList.remove('evening-mode');
            morningView.classList.remove('hidden');
            eveningPrompt.classList.add('hidden');
            
            // Načíst dnešní plán
            const today = new Date().toLocaleDateString('cs-CZ');
            const plan = localStorage.getItem('plan_' + today);
            
            if (plan) {
                todaysActivity.textContent = plan;
            } else {
                todaysActivity.textContent = "Pro dnešek nemáš žádný plán.";
            }
        }
    }
    
    // Uložení plánu
    function savePlan() {
        const activity = activityInput.value.trim();
        
        if (activity === '') {
            alert('Prosím, zadej aktivitu na zítra.');
            return;
        }
        
        // Uložit plán pro zítřejší datum
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toLocaleDateString('cs-CZ');
        
        localStorage.setItem('plan_' + tomorrowString, activity);
        
        // Resetovat vstup a potvrdit uložení
        activityInput.value = '';
        
        // Animace potvrzení
        saveButton.textContent = "✓ Uloženo";
        saveButton.style.backgroundColor = "var(--success-color)";
        
        setTimeout(() => {
            saveButton.textContent = "Uložit";
            saveButton.style.backgroundColor = "var(--primary-color)";
        }, 2000);
    }
    
    // Event listenery
    saveButton.addEventListener('click', savePlan);
    activityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            savePlan();
        }
    });
    
    // Inicializace
    setAppropriateView();
    
    // Aktualizovat čas každou minutu
    setInterval(setAppropriateView, 60000);
    
    // Zkontrolovat změnu data každou hodinu
    setInterval(() => {
        const now = new Date();
        // Pokud je půlnoc (0 hodin), překreslit pohled
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            setAppropriateView();
        }
        // Pokud je 18:00, překreslit pohled
        if (now.getHours() === 18 && now.getMinutes() === 0) {
            setAppropriateView();
        }
    }, 60000);
});
