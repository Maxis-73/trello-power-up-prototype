var t = TrelloPowerUp.iframe();

document.addEventListener('click', function (e) {
    if (e.target.tagName === 'BUTTON') {
        var priorityClass = e.target.className;
        var priorityText = e.target.innerText;

        if (priorityClass === 'remove-priority') {
            return t.set('card', 'shared', 'prioridad', null)
                .then(function () {
                    t.closePopup();
                })
        }

        return t.set('card', 'shared', 'prioridad', {
            text: priorityText,
            class: priorityClass
        })
            .then(function () {
                t.closePopup();
            })

    }
})