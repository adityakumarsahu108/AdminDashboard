import { supabase } from "./supabase.js";

// The users table is looked up (for alias/browser/platform) by almost
// every function on this page. Rather than re-querying the whole table
// each time, cache it briefly and share it. Call invalidateUserCache()
// after any action that changes user data (e.g. renaming an alias) if you
// need the next lookup to be fresh immediately.
const USER_MAP_TTL_MS = 30000;
let userMapCache = { data: null, timestamp: 0 };

// Client-side aggregation (getTopUsers, getTopEvents, getEventsPerDay)
// pulls raw rows and counts them in JS. Capping the row count keeps a
// large table from freezing the browser on a single page load. If the
// table regularly exceeds this, move the aggregation server-side
// (a Postgres RPC / view) instead of raising this number.
const AGGREGATION_ROW_LIMIT = 5000;

export function invalidateUserCache() {
    userMapCache = { data: null, timestamp: 0 };
}

async function getUserMap() {

    const now = Date.now();

    if (userMapCache.data && (now - userMapCache.timestamp) < USER_MAP_TTL_MS) {
        return userMapCache.data;
    }

    const { data, error } = await supabase
        .from("users")
        .select("anonymous_id, alias, browser, platform");

    if (error) {

        console.error(error);
        // Fall back to whatever we had rather than an empty map, so a
        // transient error doesn't blank out every alias on screen.
        return userMapCache.data || {};

    }

    const map = Object.fromEntries(
        data.map(user => [
            user.anonymous_id,
            {
                alias: user.alias,
                browser: user.browser,
                platform: user.platform
            }
        ])
    );

    userMapCache = { data: map, timestamp: now };

    return map;

}

export async function getDashboardStats() {

    try {

        const now = new Date();
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000).toISOString();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        // These five counts are independent, so run them concurrently
        // instead of five sequential round-trips — cuts dashboard load
        // time roughly 5x on a typical connection.
        const [
            totalUsersRes,
            activeUsersRes,
            sessionsTodayRes,
            eventsTodayRes,
            errorsTodayRes
        ] = await Promise.all([
            supabase.from("users").select("*", { count: "exact", head: true }),
            supabase.from("users").select("*", { count: "exact", head: true })
                .gte("last_activity", twoMinutesAgo),
            supabase.from("sessions").select("*", { count: "exact", head: true })
                .gte("started_at", todayIso),
            supabase.from("events").select("*", { count: "exact", head: true })
                .gte("created_at", todayIso),
            supabase.from("errors").select("*", { count: "exact", head: true })
                .gte("created_at", todayIso)
        ]);

        [totalUsersRes, activeUsersRes, sessionsTodayRes, eventsTodayRes, errorsTodayRes]
            .forEach(res => { if (res.error) console.error(res.error); });

        return {

            totalUsers: totalUsersRes.count || 0,
            activeUsers: activeUsersRes.count || 0,
            sessionsToday: sessionsTodayRes.count || 0,
            eventsToday: eventsTodayRes.count || 0,
            errorsToday: errorsTodayRes.count || 0

        };

    } catch (err) {

        console.error(err);

        return null;

    }

}

export async function getRecentActivity() {

    // Fetch the recent-events query and the user map in parallel — they
    // don't depend on each other, so there's no reason to serialize them.
    // (Previously this also fetched a separate alias-only map that was
    // never used — removed.)
    const [{ data, error }, userMap] = await Promise.all([
        supabase
            .from("events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10),
        getUserMap()
    ]);

    if (error) {

        console.error(error);

        return [];

    }

    data.forEach(event => {

        const user = userMap[event.anonymous_id];

        event.alias = user?.alias ?? "-";
        event.browser = user?.browser ?? "-";
        event.platform = user?.platform ?? "-";

    });

    return data;

}

export async function getUsers(page = 1, pageSize = 20, search = "") {

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("users")
        .select("*", { count: "exact" });

    const searchText = search.trim();

    if (searchText !== "") {

        query = query.or(
            [
                `alias.ilike.%${searchText}%`,
                `browser.ilike.%${searchText}%`,
                `platform.ilike.%${searchText}%`,
                `version.ilike.%${searchText}%`
            ].join(",")
        );

    }

    const { data, error, count } = await query
        .order("last_seen", { ascending: false })
        .range(from, to);

    if (error) {

        console.error("getUsers error:", error);

        return {
            data: [],
            total: 0
        };

    }

    return {
        data: data ?? [],
        total: count ?? 0
    };

}

export async function getEvents(page = 1, pageSize = 25, search = "") {

    let query = supabase
        .from("events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

    if (search.trim() !== "") {

        query = query.ilike("event", `%${search}%`);

    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ data, error, count }, userMap] = await Promise.all([
        query.range(from, to),
        getUserMap()
    ]);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(event => {

        event.alias = userMap[event.anonymous_id]?.alias ?? "-";

    });

    return {

        data,
        total: count

    };

}

export async function getSessions(page = 1, pageSize = 25) {

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ data, error, count }, userMap] = await Promise.all([
        supabase
            .from("sessions")
            .select("*", { count: "exact" })
            .order("started_at", { ascending: false })
            .range(from, to),
        getUserMap()
    ]);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(session => {

        session.alias = userMap[session.anonymous_id]?.alias ?? "-";

    });

    return {

        data,
        total: count

    };

}

export async function getErrors(page = 1, pageSize = 25) {

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ data, error, count }, userMap] = await Promise.all([
        supabase
            .from("errors")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to),
        getUserMap()
    ]);

    if (error) {

        console.error(error);

        return {

            data: [],
            total: 0

        };

    }

    data.forEach(err => {

        const user = userMap[err.anonymous_id];

        err.alias = user?.alias ?? "-";

    });

    return {

        data,
        total: count

    };

}

export async function getEventsPerDay(days = 7) {

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from("events")
        .select("created_at")
        .gte("created_at", start.toISOString())
        .order("created_at", { ascending: true })
        .limit(AGGREGATION_ROW_LIMIT);

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    for (let i = 0; i < days; i++) {

        const d = new Date(start);

        d.setDate(start.getDate() + i);

        const key = d.toISOString().split("T")[0];

        counts[key] = 0;

    }

    data.forEach(event => {

        const key = event.created_at.split("T")[0];

        if (counts[key] !== undefined) {

            counts[key]++;

        }

    });

    return Object.entries(counts).map(([date, count]) => ({

        date,

        count

    }));

}

export async function getBrowserStats() {

    const { data, error } = await supabase
        .from("users")
        .select("browser");

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(user => {

        const browser = user.browser || "Unknown";

        counts[browser] = (counts[browser] || 0) + 1;

    });

    return Object.entries(counts).map(([browser, count]) => ({

        browser,

        count

    }));

}

export async function getTopUsers(limit = 5) {

    const [{ data, error }, userMap] = await Promise.all([
        supabase
            .from("events")
            .select("anonymous_id")
            .limit(AGGREGATION_ROW_LIMIT),
        getUserMap()
    ]);

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(event => {

        counts[event.anonymous_id] =
            (counts[event.anonymous_id] || 0) + 1;

    });

    return Object.entries(counts)
        .map(([id, count]) => ({

            alias: userMap[id]?.alias || "Unknown",

            count

        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

}

export async function getTopEvents(limit = 8) {

    const { data, error } = await supabase
        .from("events")
        .select("event")
        .limit(AGGREGATION_ROW_LIMIT);

    if (error) {

        console.error(error);

        return [];

    }

    const counts = {};

    data.forEach(e => {

        counts[e.event] = (counts[e.event] || 0) + 1;

    });

    return Object.entries(counts)
        .map(([event, count]) => ({

            event,

            count

        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

}