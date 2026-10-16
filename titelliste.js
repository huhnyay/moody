document.addEventListener("DOMContentLoaded", () => {
    const backToDeskBtn = document.getElementById('btnBackToDesk');

    // Wenn der Button gedrückt wird, den Schreibtisch-Tab anzeigen
    if (backToDeskBtn) {
        backToDeskBtn.addEventListener('click', () => {
            showTab('start'); // Der Schreibtisch-Tab hat die ID 'start'
        });
    }
});
