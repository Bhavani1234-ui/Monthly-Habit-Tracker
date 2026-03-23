const grid = document.getElementById('main-grid');
const monthPicker = document.getElementById('month-picker');
const darkToggle = document.getElementById('dark-mode-toggle');

// --- 1. THEME ENGINE ---
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkToggle.checked = true;
}

darkToggle.addEventListener('change', () => {
    const theme = darkToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// --- 2. GRID GENERATION ---
monthPicker.value = "2026-03"; // Default

function generateGrid() {
    grid.innerHTML = "";
    const [year, month] = monthPicker.value.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${month}-${day}`;
        grid.appendChild(createDayCard(day, dateKey));
    }
}

function createDayCard(dayNum, dateKey) {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.innerHTML = `
        <div class="day-title">Day ${dayNum}</div>
        <div style="display: flex; gap: 5px;">
            <input type="text" class="habit-input" placeholder="New Habit...">
            <button class="add-btn" style="background:var(--accent); color:white; border:none; border-radius:8px; padding:0 15px; cursor:pointer;">+</button>
        </div>
        <ul class="task-list" style="list-style:none; padding:0; margin-top:10px;"></ul>
    `;

    const input = card.querySelector('.habit-input');
    const btn = card.querySelector('.add-btn');
    const list = card.querySelector('.task-list');

    // Load existing habits
    const saved = JSON.parse(localStorage.getItem(`habits-${dateKey}`)) || [];
    saved.forEach(h => addHabit(list, h.text, h.completed, dateKey));

    const handleAdd = () => {
        if (input.value.trim()) {
            addHabit(list, input.value, false, dateKey);
            save(dateKey, list);
            input.value = "";
        }
    };

    btn.onclick = handleAdd;
    input.onkeypress = (e) => { if(e.key === 'Enter') handleAdd(); };

    return card;
}

function addHabit(list, text, completed, key) {
    const li = document.createElement('li');
    li.style = "display:flex; align-items:center; margin-bottom:8px; gap:10px;";
    
    const cb = document.createElement('input');
    cb.type = "checkbox"; cb.checked = completed;
    
    const span = document.createElement('span');
    span.textContent = text;
    span.style.flex = "1";
    if (completed) span.style.textDecoration = "line-through";

    cb.onchange = () => {
        span.style.textDecoration = cb.checked ? "line-through" : "none";
        save(key, list);
    };

    li.append(cb, span);
    list.appendChild(li);
}

function save(key, list) {
    const data = Array.from(list.querySelectorAll('li')).map(li => ({
        text: li.querySelector('span').textContent,
        completed: li.querySelector('input').checked
    }));
    localStorage.setItem(`habits-${key}`, JSON.stringify(data));
}

monthPicker.onchange = generateGrid;
generateGrid();