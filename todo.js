const eingabeFeld = document.querySelector("#eingabe"); // Holt das Eingabefeld für die Aufgabe
const datumFeld = document.querySelector("#datum"); // Holt das Eingabefeld für das Fälligkeitsdatum
const button = document.querySelector("#hinzufuegen-button"); // Holt den Button zum Hinzufügen einer neuen Aufgabe
const fehlermeldung = document.querySelector("#fehlermeldung"); // Element für Fehlermeldungen
const liste = document.querySelector("#todoList"); // Holt die UL-Liste, in der die Aufgaben angezeigt werden

let aufgaben = JSON.parse(localStorage.getItem("todos")) || []; // Lädt Aufgaben aus dem lokalen Speicher oder startet mit leerem Array
zeigeAlleAufgaben(); // Zeigt alle Aufgaben sofort beim Laden der Seite

button.addEventListener("click", () => { // Beim Klick auf den Hinzufügen-Button ...
    const text = eingabeFeld.value.trim(); // Eingabetext ohne Leerzeichen vorn und hinten
    const datum = datumFeld.value; // Ausgewähltes Datum

    if (text === "") { // Wenn Eingabe leer ist ...
        zeigeFehler("Bitte gib eine Aufgabe ein."); // Fehlermeldung anzeigen
        return; // Funktion abbrechen
    }

    if (text.length > 50) { // Wenn Text zu lang ...
        zeigeFehler("Die Aufgabe darf maximal 50 Zeichen lang sein."); // Fehlermeldung anzeigen
        return; // Funktion abbrechen
    }

    aufgaben.push({ text, faelligBis: datum, erledigt: false }); // Neue Aufgabe ins Array
    speichereAufgaben(); // Aufgaben speichern
    eingabeFeld.value = ""; // Eingabefeld leeren
    datumFeld.value = ""; // Datum leeren
    versteckeFehler(); // Fehlermeldung verstecken
    zeigeAlleAufgaben(); // Liste neu anzeigen
});

eingabeFeld.addEventListener("input", () => { // Bei Eingabe im Textfeld
    const text = eingabeFeld.value.trim(); // Eingabetext prüfen
    if (text !== "" && text.length <= 50) versteckeFehler(); // Fehlermeldung bei gültigem Text ausblenden
});

function zeigeFehler(msg) {
    fehlermeldung.textContent = msg; // Fehlermeldungstext setzen
    fehlermeldung.style.display = "block"; // Einblenden
    eingabeFeld.classList.add("is-invalid"); // Rotes Feld anzeigen (z. B. mit CSS)
}

function versteckeFehler() {
    fehlermeldung.textContent = ""; // Text leeren
    fehlermeldung.style.display = "none"; // Ausblenden
    eingabeFeld.classList.remove("is-invalid"); // Klasse entfernen
}

function speichereAufgaben() {
    localStorage.setItem("todos", JSON.stringify(aufgaben)); // Array in JSON umwandeln und im Browser speichern
}

function zeigeAlleAufgaben() {
    liste.innerHTML = ""; // Bisherige Aufgabenliste leeren

    aufgaben.forEach((aufgabe, index) => { // Für jede Aufgabe …
        const li = document.createElement("li"); // Neues Listenelement

        const status = bewerteFaelligkeit(aufgabe.faelligBis); // Bewertet, ob Aufgabe überfällig, heute oder später ist

        const checkbox = document.createElement("input"); // Checkbox zur Erledigung
        checkbox.type = "checkbox";
        checkbox.checked = aufgabe.erledigt;
        checkbox.style.marginRight = "10px";
        checkbox.addEventListener("change", () => { // Wenn Checkbox geändert wird …
            aufgabe.erledigt = checkbox.checked;
            speichereAufgaben(); // Speichern
            zeigeAlleAufgaben(); // Seite neu laden
        });

        const text = document.createElement("span"); // Text der Aufgabe
        text.textContent = `${aufgabe.text} ${status.icon}`; // Text mit Status-Icon (⏰❗️✅)
        text.className = status.klasse; // Klasse je nach Status
        if (aufgabe.erledigt) {
            text.classList.add("erledigt"); // Zusätzliche Klasse bei erledigt
        }

        const datum = document.createElement("small"); // Datum in kleiner Schrift
        datum.textContent = aufgabe.faelligBis || "";
        datum.style.marginLeft = "10px";
        datum.style.opacity = "0.6";

        const btnGroup = document.createElement("div"); // Gruppe für Icons (Hoch/Runter/Bearbeiten/Löschen)

        const hochBtn = erzeugeIconButton("⬆️", () => {
            if (index > 0) {
                [aufgaben[index], aufgaben[index - 1]] = [aufgaben[index - 1], aufgaben[index]]; // Tauschen mit Element davor
                speichereAufgaben();
                zeigeAlleAufgaben();
            }
        });

        const runterBtn = erzeugeIconButton("⬇️", () => {
            if (index < aufgaben.length - 1) {
                [aufgaben[index], aufgaben[index + 1]] = [aufgaben[index + 1], aufgaben[index]]; // Tauschen mit Element danach
                speichereAufgaben();
                zeigeAlleAufgaben();
            }
        });

        const bearbeitenBtn = erzeugeIconButton("✏️", () => {
            eingabeFeld.value = aufgabe.text; // Text ins Eingabefeld
            datumFeld.value = aufgabe.faelligBis; // Datum zurück ins Datumfeld
            aufgaben.splice(index, 1); // Aufgabe aus Liste löschen
            speichereAufgaben();
            zeigeAlleAufgaben();
        });

        const loeschenBtn = erzeugeIconButton("🗑️", () => {
            aufgaben.splice(index, 1); // Aufgabe löschen
            speichereAufgaben();
            zeigeAlleAufgaben();
        });

        btnGroup.append(hochBtn, runterBtn, bearbeitenBtn, loeschenBtn); // Alle Buttons zusammen einfügen

        const infoBlock = document.createElement("div"); // Bereich für Checkbox, Text & Datum
        infoBlock.style.display = "flex";
        infoBlock.style.alignItems = "center";
        infoBlock.appendChild(checkbox);
        infoBlock.appendChild(text);
        infoBlock.appendChild(datum);

        li.append(infoBlock, btnGroup); // Aufgabenzeile zusammenbauen
        liste.appendChild(li); // Aufgabe zur Liste hinzufügen
    });
}

function erzeugeIconButton(emoji, onClick) {
    const btn = document.createElement("button"); // Erzeugt generischen Button
    btn.textContent = emoji; // Emoji als Symbol
    btn.addEventListener("click", onClick); // Klickfunktion zuweisen
    return btn; // Button zurückgeben
}

function bewerteFaelligkeit(datum) {
    if (!datum) return { icon: "", klasse: "" }; // Falls kein Datum vorhanden ist

    const heute = new Date().toISOString().split("T")[0]; // Heutiges Datum im Format YYYY-MM-DD

    if (datum < heute) {
        return { icon: "❗️", klasse: "text-danger" }; // Überfällig = rot
    } else if (datum === heute) {
        return { icon: "⏰", klasse: "text-warning" }; // Heute = gelb
    } else {
        return { icon: "✅", klasse: "text-success" }; // Zukunft = grün
    }
}

// Funktion beim Laden der Seite, um "Zurück"-Button zu aktivieren
document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("btnBackToDesk"); // Button holen
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (window.parent && typeof window.parent.showTab === "function") {
                window.parent.showTab("start"); // Zurück zur Start-Ansicht (über Tabs)
            } else {
                console.warn("showTab-Funktion im parent-Fenster nicht gefunden."); // Warnung, falls Tabfunktion fehlt
            }
        });
    }
});
