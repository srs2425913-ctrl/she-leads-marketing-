/* ===== She Leads Marketing - Website Scripts ===== */

document.addEventListener('DOMContentLoaded', function() {

    // ===== STRIPE PAYMENT LINKS CONFIGURATION =====
    // ⚡ When the owner provides actual Stripe Payment Link URLs,
    //    replace the placeholder URLs below.
    const STRIPE_LINKS = {
        // Monthly Retainers
        'Starter':     { url: 'https://buy.stripe.com/5kQcN6g6064Y9KD8zg8EM00', name: 'Starter - $500/mo' },
        'Accelerate':  { url: 'https://buy.stripe.com/bJe00k0721OIcWP3eW8EM01', name: 'Accelerate - $1,500/mo' },
        'Elevate':     { url: 'https://buy.stripe.com/aFa6oIdXS2SMbSL02K8EM02', name: 'Elevate - $3,500/mo' },
        'Premium':     { url: 'https://buy.stripe.com/aFaeVe2faeBuaOH6r88EM03', name: 'Premium - $6,000/mo' },
        'Enterprise':  { url: 'https://buy.stripe.com/28E5kE4ni7924qj9Dk8EM04', name: 'Enterprise - Custom' },
        // Pay-As-You-Go
        'Blog Post':        { url: '', name: 'Blog Post - $200' },
        'Social Bundle':    { url: '', name: 'Social Bundle - $450' },
        'Email Campaign':   { url: '', name: 'Email Campaign - $125' },
        'Ad Creative Set':  { url: '', name: 'Ad Creative Set - $350' }
    };

    // ===== CALENDLY / BOOKING CONFIGURATION =====
    // ⚡ Replace with actual Calendly or booking link when available
    const BOOKING_LINK = '';

    // ===== Stripe Modal Elements =====
    const stripeModalOverlay = document.getElementById('stripeModal');
    const stripeModalClose = document.getElementById('stripeModalClose');
    const stripeModalCancel = document.getElementById('stripeModalCancel');
    const stripeModalTier = document.getElementById('stripeModalTier');
    const stripeModalBtn = document.getElementById('stripeModalBtn');
    const selectedTier = { tier: '', price: '', period: '' };

    // ===== Stripe Button Handler =====
    function handleStripeClick(tier, price, period) {
        const linkConfig = STRIPE_LINKS[tier];

        if (linkConfig && linkConfig.url) {
            // Redirect directly to Stripe
            window.location.href = linkConfig.url;
        } else {
            // Fallback: scroll to contact for enterprise or missing links
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        }
    }

    function openStripeModal() {
        stripeModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeStripeModal() {
        stripeModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Stripe modal event listeners
    if (stripeModalClose) stripeModalClose.addEventListener('click', closeStripeModal);
    if (stripeModalCancel) stripeModalCancel.addEventListener('click', closeStripeModal);
    if (stripeModalOverlay) {
        stripeModalOverlay.addEventListener('click', function(e) {
            if (e.target === stripeModalOverlay) closeStripeModal();
        });
    }

    // Esc key closes modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && stripeModalOverlay && stripeModalOverlay.classList.contains('active')) {
            closeStripeModal();
        }
    });

    // ===== Wire up all Stripe buttons =====
    document.querySelectorAll('.stripe-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const tier = this.dataset.tier || this.querySelector('h4')?.textContent || '';
            const price = this.dataset.price || '0';
            const period = this.dataset.period || 'one-time';

            // If it's a PAYG card (div), handle differently
            if (this.tagName === 'DIV') {
                handleStripeClick(tier, price, period);
            } else {
                // It's an anchor/button
                handleStripeClick(tier, price, period);
            }
        });
    });

    // ===== Get Started / Pricing Links =====
    function handleGetStartedClick(e) {
        e.preventDefault();
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    }

    const getStartedBtns = document.querySelectorAll('#bookCallBtn, #heroBookCallBtn, #heroGetStartedBtn');
    getStartedBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', handleGetStartedClick);
    });

    // ===== Mobile Navigation Toggle =====
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ===== Navbar Scroll Effect =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ===== Pricing Toggle (Monthly / Pay-As-You-Go) =====
    const toggleSwitch = document.getElementById('pricingToggle');
    const toggleMonthly = document.getElementById('toggleMonthly');
    const togglePayg = document.getElementById('togglePayg');
    const monthlySection = document.getElementById('monthlyPricing');
    const paygSection = document.getElementById('paygPricing');
    const extraCards = document.querySelector('.pricing-extra-cards');

    function showMonthly() {
        toggleSwitch.classList.remove('payg');
        toggleMonthly.classList.add('active');
        togglePayg.classList.remove('active');
        if (monthlySection) monthlySection.style.display = 'grid';
        if (extraCards) extraCards.style.display = 'grid';
        if (paygSection) paygSection.style.display = 'none';
    }

    function showPayg() {
        toggleSwitch.classList.add('payg');
        togglePayg.classList.add('active');
        toggleMonthly.classList.remove('active');
        if (monthlySection) monthlySection.style.display = 'none';
        if (extraCards) extraCards.style.display = 'none';
        if (paygSection) paygSection.style.display = 'block';
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function() {
            toggleSwitch.classList.contains('payg') ? showMonthly() : showPayg();
        });
    }
    if (toggleMonthly) toggleMonthly.addEventListener('click', showMonthly);
    if (togglePayg) togglePayg.addEventListener('click', showPayg);

    // ===== Animated Counter =====
    function animateCounters() {
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const updateCount = () => {
                const current = parseInt(counter.innerText) || 0;
                if (current < target) {
                    counter.innerText = Math.min(current + Math.ceil(target / 30), target);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // ===== Intersection Observer for animations =====
    const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    this.unobserve?.(entry.target);
                }
            });
        }, observerOptions).observe(heroStats);
    }

    // Fade-in for sections
    document.querySelectorAll('.value-prop, .services, .pricing, .process, .testimonials').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease-out';
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    this.unobserve?.(entry.target);
                }
            });
        }, { threshold: 0.1 }).observe(section);
    });

    // Card stagger animation
    document.querySelectorAll('.values-grid, .services-grid, .pricing-grid, .pricing-extra-cards, .testimonial-grid, .payg-grid').forEach(group => {
        const cards = group.querySelectorAll('.value-card, .service-card, .pricing-card, .testimonial-card, .payg-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        });
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.value-card, .service-card, .pricing-card, .testimonial-card, .payg-card').forEach(card => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                    this.unobserve?.(entry.target);
                }
            });
        }, { threshold: 0.1 }).observe(group);
    });

    // ===== Enhanced Contact Form Handler =====
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Extract lead data
            const formData = new FormData(contactForm);
            const lead = {
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                company: formData.get('company') || '',
                tier: formData.get('tier') || '',
                message: formData.get('message') || '',
                timestamp: new Date().toISOString(),
                source: 'website-contact-form'
            };

            // Log lead to console (in production, this would send to CRM/email)
            console.log('📋 New Lead Captured:', lead);

            // Simulate storing locally (in production, POST to backend)
            try {
                const stored = JSON.parse(localStorage.getItem('sheleads_leads') || '[]');
                stored.push(lead);
                localStorage.setItem('sheleads_leads', JSON.stringify(stored));
                console.log('✅ Lead saved locally (' + stored.length + ' total leads)');
            } catch (e) {
                console.log('📋 Lead captured (localStorage unavailable):', lead);
            }

            // Hide form, show success
            contactForm.style.display = 'none';
            formSuccess.classList.add('active');

            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ===== Smooth scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

});
    // ===== Lead Magnet Form Handler =====
    const leadMagnetForm = document.getElementById('leadMagnetForm');
    const leadMagnetSuccess = document.getElementById('leadMagnetSuccess');

    if (leadMagnetForm) {
        leadMagnetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(leadMagnetForm);
            const lead = {
                name: formData.get('name'),
                email: formData.get('email'),
                timestamp: new Date().toISOString(),
                source: 'lead-magnet-checklist'
            };

            console.log('📥 New Lead Magnet Captured:', lead);

            // Save to localStorage
            try {
                const stored = JSON.parse(localStorage.getItem('sheleads_leads') || '[]');
                stored.push(lead);
                localStorage.setItem('sheleads_leads', JSON.stringify(stored));
                console.log('✅ Lead saved locally (' + stored.length + ' total leads)');
            } catch (err) {
                console.error('Failed to save lead', err);
            }

            leadMagnetForm.style.display = 'none';
            leadMagnetSuccess.classList.add('active');
        });
    }
