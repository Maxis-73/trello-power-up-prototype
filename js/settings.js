var t = TrelloPowerUp.iframe({
    localization: {
        defaultLocale: 'en',
        supportedLocales: ['en', 'es'],
        resourceUrl: '../strings/{locale}.json'
    }
});

// Prioridades por defecto
var DEFAULT_PRIORITIES = [
    { id: '1', nameKey: 'priority-very-high', color: '#EB5A46', badgeColor: 'red' },
    { id: '2', nameKey: 'priority-high', color: '#FFAB4A', badgeColor: 'orange' },
    { id: '3', nameKey: 'priority-medium', color: '#F2D600', badgeColor: 'yellow' },
    { id: '4', nameKey: 'priority-low', color: '#61BD4F', badgeColor: 'green' },
    { id: '5', nameKey: 'priority-very-low', color: '#0079BF', badgeColor: 'blue' }
];

// Colores disponibles para badges de Trello
var BADGE_COLORS = [
    { value: 'red', labelKey: 'color-red', hex: '#EB5A46' },
    { value: 'orange', labelKey: 'color-orange', hex: '#FFAB4A' },
    { value: 'yellow', labelKey: 'color-yellow', hex: '#F2D600' },
    { value: 'green', labelKey: 'color-green', hex: '#61BD4F' },
    { value: 'blue', labelKey: 'color-blue', hex: '#0079BF' },
    { value: 'purple', labelKey: 'color-purple', hex: '#C377E0' },
    { value: 'pink', labelKey: 'color-pink', hex: '#FF80CE' },
    { value: 'sky', labelKey: 'color-sky', hex: '#00C2E0' },
    { value: 'lime', labelKey: 'color-lime', hex: '#51E898' },
    { value: 'light-gray', labelKey: 'color-light-gray', hex: '#C4C9CC' }
];

var currentPriorities = [];
var translations = {};

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Mostrar mensaje
function showMessage(textOrKey, type, isKey) {
    var container = document.getElementById('message-container');

    if (isKey && translations[textOrKey]) {
        container.innerHTML = '<div class="message ' + type + '">' + translations[textOrKey] + '</div>';
    } else {
        container.innerHTML = '<div class="message ' + type + '">' + textOrKey + '</div>';
    }

    setTimeout(function () {
        container.innerHTML = '';
    }, 3000);
}

// Renderizar lista de prioridades
function renderPriorities() {
    var container = document.getElementById('priorities-list');

    if (currentPriorities.length === 0) {
        container.innerHTML = '<div class="empty-state">' + translations['empty-state'] + '</div>';
        return;
    }

    container.innerHTML = '';

    // Recopilar claves de traducción para nombres por defecto
    var keysToTranslate = [];
    currentPriorities.forEach(function (priority) {
        if (priority.nameKey) {
            keysToTranslate.push(priority.nameKey);
        }
    });

    var translatePromise = keysToTranslate.length > 0
        ? t.localizeKeys(keysToTranslate)
        : Promise.resolve({});

    translatePromise.then(function (nameTranslations) {
        currentPriorities.forEach(function (priority, index) {
            var item = document.createElement('div');
            item.className = 'priority-item';
            item.dataset.id = priority.id;

            // Número de orden
            var orderNum = document.createElement('span');
            orderNum.className = 'order-number';
            orderNum.textContent = index + 1;

            // Input para el nombre
            var nameInput = document.createElement('input');
            nameInput.type = 'text';
            // Mostrar nombre traducido si es prioridad por defecto
            var displayName = priority.nameKey ? nameTranslations[priority.nameKey] : priority.name;
            nameInput.value = displayName || '';
            nameInput.placeholder = translations['placeholder-name'];
            nameInput.dataset.field = 'name';

            // Input para el color del botón
            var colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = priority.color;
            colorInput.title = 'Color';
            colorInput.dataset.field = 'color';

            // Select para el color del badge
            var badgeSelect = document.createElement('select');
            badgeSelect.className = 'badge-color-select';
            badgeSelect.title = 'Badge color';
            badgeSelect.dataset.field = 'badgeColor';

            BADGE_COLORS.forEach(function (bc) {
                var option = document.createElement('option');
                option.value = bc.value;
                option.textContent = translations[bc.labelKey] || bc.value;
                if (priority.badgeColor === bc.value) {
                    option.selected = true;
                }
                badgeSelect.appendChild(option);
            });

            // Botón eliminar
            var removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Delete';
            removeBtn.onclick = function () {
                removePriority(priority.id);
            };

            // Eventos de cambio
            nameInput.addEventListener('input', function (e) {
                updatePriority(priority.id, 'name', e.target.value);
                // Si se edita el nombre, eliminar nameKey para que sea personalizado
                updatePriority(priority.id, 'nameKey', null);
            });

            colorInput.addEventListener('input', function (e) {
                updatePriority(priority.id, 'color', e.target.value);
            });

            badgeSelect.addEventListener('change', function (e) {
                updatePriority(priority.id, 'badgeColor', e.target.value);
            });

            item.appendChild(orderNum);
            item.appendChild(nameInput);
            item.appendChild(colorInput);
            item.appendChild(badgeSelect);
            item.appendChild(removeBtn);

            container.appendChild(item);
        });
    });
}

// Actualizar una prioridad
function updatePriority(id, field, value) {
    currentPriorities = currentPriorities.map(function (p) {
        if (p.id === id) {
            p[field] = value;
        }
        return p;
    });
}

// Eliminar una prioridad
function removePriority(id) {
    currentPriorities = currentPriorities.filter(function (p) {
        return p.id !== id;
    });
    renderPriorities();
}

// Agregar nueva prioridad
function addPriority() {
    var newPriority = {
        id: generateId(),
        name: translations['new-priority'],
        color: '#6366f1',
        badgeColor: 'purple'
    };
    currentPriorities.push(newPriority);
    renderPriorities();

    // Hacer scroll al nuevo elemento
    var container = document.getElementById('priorities-list');
    container.scrollTop = container.scrollHeight;
}

// Guardar prioridades
function savePriorities() {
    // Validar que todas tengan nombre
    var hasEmpty = currentPriorities.some(function (p) {
        return !p.name || p.name.trim() === '';
    });

    if (hasEmpty) {
        showMessage('msg-error-empty', 'error', true);
        return;
    }

    t.set('board', 'shared', 'customPriorities', currentPriorities)
        .then(function () {
            showMessage('msg-saved', 'success', true);
        })
        .catch(function (err) {
            showMessage(translations['msg-error-save'] + err.message, 'error', false);
        });
}

// Restaurar valores por defecto
function resetToDefaults() {
    if (confirm(translations['confirm-reset'])) {
        // Cargar las prioridades por defecto con sus claves de traducción
        t.localizeKeys(['priority-very-high', 'priority-high', 'priority-medium', 'priority-low', 'priority-very-low'])
            .then(function (names) {
                currentPriorities = [
                    { id: '1', name: names['priority-very-high'], color: '#EB5A46', badgeColor: 'red' },
                    { id: '2', name: names['priority-high'], color: '#FFAB4A', badgeColor: 'orange' },
                    { id: '3', name: names['priority-medium'], color: '#F2D600', badgeColor: 'yellow' },
                    { id: '4', name: names['priority-low'], color: '#61BD4F', badgeColor: 'green' },
                    { id: '5', name: names['priority-very-low'], color: '#0079BF', badgeColor: 'blue' }
                ];
                renderPriorities();
                showMessage('msg-restored', 'success', true);
            });
    }
}

// Cargar prioridades al iniciar
function loadPriorities() {
    // Primero cargar todas las traducciones necesarias
    t.localizeKeys([
        'empty-state', 'placeholder-name', 'new-priority',
        'msg-saved', 'msg-error-empty', 'msg-error-save', 'msg-restored', 'confirm-reset',
        'color-red', 'color-orange', 'color-yellow', 'color-green', 'color-blue',
        'color-purple', 'color-pink', 'color-sky', 'color-lime', 'color-light-gray',
        'settings-title', 'settings-subtitle', 'btn-add', 'btn-save', 'btn-reset'
    ]).then(function (keys) {
        translations = keys;

        // Actualizar textos de la UI
        document.querySelector('h1').textContent = '⚙️ ' + translations['settings-title'];
        document.querySelector('.subtitle').textContent = translations['settings-subtitle'];
        document.getElementById('btn-add').textContent = translations['btn-add'];
        document.getElementById('btn-save').textContent = translations['btn-save'];
        document.getElementById('btn-reset').textContent = translations['btn-reset'];

        // Luego cargar las prioridades
        return t.get('board', 'shared', 'customPriorities');
    }).then(function (savedPriorities) {
        if (savedPriorities && savedPriorities.length > 0) {
            currentPriorities = savedPriorities;
        } else {
            // Cargar prioridades por defecto con nombres traducidos
            return t.localizeKeys(['priority-very-high', 'priority-high', 'priority-medium', 'priority-low', 'priority-very-low'])
                .then(function (names) {
                    currentPriorities = [
                        { id: '1', name: names['priority-very-high'], color: '#EB5A46', badgeColor: 'red' },
                        { id: '2', name: names['priority-high'], color: '#FFAB4A', badgeColor: 'orange' },
                        { id: '3', name: names['priority-medium'], color: '#F2D600', badgeColor: 'yellow' },
                        { id: '4', name: names['priority-low'], color: '#61BD4F', badgeColor: 'green' },
                        { id: '5', name: names['priority-very-low'], color: '#0079BF', badgeColor: 'blue' }
                    ];
                });
        }
    }).then(function () {
        renderPriorities();
    }).catch(function () {
        currentPriorities = JSON.parse(JSON.stringify(DEFAULT_PRIORITIES));
        renderPriorities();
    });
}

// Event listeners
document.getElementById('btn-add').addEventListener('click', addPriority);
document.getElementById('btn-save').addEventListener('click', savePriorities);
document.getElementById('btn-reset').addEventListener('click', resetToDefaults);

// Inicializar
loadPriorities();
