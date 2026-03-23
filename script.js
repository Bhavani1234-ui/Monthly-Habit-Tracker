const grid = document.getElementById('main-grid');
const monthPicker = document.getElementById('month-picker');
const darkToggle = document.getElementById('dark-mode-toggle');

// --- 1. THEME ENGINE ---
// Initial theme load
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkToggle.checked = true; // Make sure the switch is in the "ON" position
}

// Toggle logic
darkToggle.addEventListener('change', () => {
    const isDark = darkToggle.checked;
    const newTheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- 2. MONTH & GRID ENGINE ---
// Set default view to current month (March 2026 for now)
const defaultMonth = "2026-03"; 
monthPicker.value = defaultMonth;

// Core function: Draw the entire month's grid
function generateGrid() {
    grid.innerHTML = ""; // Clear existing cards
    
    // Break down "YYYY-MM" string (e.g., "2026", "3")
    const [year, month] = monthPicker.value.split('-').map(Number);
    
    // Trick to get last day of month (Month is 1-indexed, so `month` is next month, day 0 is last day of this month)
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        // Create a unique ID for storage (e.g., "2026-3-12")
        const dateKey = `${year}-${month}-${day}`;
        const card = createDayCard(day, dateKey);
        grid.appendChild(card);
    }
}

// Function to build a single card
function createDayCard(dayNum, dateKey) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
        <div class="day-title">Day ${dayNum}</div>
        <input type="text" class="note-input" id="note-${dateKey}" placeholder="Date">
        
        <div class="habit-add-row" style="display: flex; gap: 5px; margin-top: 10px;">
            <input type="text" class="habit-input" placeholder="New Habit..." style="flex:1">
            <button class="add-btn" style="background:#6c5ce7; color:white; border:none; border-radius:4px; padding:5px 12px; cursor:pointer;">+</button>
        </div>
        
        <ul class="task-list" style="list-style:none; padding:0; margin-top:10px;"></ul>
    `;

    setupCardLogic(card, dateKey);
    return card;
}

// Function to handle specific card's loading, saving, and interactions
function setupCardLogic(card, dateKey) {
    const noteInput = card.querySelector('.note-input');
    const taskList = card.querySelector('.task-list');
    const habitInput = card.querySelector('.habit-input');
    const addBtn = card.querySelector('.add-btn');

    // Load saved data for this specific dateKey
    noteInput.value = localStorage.getItem(`note-${dateKey}`) || "";
    const savedHabits = JSON.parse(localStorage.getItem(`habits-${dateKey}`)) || [];
    
    // Draw saved habits
    savedHabits.forEach(h => {
        addHabitToDOM(taskList, h.text, h.completed, dateKey);
    });

    // Save notes as you type
    noteInput.oninput = () => localStorage.setItem(`note-${dateKey}`, noteInput.value);

    // Function to add a single habit row
    function addHabitToDOM(list, text, completed, key) {
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox"; checkbox.checked = completed;
        checkbox.style.cursor = "pointer";

        const span = document.createElement('span');
        span.textContent = text;
        span.style.flex = "1"; span.style.marginLeft = "10px";
        if (completed) span.classList.add('completed-span');

        const delBtn = document.createElement('button');
        delBtn.textContent = "Delete"; delBtn.classList.add('delete-btn');

        // Logic
        checkbox.onchange = () => {
            span.classList.toggle('completed-span', checkbox.checked);
            saveHabits(key, list);
        };
        delBtn.onclick = () => { li.remove(); saveHabits(key, list); };

        li.append(checkbox, span, delBtn);
        list.appendChild(li);
    }

    // Function to collect all list items and save them to storage
    function saveHabits(key, list) {
        const currentHabits = Array.from(list.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('input').checked
        }));
        localStorage.setItem(`habits-${key}`, JSON.stringify(currentHabits));
    }

    // Add function: Button or Enter key
    const runAdd = () => {
        const hText = habitInput.value.trim();
        if(hText) {
            addHabitToDOM(taskList, hText, false, dateKey);
            saveHabits(dateKey, taskList);
            habitInput.value = "";
        }
    };
    addBtn.onclick = runAdd;
    habitInput.onkeypress = (e) => { if(e.key === 'Enter') runAdd(); };
}

// Re-generate grid when month picker changes
monthPicker.addEventListener('change', generateGrid);

// Run the engine on start
generateGrid();