'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Neural Network Canvas
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', resizeCanvas);
        
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.color = Math.random() > 0.5 ? 'rgba(0, 200, 255, 0.5)' : 'rgba(124, 58, 237, 0.5)';
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            let numParticles = 80;
            if (window.innerWidth < 768) numParticles = 30;
            else if (window.innerWidth < 1024) numParticles = 50;

            for (let i = 0; i < numParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        };

        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = dx * dx + dy * dy;
                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        let opacity = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(0, 200, 255, ${opacity * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connect();
            requestAnimationFrame(animateParticles);
        };

        resizeCanvas();
        animateParticles();
    }

    // 2. Custom Cursor
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    
    if (cursorDot && cursorRing && !('ontouchstart' in window)) {
        let mouseX = 0;
        let mouseY = 0;
        let ringX = 0;
        let ringY = 0;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        const renderCursor = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        const interactables = document.querySelectorAll('a, button, input, select, textarea, .svc-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        });
    } else if (cursorDot && cursorRing) {
        cursorDot.style.display = 'none';
        cursorRing.style.display = 'none';
    }

    // 3. Navigation
    const nav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Active link highlighting & Smooth scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.querySelectorAll('a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current) && current !== '') {
                a.classList.add('active');
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Hero Typewriter
    const twWord = document.getElementById('typewriter-word');
    if (twWord) {
        const words = ['customer support', 'data entry', 'invoicing', 'lead generation', 'email campaigns', 'report writing', 'HR onboarding', 'inventory tracking'];
        let wordIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let twTimeout;

        const type = () => {
            const currentWord = words[wordIdx];
            if (isDeleting) {
                twWord.textContent = currentWord.substring(0, charIdx - 1);
                charIdx--;
            } else {
                twWord.textContent = currentWord.substring(0, charIdx + 1);
                charIdx++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIdx === currentWord.length) {
                typeSpeed = 2000; // Pause at end of word
                isDeleting = true;
                twWord.classList.add('blinking');
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                wordIdx = (wordIdx + 1) % words.length;
                typeSpeed = 500;
                twWord.classList.remove('blinking');
            } else {
                twWord.classList.remove('blinking');
            }

            twTimeout = setTimeout(type, typeSpeed);
        };
        type();
    }

    // 5. Metrics Counter
    const metrics = document.querySelectorAll('.metric-num');
    const animateValue = (obj, start, end, duration, suffix, isDecimal) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuad
            const easeProgress = progress * (2 - progress);
            
            let val = easeProgress * (end - start) + start;
            if (isDecimal) val = val.toFixed(1);
            else val = Math.floor(val);
            
            obj.innerHTML = val + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = (isDecimal ? end.toFixed(1) : end) + suffix;
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                const suffix = entry.target.getAttribute('data-suffix') || '';
                const isDecimal = entry.target.hasAttribute('data-decimal');
                animateValue(entry.target, 0, target, 2000, suffix, isDecimal);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    metrics.forEach(metric => observer.observe(metric));

    // 6. Scroll Reveal
    const revealElements = document.querySelectorAll('section, .reveal, .svc-card, .ps-step, .price-card, .testi-card');
    revealElements.forEach(el => el.classList.add('reveal-prep'));

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // 7. Billing Toggle
    const billingToggle = document.getElementById('billing-toggle');
    const pcAmts = document.querySelectorAll('.pc-amt');
    
    if (billingToggle) {
        billingToggle.addEventListener('click', () => {
            billingToggle.classList.toggle('active');
            const isAnnual = billingToggle.classList.contains('active');
            billingToggle.setAttribute('aria-checked', isAnnual);

            pcAmts.forEach(amt => {
                const val = isAnnual ? amt.getAttribute('data-yr') : amt.getAttribute('data-mo');
                amt.textContent = parseInt(val).toLocaleString();
            });
        });
    }

    // 8. ROI Calculator
    const teamInput = document.getElementById('ri-team');
    const hoursInput = document.getElementById('ri-hours');
    const rateInput = document.getElementById('ri-rate');
    
    const teamDisp = document.getElementById('ri-team-d');
    const hoursDisp = document.getElementById('ri-hours-d');
    const rateDisp = document.getElementById('ri-rate-d');
    
    const rrHours = document.getElementById('rr-hours');
    const rrMoney = document.getElementById('rr-money');
    const rrRoi = document.getElementById('rr-roi');

    const updateSliderFill = (input) => {
        const value = (input.value - input.min) / (input.max - input.min) * 100;
        input.style.background = `linear-gradient(to right, #00C8FF 0%, #7C3AED ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`;
    };

    const formatMoney = (val) => {
        return '$' + Math.floor(val).toLocaleString();
    };

    let calcTimeout;
    const calculateROI = () => {
        const team = parseInt(teamInput.value);
        const hours = parseInt(hoursInput.value);
        const rate = parseInt(rateInput.value);

        // Display current values on sliders
        teamDisp.textContent = team === 1 ? '1 person' : `${team} people`;
        hoursDisp.textContent = `${hours} hrs/week`;
        rateDisp.textContent = `$${rate}/hr`;

        // Update visual indicators inside the math explanation box
        const teamValSpan = document.getElementById('ri-team-v');
        const hoursValSpan = document.getElementById('ri-hours-v');
        const totalHrsSpan = document.getElementById('ri-total-hrs');
        const rrFteSpan = document.getElementById('rr-fte');

        if (teamValSpan) teamValSpan.textContent = team;
        if (hoursValSpan) hoursValSpan.textContent = hours;

        [teamInput, hoursInput, rateInput].forEach(updateSliderFill);

        // Calculate: hoursPerMonth = team * hours * 4.33 * 0.8 (80% automation)
        const hoursPerMonth = Math.round(team * hours * 4.33 * 0.8);
        const moneySaved = Math.round(hoursPerMonth * rate * 12); // yearly
        const productivityGain = 80; // Based on assumption (80% automation of the manual portion)
        const fteEquiv = (hoursPerMonth / 173.3).toFixed(1); // 173.3 hours per month for a full-time worker

        if (totalHrsSpan) totalHrsSpan.textContent = hoursPerMonth.toLocaleString();
        if (rrFteSpan) rrFteSpan.textContent = fteEquiv;

        // Animate counting
        animateValue(rrHours, parseInt(rrHours.textContent.replace(/,/g, '')) || 0, hoursPerMonth, 500, '', false);
        
        let startMoney = parseInt(rrMoney.textContent.replace(/[^0-9.-]+/g,"")) || 0;
        let startTimestamp = null;
        const animateMoney = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / 500, 1);
            const current = progress * (moneySaved - startMoney) + startMoney;
            rrMoney.textContent = formatMoney(current);
            if (progress < 1) requestAnimationFrame(animateMoney);
        };
        requestAnimationFrame(animateMoney);

        rrRoi.textContent = productivityGain + '%';
    };

    if (teamInput && hoursInput && rateInput) {
        [teamInput, hoursInput, rateInput].forEach(input => {
            input.addEventListener('input', () => {
                if(calcTimeout) cancelAnimationFrame(calcTimeout);
                calcTimeout = requestAnimationFrame(calculateROI);
            });
            updateSliderFill(input); // init
        });
        calculateROI();
    }

    // 9. Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const nameInput = document.getElementById('cf-name');
        const emailInput = document.getElementById('cf-email');
        const serviceInput = document.getElementById('cf-service');
        const messageInput = document.getElementById('cf-message');
        const consentInput = document.getElementById('cf-consent');
        const countSpan = document.getElementById('cf-count');
        
        const validateField = (input, validator, errorMsgId) => {
            const grp = input.closest('.form-grp');
            const errSpan = document.getElementById(errorMsgId);
            const isValid = validator(input.value);
            
            if (isValid) {
                grp.classList.remove('invalid');
                grp.classList.add('valid');
                if(errSpan) errSpan.textContent = '';
            } else {
                grp.classList.remove('valid');
                grp.classList.add('invalid');
                if(errSpan) errSpan.textContent = input.validationMessage || 'Invalid input';
            }
            return isValid;
        };

        if (messageInput) {
            messageInput.addEventListener('input', () => {
                countSpan.textContent = messageInput.value.length;
                validateField(messageInput, val => val.length >= 20, 'e-message');
            });
        }
        
        if (nameInput) nameInput.addEventListener('input', () => validateField(nameInput, val => val.trim().length >= 2, 'e-name'));
        if (emailInput) emailInput.addEventListener('input', () => validateField(emailInput, val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'e-email'));
        if (serviceInput) serviceInput.addEventListener('change', () => validateField(serviceInput, val => val !== '', 'e-service'));
        if (consentInput) consentInput.addEventListener('change', () => validateField(consentInput, () => consentInput.checked, 'e-consent'));

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isNameValid = validateField(nameInput, val => val.trim().length >= 2, 'e-name');
            const isEmailValid = validateField(emailInput, val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'e-email');
            const isServiceValid = validateField(serviceInput, val => val !== '', 'e-service');
            const isMessageValid = validateField(messageInput, val => val.length >= 20, 'e-message');
            const isConsentValid = validateField(consentInput, () => consentInput.checked, 'e-consent');

            if (isNameValid && isEmailValid && isServiceValid && isMessageValid && isConsentValid) {
                const btn = document.getElementById('submit-btn');
                btn.classList.add('loading');
                btn.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    document.getElementById('form-success').hidden = false;
                }, 1000);
            }
        });
    }

    // 10. AI Chat Demo
    const chatFab = document.getElementById('chat-fab');
    const chatPopup = document.getElementById('chat-popup');
    const chatClose = document.getElementById('cp-close');
    const chatInput = document.getElementById('cp-input');
    const chatSend = document.getElementById('cp-send');
    const chatMessages = document.getElementById('cp-messages');

    if (chatFab && chatPopup) {
        const toggleChat = () => {
            const isHidden = chatPopup.hidden;
            chatPopup.hidden = !isHidden;
            chatFab.setAttribute('aria-expanded', !isHidden);
            if (!isHidden) chatInput.focus();
        };

        chatFab.addEventListener('click', toggleChat);
        chatClose.addEventListener('click', toggleChat);

        const addMessage = (text, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `cp-msg ${sender}`;
            msgDiv.innerHTML = `<p>${text}</p>`;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const showTyping = () => {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'cp-msg bot typing-indicator';
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const removeTyping = () => {
            const ind = document.getElementById('typing-indicator');
            if (ind) ind.remove();
        };

        const handleSend = () => {
            const text = chatInput.value.trim();
            if (!text) return;
            
            addMessage(text, 'user');
            chatInput.value = '';
            showTyping();

            const lowerText = text.toLowerCase();
            let response = "I'm a demo bot, but our real AI can answer all your questions, automate tasks, and learn from your specific data!";
            
            if (lowerText.includes('chatbot') || lowerText.includes('chat')) {
                response = "We build custom chatbots for Web, WhatsApp, and Telegram using GPT-4o. They handle support, sales, and lead gen 24/7.";
            } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pricing')) {
                response = "Our plans start at $1,499/mo with a guaranteed ROI within 30 days. Check out the Pricing section above!";
            } else if (lowerText.includes('workflow') || lowerText.includes('automation')) {
                response = "We automate processes using Make, Zapier, n8n, and custom code to connect your CRM, databases, and apps.";
            } else if (lowerText.includes('agent')) {
                response = "Our AI agents are autonomous. Give them a goal (like 'research competitors'), and they plan and execute the task completely on their own.";
            } else if (lowerText.includes('email')) {
                response = "We can automate your lead nurturing, onboarding, and newsletters using intelligent drip sequences and AI-personalized copy.";
            } else if (lowerText.includes('document') || lowerText.includes('invoice')) {
                response = "Our document processing AI extracts data from invoices, PDFs, and forms automatically with high accuracy using OCR and NLP.";
            }

            setTimeout(() => {
                removeTyping();
                addMessage(response, 'bot');
            }, 1000 + Math.random() * 1000); // 1-2 sec delay
        };

        chatSend.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // 11. Terminal Animation
    const terminal = document.getElementById('why-terminal');
    const animatedSpan = document.getElementById('at-animated');
    if (terminal && animatedSpan) {
        const messages = [
            "Processing invoice batch... [62%]",
            "Processing invoice batch... [89%]",
            "Invoice batch complete. 0 errors.",
            "Syncing CRM data...",
            "Sync complete."
        ];
        
        let msgIdx = 0;
        let tInterval;

        const termObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!tInterval) {
                        tInterval = setInterval(() => {
                            msgIdx = (msgIdx + 1) % messages.length;
                            animatedSpan.textContent = messages[msgIdx];
                        }, 1500);
                    }
                } else {
                    clearInterval(tInterval);
                    tInterval = null;
                }
            });
        }, { threshold: 0.5 });
        
        termObserver.observe(terminal);
    }

    // 12. Industries Marquee (pause on hover handled partially in JS if needed, but CSS is usually enough. Let's add JS just in case)
    const indTrack = document.getElementById('industries-track');
    if (indTrack) {
        indTrack.addEventListener('mouseenter', () => {
            indTrack.style.animationPlayState = 'paused';
        });
        indTrack.addEventListener('mouseleave', () => {
            indTrack.style.animationPlayState = 'running';
        });
    }

    // 13. Service Card Mobile Flip
    const svcCards = document.querySelectorAll('.svc-card');
    if ('ontouchstart' in window) {
        svcCards.forEach(card => {
            card.addEventListener('click', () => {
                const inner = card.querySelector('.card-inner');
                inner.style.transform = inner.style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
            });
        });
    }
});
