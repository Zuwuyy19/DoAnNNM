document.addEventListener('DOMContentLoaded', () => {

    // Header Scroll Effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-right');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Optional: Smooth Scroll for internal anchor links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Remove active class from all links
                document.querySelectorAll('.desktop-nav a').forEach(nav => nav.classList.remove('active'));

                // Add active to clicked link
                if (this.closest('.desktop-nav')) {
                    this.classList.add('active');
                }

                // Smooth scroll
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle Subscribe Form Submission
    const form = document.querySelector('.subscribe-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert(`Cảm ơn bạn! Đã đăng ký với email: ${emailInput.value}`);
                emailInput.value = '';
            }
        });
    }

});
