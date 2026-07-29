import {
    getEventsPerDay,
    getBrowserStats,
    getTopUsers,
    getTopEvents
} from "./api.js";

const THEME = {
    accent: "#38BDF8",
    grid: "rgba(148, 163, 184, 0.12)",
    textMuted: "#94A3B8",
    palette: [
        "#38BDF8", "#818CF8", "#34D399", "#FBBF24",
        "#FB7185", "#A78BFA", "#4ADE80", "#F472B6"
    ]
};

// Shared chart look-and-feel, set once instead of repeating options on
// every chart instance.
Chart.defaults.color = THEME.textMuted;
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = "#1E293B";
Chart.defaults.plugins.tooltip.borderColor = "rgba(148, 163, 184, 0.2)";
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.displayColors = false;

let eventsChart = null;
let browserChart = null;
let topUsersChart = null;
let topEventsChart = null;

function setStatus(elementId, mode, text) {

    // mode: "loading" | "empty" | "hidden"
    const el = document.getElementById(elementId);

    if (!el) return;

    if (mode === "hidden") {
        el.style.display = "none";
        return;
    }

    el.style.display = "flex";
    el.textContent = text ?? (mode === "empty" ? "No data yet" : "Loading…");

}

export async function renderEventsChart(canvasId) {

    const loadingId = "eventsChartLoading";
const ctx = document.getElementById(canvasId);

if (!ctx) return;

eventsChart = ensureFreshChart(eventsChart, ctx);

    if (!eventsChart) setStatus(loadingId, "loading");

    let stats;

    try {
        stats = await getEventsPerDay();
    } catch (err) {
        console.error(err);
        setStatus(loadingId, "empty", "Couldn't load events");
        return;
    }

    if (!stats || stats.length === 0) {
        setStatus(loadingId, "empty");
        return;
    }

    if (!eventsChart) {

        const canvasCtx = ctx.getContext("2d");
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, ctx.height || 300);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0)");

        eventsChart = new Chart(ctx, {

            type: "line",

            data: {
                labels: [],
                datasets: [{
                    label: "Events",
                    data: [],
                    tension: 0.35,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: THEME.accent,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: THEME.accent,
                    pointHoverBorderColor: "#0F172A",
                    pointHoverBorderWidth: 2,
                    borderWidth: 3
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: THEME.grid } }
                }
            }

        });

    }

    setStatus(loadingId, "hidden");

    eventsChart.data.labels = stats.map(x =>
        new Date(x.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short"
        })
    );

    eventsChart.data.datasets[0].data = stats.map(x => x.count);

    eventsChart.update();

}

export async function renderBrowserChart(canvasId) {

    const loadingId = "browserChartLoading";
const ctx = document.getElementById(canvasId);

if (!ctx) return;

browserChart = ensureFreshChart(browserChart, ctx);

    if (!browserChart) setStatus(loadingId, "loading");

    let stats;

    try {
        stats = await getBrowserStats();
    } catch (err) {
        console.error(err);
        setStatus(loadingId, "empty", "Couldn't load browser data");
        return;
    }

    if (!stats || stats.length === 0) {
        setStatus(loadingId, "empty");
        return;
    }

    if (!browserChart) {

        browserChart = new Chart(ctx, {

            type: "doughnut",

            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: THEME.palette,
                    borderColor: "#1E293B",
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#E5E7EB",
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: "circle"
                        }
                    }
                }
            }

        });

    }

    setStatus(loadingId, "hidden");

    browserChart.data.labels = stats.map(x => x.browser);
    browserChart.data.datasets[0].data = stats.map(x => x.count);

    browserChart.update();

}

export async function renderTopUsersChart(canvasId) {

    const loadingId = "topUsersLoading";
const ctx = document.getElementById(canvasId);

if (!ctx) return;

topUsersChart = ensureFreshChart(topUsersChart, ctx);

    if (!topUsersChart) setStatus(loadingId, "loading");

    let stats;

    try {
        stats = await getTopUsers();
    } catch (err) {
        console.error(err);
        setStatus(loadingId, "empty", "Couldn't load top users");
        return;
    }

    if (!stats || stats.length === 0) {
        setStatus(loadingId, "empty");
        return;
    }

    if (!topUsersChart) {

        topUsersChart = new Chart(ctx, {

            type: "bar",

            data: {
                labels: [],
                datasets: [{
                    label: "Events",
                    data: [],
                    backgroundColor: THEME.accent,
                    borderRadius: 4,
                    borderWidth: 0,
                    maxBarThickness: 28
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: THEME.grid } },
                    y: { grid: { display: false } }
                }
            }

        });

    }

    setStatus(loadingId, "hidden");

    topUsersChart.data.labels = stats.map(x => x.alias);
    topUsersChart.data.datasets[0].data = stats.map(x => x.count);

    topUsersChart.update();

}

export async function renderTopEventsChart(canvasId) {

    const loadingId = "topEventsLoading";
  const ctx = document.getElementById(canvasId);

if (!ctx) return;

topEventsChart = ensureFreshChart(topEventsChart, ctx);

    if (!topEventsChart) setStatus(loadingId, "loading");

    let stats;

    try {
        stats = await getTopEvents();
    } catch (err) {
        console.error(err);
        setStatus(loadingId, "empty", "Couldn't load top events");
        return;
    }

    if (!stats || stats.length === 0) {
        setStatus(loadingId, "empty");
        return;
    }

    if (!topEventsChart) {

        topEventsChart = new Chart(ctx, {

            type: "bar",

            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: THEME.palette,
                    borderRadius: 4,
                    borderWidth: 0,
                    maxBarThickness: 28
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: THEME.grid } },
                    y: { grid: { display: false } }
                }
            }

        });

    }

    setStatus(loadingId, "hidden");

    topEventsChart.data.labels = stats.map(x =>
        x.event
            .replaceAll("_", " ")
            .replace(/\b\w/g, c => c.toUpperCase())
    );

    topEventsChart.data.datasets[0].data = stats.map(x => x.count);

    topEventsChart.update();

}

/**
 * Renders all four dashboard charts concurrently instead of one after
 * another — noticeably faster first paint on the dashboard page.
 * ids = { events, browser, topUsers, topEvents } canvas element IDs.
 */
export async function renderAllCharts(ids) {

    await Promise.all([
        renderEventsChart(ids.events),
        renderBrowserChart(ids.browser),
        renderTopUsersChart(ids.topUsers),
        renderTopEventsChart(ids.topEvents)
    ]);

}

/**
 * Tears down all chart instances. Call this when navigating away from the
 * dashboard so Chart.js instances don't linger and leak memory, and so a
 * later re-render starts clean.
 */
export function destroyCharts() {

    eventsChart?.destroy();
    browserChart?.destroy();
    topUsersChart?.destroy();
    topEventsChart?.destroy();

    eventsChart = null;
    browserChart = null;
    topUsersChart = null;
    topEventsChart = null;
}
    function ensureFreshChart(chart, canvas) {

    if (chart && chart.canvas !== canvas) {
        chart.destroy();
        return null;
    }

    return chart;

}

