// 🎵 Musikplayer
const moodSelector = document.getElementById('moodSelector'); // Holt das Dropdown-Menü zur Musikauswahl
const audioPlayer = document.getElementById('audioPlayer');   // Holt das <audio>-Element für den Musikplayer
const volumeSlider = document.getElementById('volume');       // Holt den Lautstärkeregler (Range Input)
const playBtn = document.getElementById('playBtn');           // Holt den Button zum Abspielen der Musik
const pauseBtn = document.getElementById('pauseBtn');         // Holt den Button zum Pausieren der Musik

// Wenn eine neue Stimmung ausgewählt wird, wird die passende Musikdatei geladen und abgespielt
moodSelector.addEventListener('change', function () {
    if (this.value) {                                         // Prüft, ob ein gültiger Musiklink ausgewählt ist
        audioPlayer.src = this.value;                         // Setzt die neue Musikquelle (Dateipfad oder URL)
        audioPlayer.play();                                   // Startet die Wiedergabe der neuen Musik
    }
});

// Wenn der Lautstärkeregler bewegt wird, passt sich die Lautstärke des Players an
volumeSlider.addEventListener('input', function () {
    audioPlayer.volume = this.value;                          // Setzt die Lautstärke (zwischen 0 und 1)
});

// Klick auf Play startet die Wiedergabe
playBtn.addEventListener('click', () => audioPlayer.play());  // Startet die Musik

// Klick auf Pause hält die Wiedergabe an
pauseBtn.addEventListener('click', () => audioPlayer.pause()); // Pausiert die Musik

// 🧭 Tabs umschalten – Funktion, um zwischen verschiedenen Inhaltsbereichen zu wechseln
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => { // Sucht alle Elemente mit der Klasse "tab-content"
        tab.classList.remove('active');                         // Versteckt alle Tabs durch Entfernen der "active"-Klasse
    });
    document.getElementById(tabId).classList.add('active');     // Zeigt nur den gewünschten Tab durch Hinzufügen der Klasse
}

// 🔓 Macht die Funktion für andere Dateien oder Skripte global verfügbar (z. B. todo.html)
window.showTab = showTab;

// Führt den Code erst aus, wenn die komplette Seite geladen ist
document.addEventListener("DOMContentLoaded", () => {
    const btnBackHome = document.getElementById("btnBackHome"); // Holt den "Zurück"-Button

    btnBackHome.addEventListener("click", () => {               // Wenn auf den Button geklickt wird:
        localStorage.removeItem("isLoggedIn");                  // Entfernt den Login-Status aus dem lokalen Speicher
        window.location.href = "moodyy.html";                   // Leitet zurück zur Startseite (moodyy.html)
    });
});