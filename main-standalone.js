document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initScrollAnimations();


    // Page Routing Logic
    const path = window.location.pathname;

    // Normalize path (handle trailing slashes or index.html)
    if (path === '/' || path.includes('index.html')) {
        renderProjectGrid('featured-work-grid', 2); // Show only 2 items on home
    } else if (path.includes('work.html')) {
        renderProjectGrid('full-work-grid'); // Show all items
    } else if (path.includes('project.html')) {
        loadProjectDetail();
    }
});

// --- Feature: Render Project Grid ---
function renderProjectGrid(elementId, limit = null) {
    const grid = document.getElementById(elementId);
    if (!grid) return;

    let displayProjects = projects;
    if (limit) {
        displayProjects = projects.slice(0, limit);
    }

    grid.innerHTML = displayProjects.map(project => {
        const firstImage = project.images && project.images.length > 0 ? project.images[0] : null;
        const imageSrc = typeof firstImage === 'string' ? firstImage : (firstImage?.type === 'image' ? firstImage.src : null);

        const imageHtml = (imageSrc && !imageSrc.startsWith('placeholder'))
            ? `<img src="${imageSrc}" alt="${project.title}" class="project-img">`
            : `<div class="placeholder-project">${project.title}</div>`;

        return `
        <a href="project.html?id=${project.id}" class="project-card">
            <div class="card-image">
                ${imageHtml}
            </div>
            <div class="card-info">
                <h3>${project.title}</h3>
                <p>${project.category}</p>
            </div>
        </a>
    `}).join('');
}

// --- Feature: Load Project Detail ---
function loadProjectDetail() {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const container = document.getElementById('project-content');

    if (!projectId || !container) return;

    const project = projects.find(p => p.id === projectId);

    if (!project) {
        container.innerHTML = '<h1>Project not found</h1>';
        return;
    }

    // Generate Gallery HTML (always skip the first image as it's the hero)
    const galleryHtml = project.images.slice(1).map((item, index) => {
        const actualIndex = index + 2;
        if (typeof item === 'string') {
            return `<img src="${item}" alt="Project Image ${actualIndex}" class="gallery-image">`;
        } else if (item.type === 'image') {
            return `<img src="${item.src}" alt="Project Image ${actualIndex}" class="gallery-image">`;
        } else if (item.type === 'text') {
            return `
                <div class="gallery-text-block" style="padding: 4rem 0; max-width: 800px; margin: 0 auto; text-align: center;">
                    <p style="font-size: 1.5rem; line-height: 1.6; color: var(--text-main); font-family: var(--font-body); opacity: 0.9;">${item.content}</p>
                </div>
            `;
        }
    }).join('');

    // Handle content array (for videos and other media)
    const contentHtml = project.content ? project.content.map((item) => {
            if (item.type === 'video') {
            const autoplayAttr = item.autoplay ? 'autoplay' : '';
            return `
                <div style="margin-bottom: 3rem;">
                    <video ${autoplayAttr} controls muted loop style="width: 100%; border-radius: 12px; display: block;">
                        <source src="${item.src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    ${item.caption ? `<p style="margin-top: 1rem; text-align: center; font-size: 1rem; color: var(--text-main); opacity: 0.9;">${item.caption}</p>` : ''}
                </div>
            `;
        } else if (item.type === 'image') {
            return `<img src="${item.src}" alt="Content Image" class="gallery-image">`;
        } else if (item.type === 'text') {
            return `
                <div class="gallery-text-block" style="padding: 4rem 0; max-width: 800px; margin: 0 auto; text-align: center;">
                    <p style="font-size: 1.5rem; line-height: 1.6; color: var(--text-main); font-family: var(--font-body); opacity: 0.9;">${item.content}</p>
                </div>
            `;
        }
        return '';
    }).join('') : '';

    container.innerHTML = `
        <div class="container">
            <header class="project-header">
                <h1>${project.title}</h1>
                <div class="project-meta">
                    <span>${project.category}</span>
                    <span>${project.year}</span>
                    <span>${project.role}</span>
                </div>
                ${project.projectLink ? `
                    <div style="margin-top: 2.5rem;">
                        <a href="${project.projectLink}" target="_blank" class="btn-gradient">View the whole project</a>
                    </div>
                ` : ''}
            </header>

            <div class="project-hero-image" style="background: none; height: auto;">
                ${(project.images && project.images.length > 0) ?
            `<img src="${typeof project.images[0] === 'string' ? project.images[0] : project.images[0].src}" 
                          alt="${project.title} Hero" 
                          style="width: 100%; border-radius: 12px; display: block;">`
            : `Main Hero Image for ${project.title}`}
            </div>

            <div class="project-description">
                <p>${project.description}</p>
                <br>
                <p>${project.fullDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'}</p>
            </div>

            ${project.embed ? `
                <div class="project-embed" style="margin-bottom: 4rem; border-radius: 12px; overflow: hidden; background: #111;">
                    ${project.embed}
                </div>
            ` : ''}

            ${contentHtml ? `
                <div class="project-content">
                    ${contentHtml}
                </div>
            ` : ''}

            <div class="project-gallery">
                ${galleryHtml}
            </div>

            <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <a href="work.html" class="btn-gradient">Back to all projects</a>
            </div>
        </div>
    `;
}

// --- Feature: Custom Cursor ---
function initCursor() {
    const cursor = document.getElementById('cursor-follower');
    if (cursor) {
        Object.assign(cursor.style, {
            position: 'fixed',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'white',
            mixBlendMode: 'difference',
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'transform 0.1s ease',
            left: '0',
            top: '0',
            transform: 'translate(-50%, -50%)',
            display: 'none'
        });

        document.addEventListener('mousemove', (e) => {
            cursor.style.display = 'block';
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        // Add hover effect for links (using event delegation for dynamic content)
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest('a') || e.target.closest('.project-card')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            } else {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    }
}

// --- Feature: Scroll Animations ---
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Use a timeout to ensure dynamic content is loaded first (simple approach)
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.project-card, .about-content, .section-header, .project-header');

        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            // Stagger slightly
            setTimeout(() => {
                observer.observe(el);
            }, index * 100);
        });
    }, 100);
}
