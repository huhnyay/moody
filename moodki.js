// 🔒 Kein API-Key mehr im Frontend!
// Die Anfrage geht an deinen eigenen Cloudflare Worker (Proxy).
// Nur der Worker kennt den OpenRouter-Key – sicher als "Secret" gespeichert.
// 👉 Hier die URL deines Workers eintragen (siehe Anleitung):
const PROXY_URL = "https://moodki-proxy.lou-obrl.workers.dev";

// Holt das Element, das den Chatverlauf anzeigt
const chatWindow = document.getElementById("chatWindow");

// Holt das Element, in dem die Stimmungsauswahl-Buttons angezeigt werden
const chatOptions = document.getElementById("chatOptions");

// Holt das Texteingabefeld, in das der Nutzer seine Nachricht eingibt
const inputBox = document.getElementById("text-input");

// Holt das Dropdown-Menü zur Auswahl des Kommunikationsstils (Persönlichkeit des Bots)
const personalitySelect = document.getElementById("personalitySelect");

// Speichert die aktuell ausgewählte Stimmung (gut, neutral, schlecht)
let currentMood = null;

// Setzt die Standardpersönlichkeit auf "cozy" (sanft & einfühlsam)
let currentPersonality = "cozy";

// Wenn das Persönlichkeits-Dropdown existiert, füge einen Event Listener hinzu
if (personalitySelect) {
    // Wenn der Nutzer die Auswahl ändert …
    personalitySelect.addEventListener("change", () => {
        // Speichere den neuen Wert in currentPersonality
        currentPersonality = personalitySelect.value;

        // Hole den sichtbaren Text der aktuell ausgewählten Option
        const label = personalitySelect.options[personalitySelect.selectedIndex].text;

        // Zeige dem Nutzer an, dass sich die Persönlichkeit geändert hat
        addBotMessage(`✅ Persönlichkeit geändert: ${label}`);
    });
}

// Gibt den passenden Systemprompt zurück, je nach gewähltem Kommunikationsstil
function getSystemPrompt() {
    switch (currentPersonality) {
        case "funny":
            // Wenn "Locker & witzig" gewählt wurde
            return "Du bist ein lustiger Kumpel mit lockeren Sprüchen und Humor, der jede Stimmung auflockert.";
        case "neutral":
            // Wenn "Sachlich & direkt" gewählt wurde
            return "Du bist sachlich, ruhig und gibst pragmatische, direkte Antworten, ohne viel Emotion.";
        case "cozy":
        default:
            // Standard: "Sanft & einfühlsam"
            return "Du bist ein einfühlsamer, liebevoller Freund, der auf die Gefühle des Benutzers eingeht.";
    }
}

// Fügt eine neue Nachricht vom Nutzer in den Chatverlauf ein
function addUserMessage(text) {
    const msg = document.createElement("p"); // Erstellt ein <p>-Element
    msg.className = "user-message";          // Fügt die CSS-Klasse "user-message" hinzu
    msg.textContent = "🧍 " + text;          // Setzt den Nachrichtentext mit Emoji
    chatWindow.appendChild(msg);             // Hängt das Element an das Chatfenster an
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scrollt automatisch ganz nach unten
}

// Fügt eine Nachricht vom Bot in den Chatverlauf ein
function addBotMessage(text) {
    const msg = document.createElement("p"); // Erstellt ein <p>-Element
    msg.className = "bot-message";           // Fügt die CSS-Klasse "bot-message" hinzu
    msg.textContent = "🤖 MoodKI: " + text;  // Fügt Text und Emoji hinzu
    chatWindow.appendChild(msg);             // Fügt die Nachricht dem Chat hinzu
    chatWindow.scrollTop = chatWindow.scrollHeight; // Scrollt automatisch zum Ende
}

// Sendet den eingegebenen Text zusammen mit Stimmung & Stil an den Proxy (→ KI)
async function callAPI(userText) {
    // Wenn eine Stimmung gewählt wurde, baue sie in den Prompt ein
    const prompt = currentMood
        ? `Der Benutzer fühlt sich ${currentMood}. ${userText}`
        : userText;

    addBotMessage("…lädt"); // Zeigt dem Nutzer eine Ladeanzeige

    // Speichert das letzte Bot-Element (zum späteren Überschreiben mit echter Antwort)
    const loadingMsg = chatWindow.querySelector(".bot-message:last-child");

    // Sicherheitscheck: Wurde die Worker-URL schon eingetragen?
    if (PROXY_URL.includes("DEIN-WORKER-NAME")) {
        loadingMsg.textContent = "⚠️ Die KI ist noch nicht verbunden (PROXY_URL fehlt).";
        return;
    }

    try {
        // Sende eine POST-Anfrage an DEINEN Worker – ohne API-Key!
        const res = await fetch(PROXY_URL, {
            method: "POST", // Wir senden Daten
            headers: {
                "Content-Type": "application/json" // Wir senden JSON
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: getSystemPrompt() }, // Rolle & Kommunikationsstil
                    { role: "user", content: prompt }               // Nutzertext mit Stimmung
                ],
                max_tokens: 1000 // Maximale Antwortlänge
            })
        });

        const data = await res.json(); // Antwort als JSON verarbeiten

        // Wenn etwas schief ging → Fehlermeldung werfen
        if (!res.ok) {
            const message = data?.error?.message || data?.error || `HTTP ${res.status}`;
            throw new Error(message);
        }

        // Antworttext in das Ladeelement einfügen
        loadingMsg.textContent = "🤖 MoodKI: " + data.choices[0].message.content;

    } catch (err) {
        // Bei Fehler: Ladeanzeige durch Fehlermeldung ersetzen
        loadingMsg.textContent = `⚠️ Fehler: ${err.message}`;
        console.error(err); // In der Konsole für Entwickler sichtbar
    }
}

// Reagiert sofort mit Text auf die vom Nutzer ausgewählte Stimmung (ohne API-Aufruf)
function respondToMoodChange(mood) {
    switch (mood) {
        case "gut":
            addBotMessage("Nice! 😄 Was hat deinen Tag so gut gemacht?");
            break;
        case "neutral":
            addBotMessage("Alles okay soweit 🌥️. Magst du erzählen, was in deinem Kopf los ist?");
            break;
        case "schlecht":
            addBotMessage("Oh no 😞 Ich bin hier, wenn du reden willst. Was ist passiert?");
            break;
        default:
            addBotMessage("Danke fürs Teilen. Wie fühlst du dich jetzt?");
    }
}

// Erstellt drei Buttons für die Stimmungen "Gut", "Geht so", "Schlecht"
function createMoodButtons() {
    const moods = [
        { label: "🟢 Gut", value: "gut" },
        { label: "🟡 Geht so", value: "neutral" },
        { label: "🔴 Schlecht", value: "schlecht" }
    ];

    chatOptions.innerHTML = ""; // Entfernt alte Buttons, falls vorhanden

    moods.forEach(mood => {
        const btn = document.createElement("button"); // Erstellt Button
        btn.textContent = mood.label;                 // Setzt Buttontext (mit Emoji)
        btn.title = `Stimmung: ${mood.value}`;        // Tooltip anzeigen

        // Klick auf Button: Stimmung setzen, visuell markieren, Bot reagieren lassen
        btn.addEventListener("click", () => {
            currentMood = mood.value;                 // Neue Stimmung speichern
            highlightCurrentMood(btn);                // Button hervorheben
            addUserMessage(`Stimmung geändert: ${mood.label}`); // Nachricht anzeigen
            respondToMoodChange(currentMood);         // Bot-Antwort
        });

        chatOptions.appendChild(btn); // Button in den DOM einfügen
    });
}

// Hebt den aktuell aktiven Stimmungsbutton hervor (alle anderen werden zurückgesetzt)
function highlightCurrentMood(selectedButton) {
    const allButtons = chatOptions.querySelectorAll("button"); // Alle Buttons holen
    allButtons.forEach(btn => btn.classList.remove("selected")); // Entfernt Markierung
    selectedButton.classList.add("selected"); // Aktuell gewählten Button hervorheben
}

// Event Listener für die Texteingabe – wenn Enter gedrückt wird
inputBox.addEventListener("keydown", e => {
    if (e.key === "Enter") { // Wenn die Enter-Taste gedrückt wurde …
        const text = inputBox.value.trim(); // Eingabe von Leerzeichen bereinigen
        if (!text) return; // Leere Eingabe ignorieren
        addUserMessage(text); // Nachricht anzeigen
        inputBox.value = "";   // Eingabefeld leeren
        callAPI(text);         // Anfrage an die KI senden
    }
});

// Initialisierung nach dem Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    addBotMessage("Hey 👋 Wie fühlst du dich gerade?"); // Erste Frage vom Bot anzeigen
    createMoodButtons(); // Buttons zur Stimmungswahl einfügen
    inputBox.style.display = "block"; // Eingabefeld einblenden

    // Zurück-Button aktivieren (zurück zum Schreibtisch)
    const backBtn = document.getElementById("btnBackToDesk");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            // Wenn eingebettet in iFrame mit Tab-Navigation
            if (window.parent && typeof window.parent.showTab === "function") {
                window.parent.showTab("start"); // Navigiert zu Tab "start"
            } else {
                // Sonst: Weiterleitung auf neue Seite
                window.location.href = "schreibtisch.html";
            }
        });
    }
});

// 🧩 Was ist ein <iframe>?
// Ein <iframe> (inline frame) ist ein HTML-Element, das es erlaubt,
// eine andere HTML-Seite innerhalb der aktuellen Webseite anzuzeigen.
//
// Man kann sich das vorstellen wie ein „Fenster im Fenster“ –
// durch das man auf eine andere Seite schaut, ohne die eigentliche Seite zu verlassen.
//
// Beispiel:
// <iframe src="https://example.com" width="600" height="400"></iframe>
//
// 🔄 Warum ist das wichtig in MoodKI?
// In MoodKI gibt es folgenden Code:
//
// if (window.parent && typeof window.parent.showTab === "function") {
//     window.parent.showTab("start");
// }
//
// Dieser Code prüft, ob die aktuelle Seite in einem <iframe> eingebettet ist
// und ob die „Elternseite“ (parent window) eine Funktion namens showTab hat.
// Wenn ja, kann MoodKI dem Elternfenster sagen: „Bitte zeig den Tab 'start' an!“
//
// So kann MoodKI z. B. Teil eines größeren Dashboards oder Web-Desktops sein.
//
// ⚠️ Hinweis:
// Die Kommunikation zwischen iframe und Elternseite funktioniert nur,
// wenn beide Seiten auf der gleichen Domain liegen (z. B. moodyy.de),
// sonst verhindern Browser-Sicherheitsregeln (Same-Origin-Policy) den Zugriff.
