document.addEventListener("DOMContentLoaded", () => {
    const deskBtn = document.getElementById("deskBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const signupForm = document.getElementById("signupForm");
    const form = document.getElementById("form");

    const nameGroup = document.getElementById("nameGroup");
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    const formTitle = document.getElementById("formTitle");
    const submitBtn = document.getElementById("submitBtn");
    const switchMode = document.getElementById("switchMode");
    const switchText = document.getElementById("switchText");

    let isLogin = false;

    // Wenn eingeloggt → nur Buttons zeigen
    if (localStorage.getItem("isLoggedIn") === "true") {
        showLoggedInUI();
    }

    // Formular absenden
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        if (email && password && (isLogin || name)) {
            localStorage.setItem("isLoggedIn", "true");
            showLoggedInUI();
        } else {
            alert("Bitte alle Felder ausfüllen.");
        }
    });

    // Umschalten Login/Signup
    switchMode.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        if (isLogin) {
            formTitle.textContent = "LOGIN";
            submitBtn.textContent = "LOGIN";
            nameGroup.style.display = "none";
            switchText.innerHTML = `Need an Account? <a class="link" href="#" id="switchMode">Sign up Here!</a>`;
        } else {
            formTitle.textContent = "SIGN UP";
            submitBtn.textContent = "SIGN UP";
            nameGroup.style.display = "block";
            switchText.innerHTML = `Have an Account? <a class="link" href="#" id="switchMode">Login Here!</a>`;
        }

        // Umschalt-Event neu binden
        document.getElementById("switchMode").addEventListener("click", switchModeClick);
    });

    function switchModeClick(e) {
        e.preventDefault();
        switchMode.click();
    }

    // Logout-Funktion
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        deskBtn.style.display = "none";
        logoutBtn.style.display = "none";
        signupForm.style.display = "flex";
        isLogin = false;
        formTitle.textContent = "SIGN UP";
        submitBtn.textContent = "SIGN UP";
        nameGroup.style.display = "block";
        switchText.innerHTML = `Have an Account? <a class="link" href="#" id="switchMode">Login Here!</a>`;
        document.getElementById("switchMode").addEventListener("click", switchModeClick);
    });

    // Eingeloggt-Ansicht
    function showLoggedInUI() {
        deskBtn.style.display = "inline-block";
        logoutBtn.style.display = "inline-block";
        signupForm.style.display = "none";
    }
});