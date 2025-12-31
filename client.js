var CLASE_A_COLOR = {
    'very-high-priority': 'red',
    'high-priority': 'orange',
    'medium-priority': 'yellow',
    'low-priority': 'green',
    'very-low-priority': 'blue'
};

TrelloPowerUp.initialize({
    'card-buttons': function (t, options) {
        return [{
            icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
            text: 'Prioridad',
            callback: function (t) {
                return t.popup({
                    title: 'Seleccionar Prioridad',
                    url: 'selector-prioridad.html',
                    height: 300
                })
            }
        }];
    },
    'card-badges': function (t, options) {
        return t.get('card', 'shared', 'prioridad')
            .then(function (prioridad) {
                if (!prioridad) return [];

                return [{
                    text: prioridad.text,
                    color: CLASE_A_COLOR[prioridad.class] || null
                }]
            })
    }
});