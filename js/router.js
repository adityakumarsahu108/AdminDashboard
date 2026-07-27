import { loadDashboard } from "../pages/dashboard.js";
import { loadUsers } from "../pages/users.js";
import { loadSessions } from "../pages/sessions.js";
import { loadEvents } from "../pages/events.js";
import { loadErrors } from "../pages/errors.js";
import { loadSettings } from "../pages/settings.js";
import { stopAutoRefresh } from "./utils.js";

export function navigate(page) {
    stopAutoRefresh();
    switch (page) {

        case "dashboard":
            loadDashboard();
            break;

        case "users":
            loadUsers();
            break;

        case "sessions":
            loadSessions();
            break;

        case "events":
            loadEvents();
            break;

        case "errors":
            loadErrors();
            break;

        case "settings":
            loadSettings();
            break;
    }

}