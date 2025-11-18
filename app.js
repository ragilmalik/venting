/**
 * Venting Platform - Frontend Application
 * Handles posting, timeline, and auto-refresh functionality
 */

// Configuration
const CONFIG = {
    API_URL: '/api.php',
    MAX_LENGTH: 5000,
    POSTS_PER_PAGE: 100,
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    NOTIFICATION_DURATION: 4000
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
const postBtn = document.getElementById('postBtn');
const postsContainer = document.getElementById('postsContainer');
const loading = document.getElementById('loading');
const pagination = document.getElementById('pagination');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const notification = document.getElementById('notification');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadPosts(1);
    startAutoRefresh();
});

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Character counter
    postContent.addEventListener('input', updateCharCount);

    // Post button
    postBtn.addEventListener('click', createPost);

    // Enter key to post (Ctrl/Cmd + Enter)
    postContent.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            createPost();
        }
    });

    // Pagination
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            loadPosts(currentPage - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadPosts(currentPage + 1);
        }
    });

    // Visibility change - pause auto-refresh when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
            checkForNewPosts();
        }
    });
}

/**
 * Update character count
 */
function updateCharCount() {
    const length = postContent.value.length;
    charCount.textContent = length;

    if (length > CONFIG.MAX_LENGTH * 0.9) {
        charCount.style.color = 'var(--color-warning)';
    } else {
        charCount.style.color = '';
    }

    postBtn.disabled = length === 0 || length > CONFIG.MAX_LENGTH;
}

/**
 * Create a new post
 */
async function createPost() {
    const content = postContent.value.trim();

    if (!content) {
        showNotification('Please enter some content', 'error');
        return;
    }

    if (content.length > CONFIG.MAX_LENGTH) {
        showNotification(`Content exceeds maximum length of ${CONFIG.MAX_LENGTH} characters`, 'error');
        return;
    }

    // Disable button while posting
    postBtn.disabled = true;
    postBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> Posting...';

    try {
        // Get current timestamp and timezone
        const now = new Date();
        const postedAt = formatDateForMySQL(now);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create',
                content: content,
                posted_at: postedAt,
                timezone: timezone
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Post created successfully!', 'success');
            postContent.value = '';
            updateCharCount();

            // Reload first page
            loadPosts(1);
        } else {
            showNotification(data.error || 'Failed to create post', 'error');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        // Re-enable button
        postBtn.disabled = false;
        postBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Post
        `;
    }
}

/**
 * Load posts for a given page
 */
async function loadPosts(page) {
    if (isLoading) return;

    isLoading = true;
    currentPage = page;

    // Show loading
    loading.style.display = 'flex';
    postsContainer.innerHTML = '';
    pagination.style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const response = await fetch(`${CONFIG.API_URL}?page=${page}`);
        const data = await response.json();

        if (data.success) {
            lastFetchTime = new Date().toISOString();
            displayPosts(data.posts);
            updatePagination(data.pagination);
        } else {
            showNotification(data.error || 'Failed to load posts', 'error');
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showNotification('Network error. Please try again.', 'error');
        showEmptyState();
    } finally {
        loading.style.display = 'none';
        isLoading = false;
    }
}

/**
 * Display posts in the timeline
 */
function displayPosts(posts) {
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
        showEmptyState();
        return;
    }

    posts.forEach((post, index) => {
        const postElement = createPostElement(post, index);
        postsContainer.appendChild(postElement);
    });
}

/**
 * Create a post element
 */
function createPostElement(post, index) {
    const article = document.createElement('article');
    article.className = 'post-card glass-panel';
    article.style.animationDelay = `${index * 0.05}s`;

    // Generate random avatar color based on post ID
    const avatarColor = generateAvatarColor(post.id);
    const avatarInitial = 'A'; // Anonymous

    // Format time
    const timeAgo = getTimeAgo(new Date(post.posted_at));

    article.innerHTML = `
        <div class="post-header">
            <div class="post-avatar" style="background: ${avatarColor};">
                ${avatarInitial}
            </div>
            <div class="post-meta">
                <div class="post-author">Anonymous</div>
                <div class="post-time" title="${formatDateTime(post.posted_at)}">${timeAgo}</div>
            </div>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
    `;

    return article;
}

/**
 * Show empty state
 */
function showEmptyState() {
    postsContainer.innerHTML = `
        <div class="empty-state glass-panel">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none">
                <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.9706 16.9706 21 12 21C10.3001 21 8.70487 20.4722 7.37099 19.5616C7.14205 19.3975 7.02759 19.3154 6.9171 19.2804C6.80933 19.2461 6.73312 19.2393 6.61835 19.2468C6.50106 19.2545 6.37439 19.293 6.12106 19.37L3.16194 20.276C2.67326 20.4281 2.42893 20.5041 2.26499 20.4305C2.1213 20.3667 2.01546 20.2413 1.9758 20.0879C1.93052 19.9125 2.04504 19.6482 2.27407 19.1196L3.39778 16.3888C3.46313 16.2384 3.4958 16.1632 3.50907 16.0921C3.52159 16.0256 3.51951 15.9708 3.50135 15.9058C3.48202 15.8358 3.43686 15.7583 3.34655 15.6033C2.47064 14.2331 2 12.6735 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>No posts yet</h3>
            <p>Be the first to share your thoughts!</p>
        </div>
    `;
}

/**
 * Update pagination controls
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
 * Check for new posts (auto-refresh)
 */
async function checkForNewPosts() {
    if (currentPage !== 1 || !lastFetchTime) return;

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'latest',
                since: lastFetchTime
            })
        });

        const data = await response.json();

        if (data.success && data.count > 0) {
            // Reload page 1 to show new posts
            loadPosts(1);
        }
    } catch (error) {
        console.error('Error checking for new posts:', error);
    }
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(checkForNewPosts, CONFIG.AUTO_REFRESH_INTERVAL);
}

/**
 * Stop auto-refresh timer
 */
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
 * Generate avatar color based on ID
 */
function generateAvatarColor(id) {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
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
 * Format date time for display
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);

        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }

    return 'just now';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
