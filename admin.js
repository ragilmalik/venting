/**
 * Venting Admin Panel
 * Full-featured admin dashboard
 */

const ADMIN_API = '/admin-api.php';
let isLoggedIn = false;
let posts = [];
let selectedPosts = [];
let stats = {};
let onlineUsers = 0;
let chartData = [];
let activityChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

/**
 * Check if admin is logged in
 */
async function checkSession() {
    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check_session' })
        });

        const data = await response.json();

        if (data.success && data.logged_in) {
            isLoggedIn = true;
            showDashboard();
        } else {
            showLoginForm();
        }
    } catch (error) {
        console.error('Session check failed:', error);
        showLoginForm();
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    document.getElementById('app').innerHTML = `
        <div class="login-panel">
            <h1>🔐 Admin Login</h1>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required autocomplete="current-password">
                </div>
                <button type="submit" class="login-btn">Login</button>
            </form>
        </div>
    `;
}

/**
 * Handle login
 */
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                username,
                password
            })
        });

        const data = await response.json();

        if (data.success) {
            isLoggedIn = true;
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login failed:', error);
        showNotification('Network error', 'error');
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' })
        });

        isLoggedIn = false;
        showNotification('Logged out successfully', 'success');
        showLoginForm();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

/**
 * Show dashboard
 */
async function showDashboard() {
    await loadStats();
    await loadOnlineUsers();
    await load7DayStats();
    await loadPosts();

    renderDashboard();

    // Start auto-refresh for online users
    startOnlineUsersRefresh();
}

/**
 * Load stats
 */
async function loadStats() {
    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_stats' })
        });

        const data = await response.json();

        if (data.success) {
            stats = data.stats;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Load online users count
 */
async function loadOnlineUsers() {
    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_online_users' })
        });

        const data = await response.json();

        if (data.success) {
            onlineUsers = data.count;
            // Update UI if already rendered
            const onlineUsersElement = document.getElementById('onlineUsersCount');
            if (onlineUsersElement) {
                onlineUsersElement.textContent = onlineUsers;
            }
        }
    } catch (error) {
        console.error('Failed to load online users:', error);
    }
}

/**
 * Start online users auto-refresh
 */
function startOnlineUsersRefresh() {
    // Refresh every 10 seconds
    setInterval(loadOnlineUsers, 10000);
}

/**
 * Load 7-day statistics
 */
async function load7DayStats() {
    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_7day_stats' })
        });

        const data = await response.json();

        if (data.success) {
            chartData = data.stats;
        }
    } catch (error) {
        console.error('Failed to load 7-day stats:', error);
    }
}

/**
 * Load all posts
 */
async function loadPosts(searchTerm = '') {
    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'get_all_posts',
                search: searchTerm
            })
        });

        const data = await response.json();

        if (data.success) {
            posts = data.posts;
            renderDashboard();
        }
    } catch (error) {
        console.error('Failed to load posts:', error);
    }
}

/**
 * Render dashboard
 */
function renderDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="admin-header">
            <h1>⚡ Admin Dashboard</h1>
            <button class="logout-btn" onclick="handleLogout()">Logout</button>
        </div>

        <div class="stats-panel">
            <div class="stat-card">
                <div class="stat-value">${stats.total_posts || 0}</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.today_posts || 0}</div>
                <div class="stat-label">Today's Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.unique_ips || 0}</div>
                <div class="stat-label">Unique IPs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.last_24h || 0}</div>
                <div class="stat-label">Last 24 Hours</div>
            </div>
            <div class="stat-card online-users-card">
                <div class="stat-value" style="color: var(--success);">
                    <span id="onlineUsersCount">${onlineUsers || 0}</span>
                </div>
                <div class="stat-label">
                    <svg viewBox="0 0 24 24" fill="currentColor" style="width: 12px; height: 12px; display: inline-block; margin-right: 4px; color: var(--success);">
                        <circle cx="12" cy="12" r="10" opacity="0.2"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Online Now
                </div>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-title">Last 7 Days Activity</div>
            <div class="chart-wrapper">
                <canvas id="activityChart"></canvas>
            </div>
        </div>

        <div class="controls-panel">
            <div class="search-box">
                <input type="text" id="searchInput" class="search-input" placeholder="Search posts by content, IP, or user agent...">
                <button class="btn btn-search" onclick="searchPosts()">Search</button>
                <button class="btn btn-clear" onclick="clearSearch()">Clear</button>
            </div>
            <div class="bulk-actions">
                <label style="color: var(--text-secondary);">
                    <input type="checkbox" class="checkbox" id="selectAll" onchange="toggleSelectAll()">
                    Select All
                </label>
                <button class="btn btn-export" onclick="exportSelected()" id="exportSelectedBtn" disabled>
                    📥 Export Selected (<span id="exportSelectedCount">0</span>)
                </button>
                <button class="btn btn-export-all" onclick="exportAll()">
                    📦 Export All Posts
                </button>
                <button class="btn btn-danger" onclick="deleteSelected()" id="deleteSelectedBtn" disabled>
                    Delete Selected (<span id="selectedCount">0</span>)
                </button>
            </div>
        </div>

        <div class="posts-table-container">
            <table class="posts-table">
                <thead>
                    <tr>
                        <th width="40">
                            <input type="checkbox" class="checkbox" id="selectAllHeader" onchange="toggleSelectAll()">
                        </th>
                        <th width="60">ID</th>
                        <th width="120">IP Address</th>
                        <th width="150">Time (UTC+7)</th>
                        <th width="200">User Agent</th>
                        <th>Content</th>
                        <th width="100">Actions</th>
                    </tr>
                </thead>
                <tbody id="postsTableBody">
                    ${renderPostsTable()}
                </tbody>
            </table>
        </div>
    `;

    // Add keyboard shortcut for search
    document.getElementById('searchInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            searchPosts();
        }
    });

    // Initialize chart
    initializeChart();
}

/**
 * Render posts table
 */
function renderPostsTable() {
    if (posts.length === 0) {
        return `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    No posts found
                </td>
            </tr>
        `;
    }

    return posts.map(post => `
        <tr id="post-${post.id}">
            <td>
                <input type="checkbox" class="checkbox post-checkbox" value="${post.id}" onchange="updateSelection()">
            </td>
            <td>${post.id}</td>
            <td class="ip-cell">${escapeHtml(post.ip_address)}</td>
            <td class="time-cell">${formatDateTime(post.posted_at_utc7)}</td>
            <td style="font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(post.user_agent)}">
                ${getUserAgentShort(post.user_agent)}
            </td>
            <td class="post-content-cell">${escapeHtml(post.content)}</td>
            <td class="actions-cell">
                <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Initialize activity chart
 */
function initializeChart() {
    const ctx = document.getElementById('activityChart');

    if (!ctx) return;

    // Destroy existing chart if any
    if (activityChart) {
        activityChart.destroy();
    }

    const dates = chartData.map(d => d.date);
    const posts = chartData.map(d => d.posts);
    const visitors = chartData.map(d => d.visitors);

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Posts',
                    data: posts,
                    borderColor: '#1d9bf0',
                    backgroundColor: 'rgba(29, 155, 240, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#1d9bf0',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Visitors',
                    data: visitors,
                    borderColor: '#00ba7c',
                    backgroundColor: 'rgba(0, 186, 124, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#00ba7c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e7e9ea',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(21, 32, 43, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e7e9ea',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#71767b',
                        font: {
                            size: 11
                        },
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#71767b',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Search posts
 */
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value;
    loadPosts(searchTerm);
}

/**
 * Clear search
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadPosts('');
}

/**
 * Toggle select all
 */
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll') || document.getElementById('selectAllHeader');
    const checkboxes = document.querySelectorAll('.post-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });

    updateSelection();
}

/**
 * Update selection count
 */
function updateSelection() {
    const checkboxes = document.querySelectorAll('.post-checkbox:checked');
    selectedPosts = Array.from(checkboxes).map(cb => parseInt(cb.value));

    document.getElementById('selectedCount').textContent = selectedPosts.length;
    document.getElementById('deleteSelectedBtn').disabled = selectedPosts.length === 0;

    // Update export button
    const exportSelectedCount = document.getElementById('exportSelectedCount');
    const exportSelectedBtn = document.getElementById('exportSelectedBtn');
    if (exportSelectedCount && exportSelectedBtn) {
        exportSelectedCount.textContent = selectedPosts.length;
        exportSelectedBtn.disabled = selectedPosts.length === 0;
    }

    // Update select all checkbox
    const allCheckboxes = document.querySelectorAll('.post-checkbox');
    const selectAllCheckbox = document.getElementById('selectAll');
    const selectAllHeaderCheckbox = document.getElementById('selectAllHeader');

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selectedPosts.length === allCheckboxes.length && allCheckboxes.length > 0;
    }
    if (selectAllHeaderCheckbox) {
        selectAllHeaderCheckbox.checked = selectedPosts.length === allCheckboxes.length && allCheckboxes.length > 0;
    }
}

/**
 * Delete single post
 */
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_post',
                post_id: postId
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Post deleted successfully', 'success');

            // Remove from DOM with animation
            const row = document.getElementById(`post-${postId}`);
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100px)';
                setTimeout(() => {
                    loadStats();
                    loadPosts(document.getElementById('searchInput')?.value || '');
                }, 300);
            }
        } else {
            showNotification(data.error || 'Failed to delete post', 'error');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showNotification('Network error', 'error');
    }
}

/**
 * Delete selected posts
 */
async function deleteSelected() {
    if (selectedPosts.length === 0) {
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedPosts.length} post(s)?`)) {
        return;
    }

    try {
        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete_multiple',
                post_ids: selectedPosts
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`${selectedPosts.length} post(s) deleted successfully`, 'success');
            selectedPosts = [];
            loadStats();
            loadPosts(document.getElementById('searchInput')?.value || '');
        } else {
            showNotification(data.error || 'Failed to delete posts', 'error');
        }
    } catch (error) {
        console.error('Delete failed:', error);
        showNotification('Network error', 'error');
    }
}

/**
 * Format datetime
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Get short user agent
 */
function getUserAgentShort(userAgent) {
    if (!userAgent) return 'Unknown';

    // Extract browser and OS
    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';

    return `${browser} / ${os}`;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export selected posts to XLSX
 */
async function exportSelected() {
    if (selectedPosts.length === 0) {
        return;
    }

    try {
        showNotification(`Preparing to export ${selectedPosts.length} post(s)...`, 'success');

        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'export_xlsx',
                post_ids: selectedPosts
            })
        });

        // Check if response is JSON (error) or file (success)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            showNotification(data.error || 'Export failed', 'error');
        } else {
            // Success - download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = formatDateForFilename();
            a.download = `venting_export_selected_${selectedPosts.length}_${dateStr}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showNotification(`Successfully exported ${selectedPosts.length} post(s)!`, 'success');
        }
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed', 'error');
    }
}

/**
 * Export all posts to XLSX
 */
async function exportAll() {
    if (!confirm('Export all posts to XLSX? This may take a while for large databases.')) {
        return;
    }

    try {
        showNotification('Preparing export... Please wait.', 'success');

        const response = await fetch(ADMIN_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'export_xlsx',
                post_ids: []
            })
        });

        // Check if response is JSON (error) or file (success)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            showNotification(data.error || 'Export failed', 'error');
        } else {
            // Success - download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = formatDateForFilename();
            a.download = `venting_export_all_${dateStr}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showNotification('Successfully exported all posts!', 'success');
        }
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed', 'error');
    }
}

/**
 * Format date for filename (DD_MM_YYYY_HH_MM)
 */
function formatDateForFilename() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}_${month}_${year}_${hours}_${minutes}`;
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
