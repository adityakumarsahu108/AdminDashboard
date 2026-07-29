import { loadDashboard } from "../pages/dashboard.js";
import { loadUsers } from "../pages/users.js";
import { loadSessions } from "../pages/sessions.js";
import { loadEvents } from "../pages/events.js";
import { loadErrors } from "../pages/errors.js";
import { loadSettings } from "../pages/settings.js";
import { stopAutoRefresh } from "./utils.js";
import { destroyCharts } from "./charts.js";

const routes = {
    dashboard: loadDashboard,
    users: loadUsers,
    sessions: loadSessions,
    events: loadEvents,
    errors: loadErrors,
    settings: loadSettings
};

let currentPage = null;

export function navigate(page) {

    let target = page;

    if (!routes[target]) {

        console.warn(`Unknown route "${page}" — falling back to dashboard`);
        target = "dashboard";

    }

    stopAutoRefresh();

    // Clean up dashboard charts before leaving dashboard
    if (currentPage === "dashboard" && target !== "dashboard") {
        destroyCharts();
    }

    currentPage = target;

    updateActiveNav(target);

    routes[target]();

}

export function getCurrentPage() {

    return currentPage;

}

// UX: keeps the sidebar/nav in sync with whatever page is actually
// showing, instead of relying on each page to remember to do it. Expects
// nav links/buttons to carry a `data-page="dashboard"` (etc.) attribute —
// adjust the selector/attribute name if your markup uses something else.
function updateActiveNav(page) {

    document.querySelectorAll("[data-page]").forEach(el => {

        el.classList.toggle("active", el.dataset.page === page);

    });

}