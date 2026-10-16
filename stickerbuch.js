document.addEventListener("DOMContentLoaded", () => { // Führt den Code erst aus, wenn die Seite vollständig geladen ist

    // 🌄 Funktion zum Wechseln des Fernseh-Hintergrunds
    function changeTV(src) {
        document.getElementById('tv-image').style.backgroundImage = `url(${src})`; // Ändert das Hintergrundbild des Moodboards
        document.getElementById('tv-image').style.backgroundSize = 'cover';      // Bild füllt die ganze Fläche
        document.getElementById('tv-image').style.backgroundPosition = 'center'; // Bild wird mittig ausgerichtet
    }
    window.changeTV = changeTV; // Macht die Funktion global verfügbar, z. B. durch Button-Klicks

    let deleteMode = false; // Merker, ob der Löschmodus aktiv ist
    const deleteToggleBtn = document.getElementById('deleteModeToggle'); // Button, um Löschmodus zu aktivieren/deaktivieren
    const stickerOptions = document.querySelectorAll('.sticker-option'); // Alle Sticker, die man ziehen kann
    const moodboard = document.getElementById('tv-image'); // Bereich, auf den man Sticker ziehen kann

    // Damit Sticker relativ zum Moodboard positioniert werden
    if (getComputedStyle(moodboard).position === 'static') {
        moodboard.style.position = 'relative';
    }

    deleteToggleBtn.addEventListener('click', () => {
        deleteMode = !deleteMode; // Umschalten zwischen Löschen an/aus
        deleteToggleBtn.classList.toggle('active'); // Visuelle Anzeige für aktiven Modus
        deleteToggleBtn.textContent = deleteMode ? 'Löschen beenden' : 'Sticker löschen'; // Text anpassen
    });

    // 🎨 Dragstart-Event für Sticker vorbereiten
    stickerOptions.forEach(sticker => {
        sticker.addEventListener('dragstart', e => {
            e.dataTransfer.setData('sticker-src', sticker.src); // Beim Ziehen wird die Bild-URL gespeichert
        });
    });

    moodboard.addEventListener('dragover', e => e.preventDefault()); // Erlaubt das Ablegen auf dem Moodboard

    moodboard.addEventListener('drop', e => {
        e.preventDefault(); // Standardverhalten (z. B. Bild öffnen) verhindern
        const src = e.dataTransfer.getData('sticker-src'); // Bildquelle holen
        if (src) {
            // Position relativ zum Moodboard berechnen (klappt auch, wenn man auf einen anderen Sticker fallen lässt)
            const rect = moodboard.getBoundingClientRect();
            const x = e.clientX - rect.left - 50; // -50, damit der Sticker mittig unter der Maus landet
            const y = e.clientY - rect.top - 50;

            const wrapper = document.createElement('div'); // Container für den Sticker
            wrapper.className = 'sticker-wrapper'; // Klasse für CSS
            wrapper.style.position = 'absolute'; // Frei positionierbar
            wrapper.style.left = x + 'px'; // Position auf dem Moodboard
            wrapper.style.top = y + 'px';
            wrapper.style.width = '100px'; // Standardgröße
            wrapper.style.height = '100px';

            const image = document.createElement('img'); // Das eigentliche Bild
            image.src = src;
            image.className = 'sticker-image';
            image.draggable = false; // Verhindert, dass der Browser das Bild selbst "zieht"
            image.style.width = '100%';
            image.style.height = '100%';
            image.style.objectFit = 'contain';
            image.style.pointerEvents = 'none'; // Klicks gehen an den Wrapper

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
    function makeDraggable(wrapper) {
        let startX, startY, startLeft, startTop;

        wrapper.addEventListener('pointerdown', e => {
            if (e.target.classList.contains('resize-handle')) return; // Griff = skalieren, nicht verschieben

            // 🗑️ Im Löschmodus: Sticker beim Klick entfernen
            if (deleteMode) {
                wrapper.remove();
                return;
            }

            e.preventDefault();
            startX = e.clientX; // Startposition der Maus merken
            startY = e.clientY;
            startLeft = wrapper.offsetLeft; // Startposition des Stickers merken
            startTop = wrapper.offsetTop;
            wrapper.setPointerCapture(e.pointerId); // Maus "festhalten", auch wenn sie den Sticker verlässt
            wrapper.style.zIndex = 10; // Gezogener Sticker liegt oben

            function onMove(ev) {
                wrapper.style.left = startLeft + (ev.clientX - startX) + 'px'; // Neue Position berechnen
                wrapper.style.top = startTop + (ev.clientY - startY) + 'px';
            }

            function onUp(ev) {
                wrapper.releasePointerCapture(ev.pointerId);
                wrapper.removeEventListener('pointermove', onMove);
                wrapper.removeEventListener('pointerup', onUp);
                wrapper.style.zIndex = '';
            }

            wrapper.addEventListener('pointermove', onMove);
            wrapper.addEventListener('pointerup', onUp);
        });
    }

    // ↘️ Funktion, um Sticker größer/kleiner zu machen
    function makeResizable(wrapper) {
        const handle = wrapper.querySelector('.resize-handle');

        handle.addEventListener('pointerdown', e => {
            if (deleteMode) return; // Im Löschmodus nicht skalieren
            e.preventDefault();
            e.stopPropagation(); // Verhindert, dass gleichzeitig verschoben wird

            const startX = e.clientX;
            const startWidth = wrapper.offsetWidth;
            handle.setPointerCapture(e.pointerId);

            function onMove(ev) {
                const newSize = Math.max(30, startWidth + (ev.clientX - startX)); // Mindestgröße 30px
                wrapper.style.width = newSize + 'px';  // Breite und Höhe gleich,
                wrapper.style.height = newSize + 'px'; // damit der Sticker nicht verzerrt
            }

            function onUp(ev) {
                handle.releasePointerCapture(ev.pointerId);
                handle.removeEventListener('pointermove', onMove);
                handle.removeEventListener('pointerup', onUp);
            }

            handle.addEventListener('pointermove', onMove);
            handle.addEventListener('pointerup', onUp);
        });
    }

    // 🔙 Zurück-Button (zurück zum Schreibtisch)
    const backBtn = document.getElementById('btnBackToDesk');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Wenn eingebettet in iFrame mit Tab-Navigation
            if (window.parent && window.parent !== window && typeof window.parent.showTab === 'function') {
                window.parent.showTab('start'); // Navigiert zu Tab "start"
            } else {
                window.location.href = 'schreibtisch.html'; // Sonst: Weiterleitung
            }
        });
    }
});
