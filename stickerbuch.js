document.addEventListener("DOMContentLoaded", () => { // Führt den Code erst aus, wenn die Seite vollständig geladen ist

    // 🌄 Funktion zum Wechseln des Fernseh-Hintergrunds
    function changeTV(src) {
        document.getElementById('tv-image').style.backgroundImage = `url(${src})`; // Ändert das Hintergrundbild des Moodboards
    }
    window.changeTV = changeTV; // Macht die Funktion global verfügbar, z. B. durch Button-Klicks

    let deleteMode = false; // Merker, ob der Löschmodus aktiv ist
    const deleteToggleBtn = document.getElementById('deleteModeToggle'); // Button, um Löschmodus zu aktivieren/deaktivieren
    const stickerOptions = document.querySelectorAll('.sticker-option'); // Alle Sticker, die man ziehen kann
    const moodboard = document.getElementById('tv-image'); // Bereich, auf den man Sticker ziehen kann

    deleteToggleBtn.addEventListener('click', () => {
        deleteMode = !deleteMode; // Umschalten zwischen Löschen an/aus
        deleteToggleBtn.classList.toggle('active'); // Visuelle Anzeige für aktiven Modus
    });

    // 🎨 Dragstart-Event für Sticker vorbereiten
    stickerOptions.forEach(sticker => {
        sticker.addEventListener('dragstart', e => {
            e.dataTransfer.setData('sticker-src', sticker.src); // Beim Ziehen wird die Bild-URL gespeichert
        });
    });

    moodboard.addEventListener('dragover', e => e.preventDefault()); // Erlaubt das Ablegen auf dem Moodboard

    moodboard.addEventListener('drop', e => {
        e.preventDefault(); // Standardverhalten (z. B. Bild öffnen) verhindern
        const src = e.dataTransfer.getData('sticker-src'); // Bildquelle holen
        if (src) {
            const wrapper = document.createElement('div'); // Container für den Sticker
            wrapper.className = 'sticker-wrapper'; // Klasse für CSS
            wrapper.style.left = e.offsetX + 'px'; // Position auf dem Moodboard
            wrapper.style.top = e.offsetY + 'px';
            wrapper.style.width = '100px'; // Standardgröße
            wrapper.style.height = '100px';

            const image = document.createElement('img'); // Das eigentliche Bild
            image.src = src;
            image.className = 'sticker-image';

            const handle = document.createElement('div'); // Eckpunkt zum Skalieren
            handle.className = 'resize-handle';

            wrapper.appendChild(image); // Bild hinzufügen
            wrapper.appendChild(handle); // Resize-Griff hinzufügen
            moodboard.appendChild(wrapper); // Alles aufs Moodboard legen

            makeDraggable(wrapper); // Beweglich machen
            makeResizable(wrapper); // Skalierbar machen
        }
    });

// 🔄 Funktion, um Sticker beweglich zu machen