const grid = document.getElementById('main-grid');
const monthPicker = document.getElementById('month-picker');
const darkToggle = document.getElementById('dark-mode-toggle');

// --- 1. THEME ENGINE ---
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkToggle.checked = true;
}

darkToggle.addEventListener('change', () => {
    const isDark = darkToggle.checked;
    const newTheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- 2. MONTH & GRID ENGINE ---
// Default to March 2026
const defaultMonth = "2026-03"; 
monthPicker.value = defaultMonth;

function generateGrid() {
    grid.innerHTML = ""; 
    const [year, month] = monthPicker.value.split('-').map(Number);
    
    // Get total days in the selected month
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month}-${day}`;
        const card = createDayCard(day, dateKey);
        grid.appendChild(card);
    }
}

// Function to build a single card (DATE REMOVED)
function createDayCard(dayNum, dateKey) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
        <div class="day-title" style="font-weight: bold; margin-bottom: 10px;">Day ${dayNum}</div>
        
        <div class="habit-add-row" style="display: flex; gap: 5px; margin-top: 10px;">
            <input type="text" class="habit-input" placeholder="Todays Goal..." style="flex:1; padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
            <button class="add-btn" style="background:#6c5ce7; color:white; border:none; border-radius:4px; padding:5px 12px; cursor:pointer;">+</button>
        </div>
        
        <ul class="task-list" style="list-style:none; padding:0; margin-top:10px;"></ul>
    `;

    setupCardLogic(card, dateKey);
    return card;
}

function setupCardLogic(card, dateKey) {
    const taskList = card.querySelector('.task-list');
    const habitInput = card.querySelector('.habit-input');
    const addBtn = card.querySelector('.add-btn');

    // Load saved habits from LocalStorage
    const savedHabits = JSON.parse(localStorage.getItem(`habits-${dateKey}`)) || [];
    
    savedHabits.forEach(h => {
        addHabitToDOM(taskList, h.text, h.completed, dateKey);
    });

    // Function to add a single habit row to the screen
    function addHabitToDOM(list, text, completed, key) {
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.marginBottom = "8px";
        
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox"; 
        checkbox.checked = completed;
        checkbox.style.cursor = "pointer";

        const span = document.createElement('span');
        span.textContent = text;
        span.style.flex = "1"; 
        span.style.marginLeft = "10px";
        if (completed) span.style.textDecoration = "line-through";

        const delBtn = document.createElement('button');
        delBtn.textContent = "×"; 
        delBtn.style.background = "none";
        delBtn.style.border = "none";
        delBtn.style.color = "#ff7675";
        delBtn.style.cursor = "pointer";
        delBtn.style.fontSize = "18px";
        delBtn.style.fontWeight = "bold";

        // Toggle completion
        checkbox.onchange = () => {
            span.style.textDecoration = checkbox.checked ? "line-through" : "none";
            saveHabits(key, list);
        };

        // Delete habit
        delBtn.onclick = () => { 
            li.remove(); 
            saveHabits(key, list); 
        };

        li.append(checkbox, span, delBtn);
        list.appendChild(li);
    }

    // Function to save current state to LocalStorage
    function saveHabits(key, list) {
        const currentHabits = Array.from(list.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('input').checked
        }));
        localStorage.setItem(`habits-${key}`, JSON.stringify(currentHabits));
    }

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

// Refresh grid when user picks a different month
monthPicker.addEventListener('change', generateGrid);

// Start the app
generateGrid();