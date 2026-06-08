export default class LogInScene extends Phaser.Scene {
    constructor() {
        super("LogInScene");
    }

    create() {

        // DATI è UN OGGETO CHE CONTIENE USERNAME E PASSWORD

    }

    update() {

    }

    async connettiAlServer(dati) {
        const res = await fetch("https://cyberpunch67.onrender.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: dati.usernameInput,
                password: dati.passwordInput
            })
        });

        const data = await res.json();

        localStorage.setItem("token", data.token);

        this.socket = io("https://cyberpunch67.onrender.com", {
            auth: {
                token: localStorage.getItem("token")
            }
        });
    }
}