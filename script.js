document.addEventListener('DOMContentLoaded', function() {
    // DOM elementy
    const planInput = document.getElementById('plan-input');
    const currentPlan = document.getElementById('current-plan');
    const activityInput = document.getElementById('activity-input');
    const saveButton = document.getElementById('save-button');
    const doneButton = document.getElementById('done-button');
    const todaysActivity = document.getElementById('todays-activity');
    const completedList = document.getElementById('completed-list');
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    const planTimeEl = document.getElementById('plan-time');
    const planDateEl = document.getElementById('plan-date');
    
    // Aktualizace času a data
    function updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        timeEl.textContent = timeString;
        dateEl.textContent = dateString;
        planTimeEl.textContent = timeString;
        planDateEl.textContent = dateString;
        
        return now;
    }

    // Získání čísla týdne v roce
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    // Formátování datumu pro ID týdne
    function getWeekId(date) {
        const weekNum = getWeekNumber(date);
        return `${date.getFullYear()}-w${weekNum.toString().padStart(2, '0')}`;
    }

    // Formátování datumu pro zobrazení
    function formatDate(date) {
        return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
    }
    
    // Zobrazení nebo skrytí formuláře na základě toho, zda máme dnešní plán
    function updateView() {
        const now = updateDateTime();
        const todayString = now.toLocaleDateString('cs-CZ');
        const plan = localStorage.getItem('plan_' + todayString);
        
        if (plan) {
            // Máme dnešní plán - skrýt formulář a ukázat aktuální plán
            planInput.classList.add('hidden');
            currentPlan.classList.remove('hidden');
            todaysActivity.textContent = plan;
        } else {
            // Nemáme dnešní plán - ukázat formulář
            planInput.classList.remove('hidden');
            currentPlan.classList.add('hidden');
            
            // Pokud je po 21:00, změnit placeholder na zítřejší datum
            const hours = now.getHours();
            if (hours >= 21) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowString = tomorrow.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
                activityInput.placeholder = `Zadej hlavní úkol na zítra (${tomorrowString})`;
            } else {
                activityInput.placeholder = "Zadej hlavní úkol na dnešek";
            }
        }
        
        // Načíst hotové úkoly
        loadCompletedTasks();
    }
    
    // Uložení plánu
    function savePlan() {
        const activity = activityInput.value.trim();
        
        if (activity === '') {
            alert('Prosím, zadej aktivitu.');
            return;
        }
        
        // Určení, zda se plán ukládá pro dnešek nebo zítřek na základě času
        const now = new Date();
        const targetDate = new Date();
        
        // Pokud je po 21:00, ukládá se plán na zítřek
        if (now.getHours() >= 21) {
            targetDate.setDate(targetDate.getDate() + 1);
        }
        
        const targetDateString = targetDate.toLocaleDateString('cs-CZ');
        localStorage.setItem('plan_' + targetDateString, activity);
        
        // Resetovat vstup a potvrdit uložení
        activityInput.value = '';
        
        // Animace potvrzení
        saveButton.textContent = "✓ Uloženo";
        saveButton.style.backgroundColor = "var(--success-color)";
        
        setTimeout(() => {
            saveButton.textContent = "Uložit";
            saveButton.style.backgroundColor = "var(--primary-color)";
            updateView();
        }, 1500);
    }
    
    // Označení dnešního úkolu jako hotového
    function markAsDone() {
        const now = new Date();
        const todayString = now.toLocaleDateString('cs-CZ');
        const plan = localStorage.getItem('plan_' + todayString);
        
        if (plan) {
            // Uložit do seznamu hotových úkolů
            const completedTasks = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
            completedTasks.unshift({
                task: plan,
                date: todayString,
                timestamp: now.getTime()
            });
            localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
            
            // Odstranit dnešní plán
            localStorage.removeItem('plan_' + todayString);
            
            // Aktualizovat zobrazení
            updateView();
        }
    }
    
    // Načtení hotových úkolů
    function loadCompletedTasks() {
        const completedTasks = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
        completedList.innerHTML = '';
        
        if (completedTasks.length === 0) {
            completedList.innerHTML = '<p class="empty-list">Zatím žádné hotové úkoly.</p>';
            return;
        }
        
        // Seskupení úkolů podle týdnů
        const tasksByWeek = {};
        
        completedTasks.forEach(task => {
            const taskDate = new Date(task.timestamp);
            const weekId = getWeekId(taskDate);
            
            if (!tasksByWeek[weekId]) {
                tasksByWeek[weekId] = [];
            }
            tasksByWeek[weekId].push(task);
        });
        
        // Vytvoření HTML pro každý týden
        Object.keys(tasksByWeek).sort().reverse().forEach(weekId => {
            const weekTasks = tasksByWeek[weekId];
            
            const weekDiv = document.createElement('div');
            weekDiv.classList.add('week-group');
            
            const weekLabel = document.createElement('div');
            weekLabel.classList.add('week-label');
            weekLabel.textContent = weekId;
            weekDiv.appendChild(weekLabel);
            
            weekTasks.forEach(task => {
                const taskDate = new Date(task.timestamp);
                const taskEl = document.createElement('div');
                taskEl.classList.add('completed-item');
                
                const dateEl = document.createElement('span');
                dateEl.classList.add('date-badge');
                dateEl.textContent = formatDate(taskDate);
                
                const textEl = document.createElement('span');
                textEl.classList.add('completed-text');
                textEl.textContent = task.task;
                
                taskEl.appendChild(dateEl);
                taskEl.appendChild(textEl);
                weekDiv.appendChild(taskEl);
            });
            
            completedList.appendChild(weekDiv);
        });
    }
    
    // Event listenery
    saveButton.addEventListener('click', savePlan);
    doneButton.addEventListener('click', markAsDone);
    
    activityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            savePlan();
        }
    });
    
    // Inicializace
    updateView();
    
    // Aktualizovat čas každou minutu
    setInterval(() => {
        updateDateTime();
    }, 60000);
    
    // Kontrola, zda má být zobrazen formulář nebo aktuální plán
    setInterval(() => {
        const now = new Date();
        const minutes = now.getMinutes();
        const hours = now.getHours();
        
        // Kontrola v celou hodinu
        if (minutes === 0) {
            // Při 21:00 resetovat pohled (pro změnu placeholderu)
            if (hours === 21) {
                updateView();
            }
            
            // O půlnoci zkontrolovat, zda máme plán na nový den
            if (hours === 0) {
                updateView();
            }
        }
    }, 60000);
});
