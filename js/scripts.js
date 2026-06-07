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
            // Stripe link is configured — redirect directly
            window.open(linkConfig.url, '_blank');
        } else if (tier === 'Enterprise') {
            // Enterprise is custom — scroll to contact form
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        } else {
            // No link configured yet — show modal with option to book a call instead
            selectedTier.tier = tier;
            selectedTier.price = price;
            selectedTier.period = period;

            stripeModalTier.textContent = tier;
            stripeModalBtn.href = '#contact';

            const priceDisplay = period === 'one-time' ? '$' + price : '$' + price + '/month';
            document.getElementById('stripeModalTitle').textContent = 'Coming Soon';
            document.getElementById('stripeModalDesc').innerHTML =
                'The <strong>' + tier + ' (' + priceDisplay + ')</strong> plan isn\'t available for online purchase just yet. ' +
                'Book a free strategy call instead and we\'ll get you set up.';

            stripeModalBtn.innerHTML = '<i class="fas fa-calendar"></i> Book a Free Call';
            stripeModalBtn.onclick = function() {
                closeStripeModal();
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            };

            openStripeModal();
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

    // ===== Booking / Calendar Logic (Custom System) =====
    const bookingModal = document.getElementById('bookingModal');
    const bookingModalClose = document.getElementById('bookingModalClose');
    const bookingSuccess = document.getElementById('bookingSuccess');
    const bookingScheduler = document.getElementById('bookingScheduler');
    const bookingFormContainer = document.getElementById('bookingFormContainer');
    const bookingForm = document.getElementById('bookingForm');
    const bookingDays = document.getElementById('bookingDays');
    const bookingSlots = document.getElementById('bookingSlots');
    const selectedSlotInfo = document.getElementById('selectedSlotInfo');
    const selectedSlotInput = document.getElementById('selectedSlotInput');
    const backToSlots = document.getElementById('backToSlots');
    const closeBookingSuccess = document.getElementById('closeBookingSuccess');

    function openBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetBookingModal();
        generateBookingDays();
    }

    function closeBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function resetBookingModal() {
        bookingScheduler.style.display = 'block';
        bookingFormContainer.style.display = 'none';
        bookingSuccess.classList.remove('active');
        bookingSlots.innerHTML = '<p class="select-day-prompt">Please select a day first</p>';
    }

    function generateBookingDays() {
        if (!bookingDays) return;
        bookingDays.innerHTML = '';
        const now = new Date();
        let daysGenerated = 0;
        let current = new Date(now);

        // Generate next 7 available days (Mon-Fri)
        while (daysGenerated < 7) {
            current.setDate(current.getDate() + 1);
            const dayOfWeek = current.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            const dayEl = document.createElement('div');
            dayEl.className = 'booking-day';
            const dateStr = current.toISOString().split('T')[0];
            dayEl.dataset.date = dateStr;
            
            const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
            const dayDate = current.getDate();
            
            dayEl.innerHTML = `
                <span class="day-name">${dayName}</span>
                <span class="day-date">${dayDate}</span>
            `;
            
            dayEl.addEventListener('click', () => {
                document.querySelectorAll('.booking-day').forEach(d => d.classList.remove('active'));
                dayEl.classList.add('active');
                generateTimeSlots(dateStr);
            });
            
            bookingDays.appendChild(dayEl);
            daysGenerated++;
        }
    }

    function generateTimeSlots(dateStr) {
        if (!bookingSlots) return;
        bookingSlots.innerHTML = '';
        const times = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
            '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', 
            '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', 
            '04:00 PM', '04:30 PM'
        ];

        times.forEach(time => {
            const slotEl = document.createElement('div');
            slotEl.className = 'booking-slot';
            slotEl.textContent = time;
            slotEl.addEventListener('click', () => {
                selectSlot(dateStr, time);
            });
            bookingSlots.appendChild(slotEl);
        });
    }

    function selectSlot(date, time) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        selectedSlotInfo.textContent = `${formattedDate} at ${time}`;
        selectedSlotInput.value = `${date} ${time}`;
        
        bookingScheduler.style.display = 'none';
        bookingFormContainer.style.display = 'block';
    }

    if (backToSlots) {
        backToSlots.addEventListener('click', () => {
            bookingScheduler.style.display = 'block';
            bookingFormContainer.style.display = 'none';
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(bookingForm);
            const booking = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                message: formData.get('message'),
                slot: formData.get('slot'),
                timestamp: new Date().toISOString(),
                type: 'strategy-call'
            };

            console.log('📅 New Booking Captured:', booking);

            // Save to localStorage
            try {
                const stored = JSON.parse(localStorage.getItem('sheleads_bookings') || '[]');
                stored.push(booking);
                localStorage.setItem('sheleads_bookings', JSON.stringify(stored));
                console.log('✅ Booking saved locally (' + stored.length + ' total bookings)');
            } catch (err) {
                console.error('Failed to save booking', err);
            }

            bookingFormContainer.style.display = 'none';
            bookingSuccess.classList.add('active');
        });
    }

    if (bookingModalClose) bookingModalClose.addEventListener('click', closeBookingModal);
    if (closeBookingSuccess) closeBookingSuccess.addEventListener('click', closeBookingModal);
    
    // Close on overlay click
    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) closeBookingModal();
        });
    }

    // ===== Booking / Calendar Links =====
    function handleBookingClick(e) {
        e.preventDefault();
        openBookingModal();
    }

    const bookCallBtns = document.querySelectorAll('#bookCallBtn, #heroBookCallBtn');
    bookCallBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', handleBookingClick);
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