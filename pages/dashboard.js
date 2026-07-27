import {
    getDashboardStats,
    getRecentActivity
} from "../js/api.js";
import {
    startAutoRefresh
} from "../js/utils.js";
import {
    renderEventsChart,
    renderBrowserChart,
    renderTopUsersChart,
    renderTopEventsChart
} from "../js/charts.js";

let dashboardInitialized = false;
export async function loadDashboard() {

    document.getElementById("content").innerHTML = `

        <div class="topbar">

            <div>

                <h1>Dashboard</h1>

                <p>Welcome back. Here's what's happening today.</p>

            </div>

            <div class="profile">

                <div class="avatar">A</div>

            </div>

        </div>

<div class="cards">

    <div class="card">
        <span class="card-title">Total Users</span>
        <h2 id="totalUsers">--</h2>
        <small>Registered users</small>
    </div>

    <div class="card">
        <span class="card-title">Active Users</span>
        <h2 id="activeUsers">--</h2>
        <small>Last 2 minutes</small>
    </div>

    <div class="card">
        <span class="card-title">Sessions Today</span>
        <h2 id="sessionsToday">--</h2>
        <small>Today's sessions</small>
    </div>

    <div class="card">
        <span class="card-title">Events Today</span>
        <h2 id="eventsToday">--</h2>
        <small>Total events</small>
    </div>

    <div class="card">
        <span class="card-title">Errors Today</span>
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
    renderEventsChart("eventsChart"),
    renderBrowserChart("browserChart"),
    renderTopUsersChart("topUsersChart"),
    renderTopEventsChart("topEventsChart")
]);

startAutoRefresh(async () => {

    await Promise.all([
        loadStats(),
        loadRecentActivity(),
        renderEventsChart("eventsChart"),
        renderBrowserChart("browserChart"),
        renderTopUsersChart("topUsersChart"),
        renderTopEventsChart("topEventsChart")
    ]);

});
}

async function loadStats() {

    const stats = await getDashboardStats();

    if (!stats) return;

    document.getElementById("totalUsers").textContent = stats.totalUsers;
    document.getElementById("activeUsers").textContent = stats.activeUsers;
    document.getElementById("sessionsToday").textContent = stats.sessionsToday;
    document.getElementById("eventsToday").textContent = stats.eventsToday;
    document.getElementById("errorsToday").textContent = stats.errorsToday;

}

async function loadRecentActivity() {

    const events = await getRecentActivity();
    console.log(events);
    const container =
        document.getElementById("activityList");

    container.innerHTML = "";

    events.forEach(event => {

        const time = new Date(event.created_at)
            .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

        const browser = event.browser ?? "Unknown Browser";
        const platform = event.platform ?? "Unknown Platform";

        container.innerHTML += `

        <div class="activity-item">

            <div>

                <strong>${formatEventName(event.event)}</strong>

                <br>

                <small>${browser} • ${platform}</small>

            </div>

            <span>${time}</span>

        </div>

    `;

    });
}
function formatEventName(event) {

    return event
        .replaceAll("_", " ")
        .replace(/\b\w/g, c => c.toUpperCase());

}