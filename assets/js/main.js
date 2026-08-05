/**
 * AfricanEye - Main JS module managing header scroll, interactive modals,
 * button ripple effects, intersection observers, and launching the particles.
 */

import { ParticleSystem } from './particles.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles Background
    const particles = new ParticleSystem('particle-canvas');
    if (particles.canvas) {
        particles.animate();
    }

    // 2. Navigation Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Navigation Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', !isExpanded);
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.classList.remove('active');
                mainNav.classList.remove('active');

                // Set active link class
                navLinks.forEach(nl => nl.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // 4. Smooth Fade-in Sections using IntersectionObserver
    const fadeSections = document.querySelectorAll('.fade-in');
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    fadeSections.forEach(section => {
        observer.observe(section);
    });

    // 5. Button Ripple Effects
    const rippleButtons = document.querySelectorAll('.ripple');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });

    // 6. Modal Window Overlay Controller
    const modals = {
        search: document.getElementById('search-modal'),
        signin: document.getElementById('signin-modal'),
        launch: document.getElementById('launch-modal'),
        general: document.getElementById('general-modal')
    };

    const triggers = {
        search: document.querySelectorAll('.search-trigger'),
        signin: document.querySelectorAll('.sign-in-trigger'),
        launch: document.querySelectorAll('.launch-trigger')
    };

    // Modal Opening Functions
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling

        // Auto-focus on input inside modal if any
        const input = modal.querySelector('input');
        if (input) {
            setTimeout(() => input.focus(), 150);
        }
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');

        // Only allow background scrolling if no other modals are active
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        if (activeModals.length === 0) {
            document.body.style.overflow = '';
        }
    }

    // Bind basic triggers
    Object.keys(triggers).forEach(key => {
        triggers[key].forEach(trigger => {
            trigger.addEventListener('click', () => openModal(modals[key]));
        });
    });

    // Bind closing clicks (close button or clicking background overlay)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                closeModal(modal);
            }
        });
    });

    // ESC key closes active modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });

    // 7. Simulated launch platform progress states
    const launchTriggerBtns = document.querySelectorAll('.launch-trigger');
    const launchLoader = document.querySelector('.launch-loader');
    const launchSuccess = document.querySelector('.launch-success-message');
    const loadingStepText = document.getElementById('step-text');

    launchTriggerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset modal states
            if (launchLoader && launchSuccess) {
                launchLoader.classList.remove('hidden');
                launchSuccess.classList.add('hidden');
            }

            const steps = [
                'Initializing security sandbox...',
                'Establishing encrypted handshake with mainframes...',
                'Spinning up localized African natural language models...',
                'Finalizing clearance credential handshake...',
                'Authorized.'
            ];

            let stepIndex = 0;
            if (loadingStepText) {
                loadingStepText.textContent = steps[0];
            }

            const interval = setInterval(() => {
                stepIndex++;
                if (stepIndex < steps.length) {
                    if (loadingStepText) {
                        loadingStepText.textContent = steps[stepIndex];
                    }
                } else {
                    clearInterval(interval);
                    // Show premium success screen
                    if (launchLoader && launchSuccess) {
                        launchLoader.classList.add('hidden');
                        launchSuccess.classList.remove('hidden');
                    }
                }
            }, 750);
        });
    });

    // 8. Conversational Search Mocking (Perplexity Style)
    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit');
    const searchResults = document.querySelector('.search-results-placeholder');
    const suggestButtons = document.querySelectorAll('.suggest-btn');

    function performSearch(query) {
        if (!query.trim() || !searchResults) return;

        searchResults.innerHTML = `
            <div class="pulse-indicator">
                <span class="pulse-ring"></span>
                <span>Directing search to core AI nodes for "${query}"...</span>
            </div>
        `;

        setTimeout(() => {
            searchResults.innerHTML = `
                <div class="search-result-container" style="text-align: left; animation: fade-scale-in 0.4s ease forwards;">
                    <h4 style="color: var(--gold-accent); margin-bottom: 8px; font-family: var(--font-serif);"><i class="fa-solid fa-circle-check"></i> Synthesis Complete</h4>
                    <p style="font-size: 0.9rem; line-height: 1.6; color: var(--white); margin-bottom: 12px;">
                        Intelligence nodes compiled 14 ground-truth vector layers across the database matching "${query}". Sub-national analytics demonstrate stable infrastructure indices in the regional corridor.
                    </p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 4px; color: var(--text-secondary);"><i class="fa-solid fa-server"></i> Node 4-SA</span>
                        <span style="font-size: 0.75rem; background: rgba(0,200,150,0.06); border: 1px solid rgba(0,200,150,0.2); padding: 4px 10px; border-radius: 4px; color: var(--success-accent);"><i class="fa-solid fa-shield-halved"></i> Verified Source</span>
                    </div>
                </div>
            `;
        }, 1500);
    }

    if (searchSubmit && searchInput) {
        searchSubmit.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch(searchInput.value);
        });
    }

    suggestButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = btn.textContent;
                performSearch(btn.textContent);
            }
        });
    });

    // 9. General Modal Content Injector (Privacy, Terms, API, Contact)
    const modalLinks = document.querySelectorAll('.modal-link');
    const generalModal = modals.general;
    const generalTitle = document.getElementById('general-modal-title');
    const generalContent = document.getElementById('general-modal-content');

    const generalModalData = {
        api: {
            title: 'API Reference Access',
            content: `
                <p style="margin-bottom: 16px;">The AfricanEye API provides programmatic access to verified Pan-African geopolitical telemetry, live news feeds, and sub-national security tracking modules.</p>
                <p style="font-size: 0.85rem; color: var(--gold-accent); font-family: monospace; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 4px; border: 1px solid rgba(212,175,55,0.2); margin-bottom: 16px;">GET /v1/intelligence/telemetry</p>
                <p style="margin-bottom: 12px;">Authentication is restricted to vetted security and investment keys only. To apply for developer clearance credentials, please coordinate with support services.</p>
            `
        },
        contact: {
            title: 'Coordinate Support Services',
            content: `
                <p style="margin-bottom: 16px;">For intelligence requests, diplomatic coordination, or investment briefing requests, please use the secure secure endpoint below or mail us directly.</p>
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 16px; border-radius: 4px; margin-bottom: 16px;">
                    <p style="font-size: 0.9rem; color: var(--white); font-weight: 600;">Secure Office Address</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">AfricanEye Technologies, Sandton Tower Floor 22, Johannesburg, South Africa</p>
                </div>
                <p style="font-size: 0.9rem;">Direct Telemetry Secure Link: <strong style="color: var(--gold-accent);">clearance@africaneye.ai</strong></p>
            `
        },
        privacy: {
            title: 'Privacy and Strategy Security Protocol',
            content: `
                <p style="margin-bottom: 12px;">AfricanEye observes state-of-the-art privacy mechanisms, completely sandboxing all regional query caches to guarantee full immunity from espionage models.</p>
                <p style="margin-bottom: 12px;">Telemetry vector search queries are encrypted using military-grade zero-knowledge proof frameworks. No third-party networks retain user session data.</p>
                <p>By engaging with AfricanEye, you agree to comply with pan-continental non-proliferation and data security statutes.</p>
            `
        },
        terms: {
            title: 'Standard Terms of Clearance',
            content: `
                <p style="margin-bottom: 12px;">All assets generated on or distributed through AfricanEye represent protected intellectual capital. Redistribution of strategic forecasts is strictly prohibited without validated licensing agreements.</p>
                <p style="margin-bottom: 12px;">Any algorithmic spoofing or malicious ingestion queries targeted at our machine learning modules will result in immediate API clearance suspension and legal notification to relevant security agencies.</p>
            `
        }
    };

    modalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const modalKey = link.getAttribute('data-modal');
            const data = generalModalData[modalKey];

            if (data && generalTitle && generalContent && generalModal) {
                generalTitle.textContent = data.title;
                generalContent.innerHTML = data.content;
                openModal(generalModal);
            }
        });
    });

    // 10. Automatically set current year in the footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
