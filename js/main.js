// Universal Blog Theme - Main JavaScript
// Handles dynamic content loading from JSON data

class BlogTheme {
    constructor() {
        this.posts = [];
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
            this.handlePageLoad();
        } catch (error) {
            console.error('Error initializing blog theme:', error);
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('../data/posts.json');
            const data = await response.json();
            this.posts = data.posts || [];
        } catch (error) {
            console.error('Error loading posts:', error);
            // Fallback to empty array
            this.posts = [];
        }
    }

    handlePageLoad() {
        const path = window.location.pathname;
        
        if (path.includes('post.html')) {
            this.loadSinglePost();
        } else {
            this.loadPostsGrid();
        }
    }

    loadPostsGrid() {
        const container = document.getElementById('posts-container');
        if (!container || this.posts.length === 0) return;

        const postsHTML = this.posts.map(post => this.createPostCard(post)).join('');
        container.innerHTML = postsHTML;
    }

    createPostCard(post) {
        return `
            <a href="post.html?slug=${post.slug}" class="post-card">
                <img src="${post.image}" alt="${post.title}" class="post-card-image" loading="lazy">
                <div class="post-card-content">
                    <h3 class="post-card-title">${post.title}</h3>
                    <p class="post-card-excerpt">${post.excerpt}</p>
                    <div class="post-card-meta">
                        <span class="post-date">${this.formatDate(post.date)}</span>
                        <span class="post-card-category">${post.category}</span>
                    </div>
                </div>
            </a>
        `;
    }

    async loadSinglePost() {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
            this.showPostNotFound();
            return;
        }

        const post = this.posts.find(p => p.slug === slug);
        if (!post) {
            this.showPostNotFound();
            return;
        }

        this.updatePageMetadata(post);
        this.renderSinglePost(post);
    }

    renderSinglePost(post) {
        const contentElement = document.getElementById('single-post-content');
        if (!contentElement) return;

        // Build content HTML
        let contentHTML = '';
        
        // Add featured image
        contentHTML += `<img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">`;
        
        // Add title
        contentHTML += `<h1 class="post-title">${post.title}</h1>`;
        
        // Add meta information
        contentHTML += `
            <div class="post-meta">
                <span class="post-date">📅 ${this.formatDate(post.date)}</span>
                <span class="post-category">🏷️ ${post.category}</span>
            </div>
        `;
        
        // Add mid-content ad placeholder
        contentHTML += `
            <div class="ad-content">
                <div class="ad-label">Advertisement</div>
                <!-- AdSense code will go here -->
            </div>
        `;

        // Add post content
        if (post.content && post.content.paragraphs) {
            post.content.paragraphs.forEach(paragraph => {
                if (paragraph.type === 'ingredient' && post.content.ingredients) {
                    // Handle ingredients list
                    contentHTML += '<h3>Ingredients:</h3><ul>';
                    post.content.ingredients.forEach(ingredient => {
                        contentHTML += `<li>${ingredient}</li>`;
                    });
                    contentHTML += '</ul>';
                } else if (paragraph.type === 'step' && post.content.steps) {
                    // Handle steps list
                    contentHTML += '<h3>Steps:</h3><ol>';
                    post.content.steps.forEach(step => {
                        contentHTML += `<li>${step}</li>`;
                    });
                    contentHTML += '</ol>';
                } else {
                    // Handle regular paragraph
                    contentHTML += `<p>${paragraph}</p>`;
                }
            });
        }

        // Add end of content ad placeholder
        contentHTML += `
            <div class="ad-content">
                <div class="ad-label">Advertisement</div>
                <!-- AdSense code will go here -->
            </div>
        `;

        contentElement.innerHTML = contentHTML;

        // Update schema markup
        this.updateSchemaMarkup(post);
    }

    updatePageMetadata(post) {
        // Update title
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            titleElement.textContent = post.title;
        }

        // Update description
        const descElement = document.getElementById('page-description');
        if (descElement) {
            descElement.content = post.excerpt;
        }

        // Update canonical URL
        const canonicalElement = document.querySelector('link[rel="canonical"]');
        if (!canonicalElement) {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = window.location.href;
            document.head.appendChild(link);
        } else {
            canonicalElement.href = window.location.href;
        }
    }

    updateSchemaMarkup(post) {
        const schemaElement = document.getElementById('schema-data');
        if (schemaElement) {
            const schema = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "datePublished": post.date,
                "dateModified": post.date,
                "author": {
                    "@type": "Person",
                    "name": "Author Name"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Universal Blog",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "/images/logo.png"
                    }
                },
                "image": post.image,
                "url": window.location.href
            };
            schemaElement.innerHTML = JSON.stringify(schema);
        }
    }

    showPostNotFound() {
        const contentElement = document.getElementById('single-post-content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="text-center">
                    <h2>Post Not Found</h2>
                    <p>The requested post could not be found.</p>
                    <a href="index.html">← Back to Home</a>
                </div>
            `;
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize the blog theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogTheme();
});