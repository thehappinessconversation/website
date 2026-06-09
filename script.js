/* Makes Timeline */
async function loadTimeline() {
    try {
        const response = await fetch('timeline.json');
        const data = await response.json();
        const container = document.querySelector('.timeline-container');

        data.timeline.forEach((item, index) => {
            const isEven = index % 2 === 0;
            const textClass = isEven ? 'timeline-text-right' : 'timeline-text-left';
            const picClass = isEven ? 'timeline-picture-left' : 'timeline-picture-right';

            const stationHTML = `
                <div class="timeline-station">
                    <div class="timeline-dot reveal-dot">
                        <i class="bi bi-circle"></i>
                    </div>
                    <div class="${picClass} reveal-box">
                        <img class="images" id="img-${item.id}" src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="${textClass} reveal-box"
                        page-title="${item.title}"
                        page-date="${item.date}"
                        page-fulltext="${item.fullStory}"
                        page-style="${item.modalStyle || ''}" onclick="openPage(this, 'img-${item.id}')">
                        <p class="timeline-text-title">${item.title}</p>
                        <p class="timeline-date">${item.date}</p>
                        <p class="timeline-paragraph">${item.preview}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', stationHTML);
        });

        // Start watching for scroll animations ONLY after items are created
        initObserver(); 

        // Grows the line as needed
        const fill = document.querySelector('.scroll-line-fill');
        const track = document.querySelector('.scroll-line-track');

        window.addEventListener('scroll', () => {
            const rect = track.getBoundingClientRect();

            // 1. We look exclusively at exactly how far down the user has scrolled
            const scrollDistance = window.scrollY;

            // 2. Because scrollDistance is 0 when the page loads, the percent is exactly 0%
            // The line will grow perfectly at a 1:1 ratio as the user scrolls down!
            const percent = Math.min(Math.max((scrollDistance / rect.height) * 100, 0), 100);

            fill.style.height = percent + '%';
        });

    } catch (error) {
        console.error("Error loading timeline JSON:", error);
    }
}

/* Helper function that links urls */
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

/* Animation Watcher Function */
function initObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
            }
        });
    }, {
        threshold: 0,
        rootMargin: "0% 0px -30% 0px"
    });

    document.querySelectorAll(".reveal-box, .reveal-dot").forEach(el => {
        observer.observe(el);
    });
}

/* Open Box Page */
function openPage(element, imageId) {
    const modal = document.getElementById("notion-modal");
    const bucket = document.getElementById("modal-body-text");
    const image = document.getElementById(imageId);
    
    // Grab the custom styles we attached to the tile
    const customStyle = element.getAttribute("page-style");
    
    bucket.innerHTML = `
        <div class="modal-banner-wrapper">
            <img src="${image ? image.src : ''}" class="modal-banner" style="${customStyle}">
        </div>
        
        <div class="modal-body">
            <p class="timeline-text-title">${element.getAttribute("page-title")}</p>
            <p class="timeline-date">${element.getAttribute("page-date")}</p>
            <p class="timeline-paragraph">${linkify(element.getAttribute("page-fulltext"))}</p>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

/* Close Box Page */
function closePage() {
    document.getElementById("notion-modal").style.display = "none";
    document.body.style.overflow = "auto";
}

// Close when clicking outside
window.onclick = function(event) {
    if (event.target == document.getElementById("notion-modal")) closePage();
}

async function loadDashboard() {
    try {
        const response = await fetch('timeline.json');
        const data = await response.json();
        const gridContainer = document.getElementById('live-projects-row');
        
        // Ensure data is clearing out older states on initialization refreshes
        gridContainer.innerHTML = '';

        data.dashboard.forEach(project => {
            // Animate circles when dashboard scrolls into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Find all rings inside this visible container and set their dasharray
                        const rings = entry.target.querySelectorAll('.animate-ring');
                        rings.forEach(ring => {
                            const progress = ring.getAttribute('data-progress');
                            ring.style.strokeDasharray = `${progress}, 100`;
                        });
                        // Stop observing once animated so it doesn't stutter if they scroll up/down
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 }); // Trigger sooner (at 10% visibility) so it starts before they stop scrolling

            observer.observe(gridContainer);
            // Inside your loadDashboard loop in script.js:
            const projectHTML = `
                <div class="project-card">
                    <p class="project-name" style="color: ${project.color}">${project.name}</p>
                    
                    <div class="circular-progress-container">
                        <svg class="circular-chart" viewBox="0 0 36 36">
                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="circle-fill animate-ring"
                                style="stroke: ${project.color}; stroke-dasharray: 0, 100;" 
                                data-progress="${project.progress}"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="percentage-text" style="color: ${project.color}">${project.progress}%</div>
                    </div>
                    
                    <p class="project-update">${project.recentUpdate}</p>
                </div>
            `;
            gridContainer.insertAdjacentHTML('beforeend', projectHTML);
            });
    } catch (error) {
        console.error("Error generating dashboard layout elements:", error);
    }
}

// Start the whole process
loadTimeline();
loadDashboard();