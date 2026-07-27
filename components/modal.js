export function showModal(title, content) {

    const existing = document.getElementById("modalOverlay");

    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");

    overlay.id = "modalOverlay";

    overlay.innerHTML = `

        <div class="modal">

            <div class="modal-header">

                <h2>${title}</h2>

                <button id="closeModal">&times;</button>

            </div>

            <div class="modal-body">

                <pre>${content}</pre>

            </div>

        </div>

    `;

    document.body.appendChild(overlay);

    document
        .getElementById("closeModal")
        .onclick = () => overlay.remove();

    overlay.onclick = (e) => {

        if (e.target === overlay)
            overlay.remove();

    };

}