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

// Función para oscurecer un color (para hover)
function darkenColor(hex, percent) {
    var num = parseInt(hex.replace('#', ''), 16);
    var amt = Math.round(2.55 * percent);
    var R = (num >> 16) - amt;
    var G = (num >> 8 & 0x00FF) - amt;
    var B = (num & 0x0000FF) - amt;
    R = R < 0 ? 0 : R;
    G = G < 0 ? 0 : G;
    B = B < 0 ? 0 : B;
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Cargar y renderizar las prioridades
function loadPriorities() {
    t.get('board', 'shared', 'customPriorities')
        .then(function (priorities) {
            var prioritiesToUse = (priorities && priorities.length > 0) ? priorities : DEFAULT_PRIORITIES;
            renderPriorities(prioritiesToUse);
        })
        .catch(function () {
            renderPriorities(DEFAULT_PRIORITIES);
        });
}

// Renderizar los botones de prioridad
function renderPriorities(priorities) {
    var container = document.getElementById('button-list');
    container.innerHTML = '';

    // Crear estilos dinámicos
    var styleElement = document.getElementById('dynamic-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-styles';
        document.head.appendChild(styleElement);
    }

    var styles = '';

    priorities.forEach(function (priority, index) {
        var button = document.createElement('button');
        button.className = 'priority-btn priority-' + priority.id;
        button.dataset.priorityId = priority.id;
        button.textContent = (index + 1) + '. ' + getPriorityDisplayName(priority);

        // Agregar estilos dinámicos para este botón
        styles += '.priority-' + priority.id + ' { background-color: ' + priority.color + '; }\n';
        styles += '.priority-' + priority.id + ':hover { background-color: ' + darkenColor(priority.color, 10) + '; }\n';

        container.appendChild(button);
    });

    // Botón para remover prioridad
    var removeBtn = document.createElement('button');
    removeBtn.className = 'priority-btn remove-priority';
    removeBtn.dataset.action = 'remove';
    removeBtn.textContent = t.localizeKey('remove-priority');
    container.appendChild(removeBtn);

    // Aplicar estilos dinámicos
    styleElement.textContent = styles;
}

// Manejar clics en los botones
document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON') {
        var button = e.target;

        // Si es el botón de remover
        if (button.dataset.action === 'remove') {
            return t.set('card', 'shared', 'prioridad', null)
                .then(function () {
                    t.closePopup();
                });
        }

        // Si es un botón de prioridad
        var priorityId = button.dataset.priorityId;
        if (priorityId) {
            return t.set('card', 'shared', 'prioridad', {
                priorityId: priorityId
            })
                .then(function () {
                    t.closePopup();
                });
        }
    }
});

// Inicializar
t.render(function () {
    t.localizeNode(document);
    loadPriorities();
});
