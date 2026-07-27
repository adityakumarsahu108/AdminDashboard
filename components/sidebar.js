import { navigate } from "../js/router.js";

export function createSidebar() {

    document.getElementById("sidebar").innerHTML = `

        <div class="logo">

            📊

            <div>
                <h2>Daily Report</h2>
                <span>Analytics</span>
            </div>

        </div>

        <nav>

            <a data-page="dashboard" class="active">🏠 Dashboard</a>

            <a data-page="users">👥 Users</a>

            <a data-page="sessions">📋 Sessions</a>

            <a data-page="events">⚡ Events</a>

            <a data-page="errors">🚨 Errors</a>

            <a data-page="settings">⚙ Settings</a>

        </nav>

    `;

    // Attach click events AFTER the HTML is rendered
    document.querySelectorAll("#sidebar nav a").forEach(item => {

        item.addEventListener("click", () => {

            document.querySelectorAll("#sidebar nav a")
                .forEach(link => link.classList.remove("active"));

            item.classList.add("active");

            navigate(item.dataset.page);

        });

    });

}