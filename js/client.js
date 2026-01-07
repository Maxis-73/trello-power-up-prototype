// Íconos SVG en data URI (no dependen de servicios externos)
// Ícono de bandera para prioridad
var ICON_FLAG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2"%3E%3Cpath d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"%3E%3C/path%3E%3Cline x1="4" y1="22" x2="4" y2="15"%3E%3C/line%3E%3C/svg%3E';

// Ícono de engranaje para configuración
var ICON_SETTINGS = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="3"%3E%3C/circle%3E%3Cpath d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"%3E%3C/path%3E%3C/svg%3E';

// Prioridades por defecto (se usan si el usuario no ha configurado las suyas)
// Usan nameKey para traducción automática según el idioma del usuario
var DEFAULT_PRIORITIES = [
    { id: '1', nameKey: 'priority-very-high', color: '#EB5A46', badgeColor: 'red' },
    { id: '2', nameKey: 'priority-high', color: '#FFAB4A', badgeColor: 'orange' },
    { id: '3', nameKey: 'priority-medium', color: '#F2D600', badgeColor: 'yellow' },
    { id: '4', nameKey: 'priority-low', color: '#61BD4F', badgeColor: 'green' },
    { id: '5', nameKey: 'priority-very-low', color: '#0079BF', badgeColor: 'blue' }
];

// Función auxiliar para obtener las prioridades configuradas
function getPriorities(t) {
    return t.get('board', 'shared', 'customPriorities')
        .then(function (priorities) {
            return (priorities && priorities.length > 0) ? priorities : DEFAULT_PRIORITIES;
        })
        .catch(function () {
            return DEFAULT_PRIORITIES;
        });
}

// Función para obtener el color del badge según el ID de la prioridad
function getBadgeColorById(priorities, priorityId) {
    var found = priorities.find(function (p) {
        return p.id === priorityId;
    });
    return found ? found.badgeColor : null;
}

// Función para obtener el nombre de la prioridad por ID
// Si tiene nameKey, devuelve la clave para traducir; si tiene name, devuelve el nombre directo
function getPriorityNameById(t, priorities, priorityId) {
    var found = priorities.find(function (p) {
        return p.id === priorityId;
    });
    if (!found) return null;
    // Si tiene nameKey (prioridad por defecto), traducir; si tiene name (personalizada), usar directo
    return found.nameKey ? t.localizeKey(found.nameKey) : found.name;
}

window.TrelloPowerUp.initialize({
    'board-buttons': function (t, options) {
        return [{
            icon: ICON_SETTINGS,
            text: t.localizeKey('board-button-settings'),
            callback: function (t) {
                return t.modal({
                    title: t.localizeKey('modal-title'),
                    url: 'views/settings.html',
                    height: 500
                });
            }
        }];
    },
    'card-buttons': function (t, options) {
        return [{
            icon: ICON_FLAG,
            text: t.localizeKey('badge-title'),
            callback: function (t) {
                return t.popup({
                    title: t.localizeKey('popup-title'),
                    url: 'views/selector-prioridad.html',
                    height: 300
                });
            }
        }];
    },
    'card-badges': function (t, options) {
        return Promise.all([
            t.get('card', 'shared', 'prioridad'),
            getPriorities(t)
        ]).then(function (results) {
            var prioridad = results[0];
            var priorities = results[1];

            if (!prioridad) return [];

            // Soporte para formato antiguo (text/class) y nuevo (priorityId)
            var badgeText, badgeColor;

            if (prioridad.priorityId) {
                // Formato nuevo
                badgeText = getPriorityNameById(t, priorities, prioridad.priorityId);
                badgeColor = getBadgeColorById(priorities, prioridad.priorityId);
            } else if (prioridad.text) {
                // Formato antiguo - compatibilidad hacia atrás
                badgeText = prioridad.text.split('. ')[1] || prioridad.text;
                // Mapeo de clases antiguas a colores
                var oldClassMap = {
                    'very-high-priority': 'red',
                    'high-priority': 'orange',
                    'medium-priority': 'yellow',
                    'low-priority': 'green',
                    'very-low-priority': 'blue'
                };
                badgeColor = oldClassMap[prioridad.class] || null;
            }

            if (!badgeText) return [];

            return [{
                text: badgeText,
                color: badgeColor
            }];
        });
    },
    'card-detail-badges': function (t, options) {
        return Promise.all([
            t.get('card', 'shared', 'prioridad'),
            getPriorities(t)
        ]).then(function (results) {
            var prioridad = results[0];
            var priorities = results[1];

            if (!prioridad) {
                return [{
                    title: t.localizeKey('badge-title'),
                    text: t.localizeKey('no-priority'),
                    color: null
                }];
            }

            // Soporte para formato antiguo y nuevo
            var badgeText, badgeColor;

            if (prioridad.priorityId) {
                // Formato nuevo
                badgeText = getPriorityNameById(t, priorities, prioridad.priorityId);
                badgeColor = getBadgeColorById(priorities, prioridad.priorityId);
            } else if (prioridad.text) {
                // Formato antiguo - compatibilidad hacia atrás
                badgeText = prioridad.text.split('. ')[1] || prioridad.text;
                var oldClassMap = {
                    'very-high-priority': 'red',
                    'high-priority': 'orange',
                    'medium-priority': 'yellow',
                    'low-priority': 'green',
                    'very-low-priority': 'blue'
                };
                badgeColor = oldClassMap[prioridad.class] || null;
            }

            if (!badgeText) {
                return [{
                    title: t.localizeKey('badge-title'),
                    text: t.localizeKey('no-priority'),
                    color: null
                }];
            }

            return [{
                title: t.localizeKey('badge-title'),
                text: badgeText,
                color: badgeColor
            }];
        });
    }
}, {
    localization: {
        defaultLocale: 'en',
        supportedLocales: ['en', 'es'],
        resourceUrl: './strings/{locale}.json'
    }
});
