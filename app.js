/**
 * Venting Platform - Frontend Application
 * Twitter/X style anonymous posting
 */

// Configuration
const CONFIG = {
    API_URL: '/api.php',
    MAX_LENGTH: 5000,
    POSTS_PER_PAGE: 100,
    AUTO_REFRESH_INTERVAL: 30000,
    NOTIFICATION_DURATION: 3000
};

// State
let currentPage = 1;
let totalPages = 1;
let lastFetchTime = null;
let autoRefreshTimer = null;
let isLoading = false;

// DOM Elements
const postContent = document.getElementById('postContent');
const charCount = document.getElementById('charCount');
const progressCircle = document.getElementById('progressCircle');
const postBtn = document.getElementById('postBtn');
const postsContainer = document.getElementById('postsContainer');
const loading = document.getElementById('loading');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const notification = document.getElementById('notification');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPosts(1);
    startAutoRefresh();
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    postContent.addEventListener('input', updateCharCount);
    postBtn.addEventListener('click', createPost);

    postContent.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            createPost();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) loadPosts(currentPage - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) loadPosts(currentPage + 1);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
            checkForNewPosts();
        }
    });

    // Auto-grow textarea
    postContent.addEventListener('input', () => {
        postContent.style.height = 'auto';
        postContent.style.height = Math.min(postContent.scrollHeight, 400) + 'px';
    });
}

/**
 * Update character count and progress circle
 */
function updateCharCount() {
    const length = postContent.value.length;
    const percentage = length / CONFIG.MAX_LENGTH;
    const circumference = 56.5;

    // Update circle
    if (length > 0) {
        const offset = circumference - (percentage * circumference);
        progressCircle.style.strokeDashoffset = offset;

        if (percentage > 1) {
            progressCircle.style.stroke = '#f4212e';
            charCount.textContent = length - CONFIG.MAX_LENGTH;
            charCount.className = 'count-text error';
        } else if (percentage > 0.9) {
            progressCircle.style.stroke = '#ffd400';
            charCount.textContent = CONFIG.MAX_LENGTH - length;
            charCount.className = 'count-text warning';
        } else {
            progressCircle.style.stroke = '#1d9bf0';
            charCount.textContent = '';
            charCount.className = 'count-text';
        }
    } else {
        progressCircle.style.strokeDashoffset = circumference;
        charCount.textContent = '';
        charCount.className = 'count-text';
    }

    postBtn.disabled = length === 0 || length > CONFIG.MAX_LENGTH;
}

/**
 * Create a new post
 */
async function createPost() {
    const content = postContent.value.trim();

    if (!content || content.length > CONFIG.MAX_LENGTH) return;

    postBtn.disabled = true;
    postBtn.textContent = 'Posting...';

    try {
        const now = new Date();
        const postedAt = formatDateForMySQL(now);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                content: content,
                posted_at: postedAt,
                timezone: timezone
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Posted!');
            postContent.value = '';
            postContent.style.height = 'auto';
            updateCharCount();
            loadPosts(1);
        } else {
            showNotification(data.error || 'Failed to post', 'error');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        showNotification('Network error', 'error');
    } finally {
        postBtn.disabled = false;
        postBtn.textContent = 'Post';
    }
}

/**
 * Load posts
 */
async function loadPosts(page) {
    if (isLoading) return;

    isLoading = true;
    currentPage = page;

    loading.style.display = 'flex';
    postsContainer.innerHTML = '';
    postsContainer.appendChild(loading);
    pagination.style.display = 'none';

    try {
        const response = await fetch(`${CONFIG.API_URL}?page=${page}`);
        const data = await response.json();

        if (data.success) {
            lastFetchTime = new Date().toISOString();
            displayPosts(data.posts);
            updatePagination(data.pagination);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showEmptyState();
    } finally {
        loading.style.display = 'none';
        isLoading = false;
    }
}

/**
 * Display posts
 */
function displayPosts(posts) {
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        showEmptyState();
        return;
    }

    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

/**
 * Create post element
 */
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';

    const avatarColor = generateAvatarColor(post.id);
    const timeAgo = getTimeAgo(new Date(post.posted_at));

    article.innerHTML = `
        <div class="post-avatar">
            <div class="avatar" style="background: ${avatarColor};">A</div>
        </div>
        <div class="post-body">
            <div class="post-header">
                <span class="post-author">Anonymous</span>
                <span class="post-username">@anon</span>
                <span class="post-separator">·</span>
                <span class="post-time" title="${formatDateTime(post.posted_at)}">${timeAgo}</span>
            </div>
            <div class="post-content">${escapeHtml(post.content)}</div>
        </div>
    `;

    return article;
}

/**
 * Show empty state
 */
function showEmptyState() {
    postsContainer.innerHTML = `
        <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.63-1.28l-4.08 1.36 1.36-4.08A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"/>
            </svg>
            <h3>Nothing to see here — yet</h3>
            <p>When someone posts, it'll show up here.</p>
        </div>
    `;
}

/**
 * Update pagination
 */
function updatePagination(paginationData) {
    currentPage = paginationData.current_page;
    totalPages = paginationData.total_pages;

    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    pagination.style.display = totalPages > 1 ? 'flex' : 'none';
}

/**
 * Check for new posts
 */
async function checkForNewPosts() {
    if (currentPage !== 1 || !lastFetchTime) return;

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'latest',
                since: lastFetchTime
            })
        });

        const data = await response.json();

        if (data.success && data.count > 0) {
            loadPosts(1);
        }
    } catch (error) {
        console.error('Error checking for new posts:', error);
    }
}

/**
 * Auto-refresh
 */
function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(checkForNewPosts, CONFIG.AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, CONFIG.NOTIFICATION_DURATION);
}

/**
 * Generate avatar color
 */
function generateAvatarColor(id) {
    const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)',
        'linear-gradient(135deg, #30cfd0, #330867)',
        'linear-gradient(135deg, #a8edea, #fed6e3)',
        'linear-gradient(135deg, #ff9a56, #ff6a88)',
    ];
    return colors[id % colors.length];
}

/**
 * Format date for MySQL
 */
function formatDateForMySQL(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Format date time
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get time ago
 */
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
