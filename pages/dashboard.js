import {
    getDashboardStats,
    getRecentActivity
} from "../js/api.js";
import {
    startAutoRefresh
} from "../js/utils.js";
import {
    renderAllCharts
} from "../js/charts.js";



export async function loadDashboard() {

    document.getElementById("content").innerHTML = `

        <div class="topbar">

            <div>

                <h1>Dashboard</h1>

                <p>${getGreeting()} Here's what's happening today.</p>

            </div>

            <div class="profile">

                <div class="avatar">A</div>

            </div>

        </div>

<div class="cards">

    <div class="card">
        <span class="card-title">📇 Total Users</span>
        <h2 id="totalUsers">--</h2>
        <small>Registered users</small>
    </div>

    <div class="card">
        <span class="card-title">Active Users</span>
        <h2 id="activeUsers">--</h2>
        <small>Last 2 minutes</small>
    </div>

    <div class="card">
        <span class="card-title">🗓️ Sessions Today</span>
        <h2 id="sessionsToday">--</h2>
        <small>Today's sessions</small>
    </div>

    <div class="card">
        <span class="card-title">⚡ Events Today</span>
        <h2 id="eventsToday">--</h2>
        <small>Total events</small>
    </div>

    <div class="card">
        <span class="card-title">⚠️ Errors Today</span>
        <h2 id="errorsToday">--</h2>
        <small>Runtime errors</small>
    </div>

</div>

<div class="dashboard-grid">

    <!-- Events -->

    <div class="panel">

        <h3>📈 Events (Last 7 Days)</h3>

        <div class="chart-container">

            <div id="eventsChartLoading" class="chart-loading">

                Loading chart...

            </div>

            <canvas id="eventsChart"></canvas>

        </div>

    </div>

    <!-- Browser -->

    <div class="panel">

        <h3>🌐 Browser Distribution</h3>

        <div class="chart-container">

            <div id="browserChartLoading" class="chart-loading">

                Loading chart...

            </div>

            <canvas id="browserChart"></canvas>

        </div>

    </div>

    <!-- Top Users -->

    <div class="panel">

        <h3>👥 Top Active Users</h3>

        <div class="chart-container">

            <div id="topUsersLoading" class="chart-loading">

                Loading chart...

            </div>

            <canvas id="topUsersChart"></canvas>

        </div>

    </div>

    <!-- Recent Activity -->

    <div class="panel">

        <h3>🕒 Recent Activity</h3>

        <div id="activityList">

            Loading...

        </div>

    </div>

    <div class="panel">

    <h3>⭐ Top Events</h3>

    <div class="chart-container">

        <div id="topEventsLoading" class="chart-loading">

            Loading chart...

        </div>

        <canvas id="topEventsChart"></canvas>

    </div>

</div>

</div>

    `;
    // Load stats immediately
    await Promise.all([
    loadStats(),
    loadRecentActivity(),
    renderAllCharts({
        events: "eventsChart",
        browser: "browserChart",
        topUsers: "topUsersChart",
        topEvents: "topEventsChart"
    })
]);

startAutoRefresh(async () => {

   await Promise.all([
    loadStats(),
    loadRecentActivity(),
    renderAllCharts({
        events: "eventsChart",
        browser: "browserChart",
        topUsers: "topUsersChart",
        topEvents: "topEventsChart"
    })
]);

});
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning.";
    if (hour < 18) return "Good afternoon.";
    return "Good evening.";
}

async function loadStats() {

    const stats = await getDashboardStats();

    if (!stats) return;

    animateStat("totalUsers", stats.totalUsers);
    animateStat("activeUsers", stats.activeUsers);
    animateStat("sessionsToday", stats.sessionsToday);
    animateStat("eventsToday", stats.eventsToday);
    animateStat("errorsToday", stats.errorsToday);

}

// Smoothly counts a stat element up (or down) to its new value.
// Falls back instantly for non-numeric values so it never breaks display.
function animateStat(elementId, targetValue) {

    const el = document.getElementById(elementId);
    if (!el) return;

    const numericTarget = Number(targetValue);

    if (Number.isNaN(numericTarget)) {
        el.textContent = targetValue;
        return;
    }

    const startValue = Number(el.dataset.rawValue ?? 0) || 0;
    const duration = 600;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (numericTarget - startValue) * eased);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.dataset.rawValue = numericTarget;
        }
    }

    requestAnimationFrame(step);
}

async function loadRecentActivity() {

    const events = await getRecentActivity();

    // User may have already navigated away
    const container = document.getElementById("activityList");

    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML =
            `<div class="activity-item"><small>No recent activity yet.</small></div>`;
        return;
    }

    container.innerHTML = events.map(event => {

        const time = new Date(event.created_at)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        const browser = event.browser ?? "Unknown Browser";
        const platform = event.platform ?? "Unknown Platform";

        return `
            <div class="activity-item">
                <div>
                    <strong>${formatEventName(event.event)}</strong>
                    <br>
                    <small>${browser} • ${platform}</small>
                </div>
                <span>${time}</span>
            </div>
        `;

    }).join("");

}
function formatEventName(event) {

    return event
        .replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

}