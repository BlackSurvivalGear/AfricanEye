/**
 * AfricanEye - Main JS module managing header scroll, interactive modals,
 * button ripple effects, intersection observers, and platform launch.
 */

import { ParticleSystem } from './particles.js';

document.addEventListener('DOMContentLoaded', () => {
    const particles = new ParticleSystem('particle-canvas');
    if (particles.canvas) particles.animate();

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 50));

    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav = document.getElementById('main-nav');
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!expanded));
            mobileToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => {
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
            link.classList.add('active');
        }));
    }

    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in').forEach(section => observer.observe(section));

    document.querySelectorAll('.ripple').forEach(btn => btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }));

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

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const input = modal.querySelector('input');
        if (input) setTimeout(() => input.focus(), 150);
    }
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        if (!document.querySelector('.modal-overlay.active')) document.body.style.overflow = '';
    }

    Object.keys(triggers).forEach(key => triggers[key].forEach(trigger => trigger.addEventListener('click', () => openModal(modals[key]))));
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.addEventListener('click', e => {
        if (e.target === modal || e.target.classList.contains('modal-close')) closeModal(modal);
    }));
    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    });

    // Launch now opens the AfricanEye Intelligence frontend hosted inside this repository.
    const launchTriggerBtns = document.querySelectorAll('.launch-trigger');
    const launchLoader = document.querySelector('.launch-loader');
    const launchSuccess = document.querySelector('.launch-success-message');
    const loadingStepText = document.getElementById('step-text');
    launchTriggerBtns.forEach(btn => btn.addEventListener('click', () => {
        if (launchLoader && launchSuccess) {
            launchLoader.classList.remove('hidden');
            launchSuccess.classList.add('hidden');
        }
        const steps = [
            'Initializing AfricanEye Intelligence interface...',
            'Loading local frontend assets...',
            'Loading geospatial intelligence workspace...',
            'Finalizing AfricanEye workspace...',
            'Authorized.'
        ];
        let stepIndex = 0;
        if (loadingStepText) loadingStepText.textContent = steps[0];
        const interval = setInterval(() => {
            stepIndex++;
            if (stepIndex < steps.length) {
                if (loadingStepText) loadingStepText.textContent = steps[stepIndex];
            } else {
                clearInterval(interval);
                if (launchLoader && launchSuccess) {
                    launchLoader.classList.add('hidden');
                    launchSuccess.classList.remove('hidden');
                }
                setTimeout(() => { window.location.href = 'africaneye-osint.html'; }, 700);
            }
        }, 500);
    }));

    const searchInput = document.querySelector('.search-input');
    const searchSubmit = document.querySelector('.search-submit');
    const searchResults = document.querySelector('.search-results-placeholder');
    const suggestButtons = document.querySelectorAll('.suggest-btn');
    function performSearch(query) {
        if (!query.trim() || !searchResults) return;
        searchResults.innerHTML = `<div class="pulse-indicator"><span class="pulse-ring"></span><span>Directing search to core AI nodes for "${query}"...</span></div>`;
        setTimeout(() => {
            searchResults.innerHTML = `<div class="search-result-container" style="text-align:left;animation:fade-scale-in .4s ease forwards"><h4 style="color:var(--gold-accent);margin-bottom:8px;font-family:var(--font-serif)"><i class="fa-solid fa-circle-check"></i> Synthesis Complete</h4><p style="font-size:.9rem;line-height:1.6;color:var(--white);margin-bottom:12px">AfricanEye intelligence nodes compiled available vector layers matching "${query}".</p><div style="display:flex;gap:8px;flex-wrap:wrap"><span style="font-size:.75rem;background:rgba(255,255,255,.04);border:1px solid var(--border-color);padding:4px 10px;border-radius:4px;color:var(--text-secondary)"><i class="fa-solid fa-server"></i> Intelligence Node</span><span style="font-size:.75rem;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.2);padding:4px 10px;border-radius:4px;color:var(--success-accent)"><i class="fa-solid fa-shield-halved"></i> Verified Source</span></div></div>`;
        }, 900);
    }
    if (searchSubmit && searchInput) {
        searchSubmit.addEventListener('click', () => performSearch(searchInput.value));
        searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(searchInput.value); });
    }
    suggestButtons.forEach(btn => btn.addEventListener('click', () => { if (searchInput) { searchInput.value = btn.textContent; performSearch(btn.textContent); } }));

    const modalLinks = document.querySelectorAll('.modal-link');
    const generalModal = modals.general;
    const generalTitle = document.getElementById('general-modal-title');
    const generalContent = document.getElementById('general-modal-content');
    const generalModalData = {
        api: { title: 'API Reference Access', content: '<p style="margin-bottom:16px">AfricanEye API access is a separate service layer and is not required by the Intelligence frontend.</p>' },
        contact: { title: 'Coordinate Support Services', content: '<p style="margin-bottom:16px">Use the AfricanEye project support channel for intelligence and platform enquiries.</p>' },
        privacy: { title: 'Privacy and Strategy Security Protocol', content: '<p style="margin-bottom:12px">AfricanEye applies privacy and security controls appropriate to the platform.</p>' },
        terms: { title: 'Standard Terms of Clearance', content: '<p style="margin-bottom:12px">Use of AfricanEye is subject to the project terms and applicable law.</p>' }
    };
    modalLinks.forEach(link => link.addEventListener('click', e => {
        e.preventDefault();
        const data = generalModalData[link.getAttribute('data-modal')];
        if (data && generalTitle && generalContent && generalModal) {
            generalTitle.textContent = data.title;
            generalContent.innerHTML = data.content;
            openModal(generalModal);
        }
    }));

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
