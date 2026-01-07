var t = TrelloPowerUp.iframe({
    localization: {
        defaultLocale: 'en',
        supportedLocales: ['en', 'es'],
        resourceUrl: '../strings/{locale}.json'
    }
});

// Prioridades por defecto (usan nameKey para localización)
var DEFAULT_PRIORITIES = [
    { id: '1', nameKey: 'priority-very-high', color: '#EB5A46', badgeColor: 'red' },
    { id: '2', nameKey: 'priority-high', color: '#FFAB4A', badgeColor: 'orange' },
    { id: '3', nameKey: 'priority-medium', color: '#F2D600', badgeColor: 'yellow' },
    { id: '4', nameKey: 'priority-low', color: '#61BD4F', badgeColor: 'green' },
    { id: '5', nameKey: 'priority-very-low', color: '#0079BF', badgeColor: 'blue' }
];

// Función para obtener el nombre mostrable de una prioridad
function getPriorityDisplayName(priority) {
    if (priority.nameKey) {
        return t.localizeKey(priority.nameKey);
    }
    return priority.name || '';
}

// Colores disponibles para badges de Trello (usan labelKey para localización)
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

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Mostrar mensaje
function showMessage(text, type) {
    var container = document.getElementById('message-container');
    container.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
    setTimeout(function () {
        container.innerHTML = '';
    }, 3000);
}

// Renderizar lista de prioridades
function renderPriorities() {
    var container = document.getElementById('priorities-list');

    if (currentPriorities.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay prioridades definidas. Agrega una nueva prioridad.</div>';
        return;
    }

    container.innerHTML = '';

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
        nameInput.value = getPriorityDisplayName(priority);
        nameInput.placeholder = t.localizeKey('placeholder-name');
        nameInput.dataset.field = 'name';

        // Input para el color del botón
        var colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = priority.color;
        colorInput.title = 'Color del botón';
        colorInput.dataset.field = 'color';

        // Select para el color del badge
        var badgeSelect = document.createElement('select');
        badgeSelect.className = 'badge-color-select';
        badgeSelect.title = 'Color del badge en Trello';
        badgeSelect.dataset.field = 'badgeColor';

        BADGE_COLORS.forEach(function (bc) {
            var option = document.createElement('option');
            option.value = bc.value;
            option.textContent = t.localizeKey(bc.labelKey);
            if (priority.badgeColor === bc.value) {
                option.selected = true;
            }
            badgeSelect.appendChild(option);
        });

        // Botón eliminar
        var removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Eliminar prioridad';
        removeBtn.onclick = function () {
            removePriority(priority.id);
        };

        // Eventos de cambio
        // Cuando el usuario edita el nombre, se convierte en prioridad personalizada (pierde nameKey)
        nameInput.addEventListener('input', function (e) {
            updatePriorityName(priority.id, e.target.value);
        });

        colorInput.addEventListener('input', function (e) {
            updatePriority(priority.id, 'color', e.target.value);
        });

        badgeSelect.addEventListener('change', function (e) {
            var selectedColor = BADGE_COLORS.find(function (bc) {
                return bc.value === e.target.value;
            });
            updatePriority(priority.id, 'badgeColor', e.target.value);
            // Sincronizar el color del botón con el color del badge
            if (selectedColor) {
                updatePriority(priority.id, 'color', selectedColor.hex);
                colorInput.value = selectedColor.hex;
            }
        });

        item.appendChild(orderNum);
        item.appendChild(nameInput);
        item.appendChild(colorInput);
        item.appendChild(badgeSelect);
        item.appendChild(removeBtn);

        container.appendChild(item);
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

// Actualizar el nombre de una prioridad (convierte a personalizada si tenía nameKey)
function updatePriorityName(id, value) {
    currentPriorities = currentPriorities.map(function (p) {
        if (p.id === id) {
            // Eliminar nameKey y usar name (se convierte en personalizada)
            delete p.nameKey;
            p.name = value;
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
    // Usar el color hex del badge purple para que coincidan
    var defaultBadgeColor = BADGE_COLORS.find(function (bc) {
        return bc.value === 'purple';
    });
    var newPriority = {
        id: generateId(),
        name: t.localizeKey('new-priority'),
        color: defaultBadgeColor ? defaultBadgeColor.hex : '#C377E0',
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
    // Validar que todas tengan nombre (name o nameKey)
    var hasEmpty = currentPriorities.some(function (p) {
        var hasName = p.name && p.name.trim() !== '';
        var hasNameKey = p.nameKey && p.nameKey.trim() !== '';
        return !hasName && !hasNameKey;
    });

    if (hasEmpty) {
        showMessage(t.localizeKey('msg-error-empty'), 'error');
        return;
    }

    t.set('board', 'shared', 'customPriorities', currentPriorities)
        .then(function () {
            showMessage(t.localizeKey('msg-saved'), 'success');
        })
        .catch(function (err) {
            showMessage('Error: ' + err.message, 'error');
        });
}

// Restaurar valores por defecto
function resetToDefaults() {
    if (confirm(t.localizeKey('confirm-reset'))) {
        currentPriorities = JSON.parse(JSON.stringify(DEFAULT_PRIORITIES));
        renderPriorities();
        // Guardar automáticamente después de restaurar
        t.set('board', 'shared', 'customPriorities', currentPriorities)
            .then(function () {
                showMessage(t.localizeKey('msg-restored'), 'success');
            })
            .catch(function (err) {
                showMessage('Error: ' + err.message, 'error');
            });
    }
}

// Cargar prioridades al iniciar
function loadPriorities() {
    t.get('board', 'shared', 'customPriorities')
        .then(function (savedPriorities) {
            if (savedPriorities && savedPriorities.length > 0) {
                currentPriorities = savedPriorities;
            } else {
                currentPriorities = JSON.parse(JSON.stringify(DEFAULT_PRIORITIES));
            }
            renderPriorities();
        })
        .catch(function () {
            currentPriorities = JSON.parse(JSON.stringify(DEFAULT_PRIORITIES));
            renderPriorities();
        });
}

// Event listeners
document.getElementById('btn-add').addEventListener('click', addPriority);
document.getElementById('btn-save').addEventListener('click', savePriorities);
document.getElementById('btn-reset').addEventListener('click', resetToDefaults);

// Inicializar
t.render(function () {
    t.localizeNode(document);
    loadPriorities();
});

