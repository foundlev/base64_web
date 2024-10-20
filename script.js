// Получение элементов
const base64Input = document.getElementById('base64-input');
const textInput = document.getElementById('text-input');
const pasteBase64Btn = document.getElementById('paste-base64');
const copyBase64Btn = document.getElementById('copy-base64');
const pasteTextBtn = document.getElementById('paste-text');
const copyTextBtn = document.getElementById('copy-text');
const formatJsonBtn = document.getElementById('format-json'); // Новый элемент

// Элементы для переключения темы
const themeOptions = document.querySelectorAll('.dropdown-content a');
const selectedThemeSpan = document.getElementById('selected-theme');

// Функции конвертации
function encodeBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64(base64) {
    try {
        return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
        try {
            return atob(base64);
        } catch (e2) {
            return base64;
        }
    }
}

// Функция проверки валидного JSON
function isValidJSON(text) {
    try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}

// Обновление состояния кнопки форматирования JSON
function updateFormatJsonButton() {
    if (isValidJSON(textInput.value.trim())) {
        formatJsonBtn.style.display = 'flex';
    } else {
        formatJsonBtn.style.display = 'none';
    }
}

// Синхронизация полей и сохранение в localStorage
function syncBase64ToText() {
    const decodedText = decodeBase64(base64Input.value);
    textInput.value = decodedText;
    localStorage.setItem('base64Input', base64Input.value);
    localStorage.setItem('textInput', textInput.value);
    updateFormatJsonButton();
}

function syncTextToBase64() {
    const encodedText = encodeBase64(textInput.value);
    base64Input.value = encodedText;
    localStorage.setItem('base64Input', base64Input.value);
    localStorage.setItem('textInput', textInput.value);
    updateFormatJsonButton();
}

base64Input.addEventListener('input', syncBase64ToText);
textInput.addEventListener('input', syncTextToBase64);

// Загрузка данных из localStorage при загрузке страницы
window.addEventListener('load', () => {
    const savedBase64 = localStorage.getItem('base64Input');
    const savedText = localStorage.getItem('textInput');
    if (savedBase64 !== null) {
        base64Input.value = savedBase64;
        syncBase64ToText();
    } else if (savedText !== null) {
        textInput.value = savedText;
        syncTextToBase64();
    }
});

// Копировать/Вставить с изменением иконки
async function handleCopy(button, input) {
    const originalIcon = button.querySelector('i').className;
    try {
        await navigator.clipboard.writeText(input.value);
        button.querySelector('i').className = 'fas fa-check';
        setTimeout(() => {
            button.querySelector('i').className = originalIcon;
        }, 2000);
    } catch (err) {
        // Если копирование не удалось, не меняем иконку
        console.error('Ошибка копирования:', err);
    }
}

async function handlePaste(button, input, isBase64) {
    const originalIcon = button.querySelector('i').className;
    try {
        const text = await navigator.clipboard.readText();
        input.value = text;
        if (isBase64) {
            const decodedText = decodeBase64(text);
            textInput.value = decodedText;
        } else {
            const encodedText = encodeBase64(text);
            base64Input.value = encodedText;
        }
        // Сохранение в localStorage
        localStorage.setItem('base64Input', base64Input.value);
        localStorage.setItem('textInput', textInput.value);
        button.querySelector('i').className = 'fas fa-check';
        updateFormatJsonButton();
        setTimeout(() => {
            button.querySelector('i').className = originalIcon;
        }, 2000);
    } catch (err) {
        // Если вставка не удалась, не меняем иконку
        console.error('Ошибка вставки:', err);
    }
}

// Обработчики событий для копирования и вставки
copyBase64Btn.addEventListener('click', () => handleCopy(copyBase64Btn, base64Input));
pasteBase64Btn.addEventListener('click', () => handlePaste(pasteBase64Btn, base64Input, true));

copyTextBtn.addEventListener('click', () => handleCopy(copyTextBtn, textInput));
pasteTextBtn.addEventListener('click', () => handlePaste(pasteTextBtn, textInput, false));

// Обработчик для кнопки форматирования JSON
formatJsonBtn.addEventListener('click', () => {
    try {
        const jsonObj = JSON.parse(textInput.value);
        const formattedJson = JSON.stringify(jsonObj, null, 4);
        textInput.value = formattedJson;
        // Обновление localStorage
        localStorage.setItem('textInput', textInput.value);
        // Обновление Base64
        syncTextToBase64();
        formatJsonBtn.querySelector('i').className = 'fas fa-check';
        setTimeout(() => {
            formatJsonBtn.querySelector('i').className = 'fas fa-code';
        }, 2000);
    } catch (e) {
        console.error('Ошибка форматирования JSON:', e);
    }
});

// Проверка валидности JSON при загрузке страницы и при изменениях
textInput.addEventListener('input', updateFormatJsonButton);
window.addEventListener('load', updateFormatJsonButton);

// Функция применения темы
function applyTheme(theme) {
    document.body.classList.remove('light', 'dark', 'auto');
    if (theme === 'auto') {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        if (prefersDarkScheme.matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.add('light');
        }

        // Слушатель для изменений предпочтений системы
        prefersDarkScheme.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.remove('light');
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
                document.body.classList.add('light');
            }
        });
    } else {
        document.body.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
    // Обновление текста выбранной темы
    if (theme === 'light') {
        selectedThemeSpan.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
    } else if (theme === 'dark') {
        selectedThemeSpan.innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
    } else {
        selectedThemeSpan.innerHTML = '<i class="fas fa-adjust"></i> Авто';
    }
}

// Добавление обработчиков для переключения темы
themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTheme = option.getAttribute('data-theme');
        applyTheme(selectedTheme);
    });
});

// Проверка сохранённой темы
const savedTheme = localStorage.getItem('theme') || 'auto';
applyTheme(savedTheme);
