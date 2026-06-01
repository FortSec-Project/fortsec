const coursesData = [
    {
        id: 1,
        title: 'INTRODUÇÃO AO WEB HACKING',
        description: '',
        image: 'free.webp',
        tech: [],
        badge: 'GRATUITO',
        badgeColor: '#00ff88',
        action: 'openSyllabus',
        actionParam: 'free',
        secondaryAction: 'openLink',
        secondaryParam: 'https://www.youtube.com/playlist?list=PLlbNz_vAXF14NPQ3panb94Rb6wyGCVnJF',
        secondaryText: 'ACESSAR AGORA',
        singleButton: false
    },
    {
        id: 2,
        title: 'A BASE DO HACKING',
        description: '',
        image: 'vip.webp',
        tech: [],
        badge: 'VIP',
        badgeColor: '#00ff88',
        action: 'openSyllabus',
        actionParam: 'vip',
        secondaryAction: 'openLink',
        secondaryParam: 'https://go.hotmart.com/G103169662Q',
        secondaryText: 'ACESSAR AGORA',
        singleButton: false
    },
    {
        id: 3,
        title: 'SEGURANÇA OFENSIVA PROFISSIONAL',
        description: '',
        image: 'pro.webp',
        tech: [],
        badge: 'PRO',
        badgeColor: '#ff0033',
        action: 'openSyllabus',
        actionParam: 'pro',
        secondaryAction: 'showAlert',
        secondaryParam: 'EM BREVE!',
        secondaryText: 'EM BREVE!',
        singleButton: false
    },
    {
        id: 4,
        title: 'EBOOKS',
        description: '',
        image: 'ebooks.webp',
        tech: [],
        badge: 'GRATUITO',
        badgeColor: '#00ff88',
        action: 'openSyllabus',
        actionParam: 'ebooks',
        secondaryAction: null,
        secondaryText: 'VER LISTA',
        singleButton: true
    },
    {
        id: 5,
        title: 'DISPOSITIVOS',
        description: '',
        image: 'hard.webp',
        tech: [],
        badge: 'PEDIDOS',
        badgeColor: '#00ffff',
        action: 'openSyllabus',
        actionParam: 'dispositivos',
        secondaryAction: null,
        secondaryText: 'VER LISTA',
        singleButton: true
    }
];

const companiesData = [
    {
        id: 1,
        title: 'CHATGPT',
        description: 'Vulnerabilidades de prompt injection e controle de dados.',
        image: 'gpt.webp'
    },
    {
        id: 2,
        title: 'ABBA CURSOS',
        description: 'Falhas de variados níveis foram encontradas e reportadas.',
        image: 'abba.webp'
    },
    {
        id: 3,
        title: 'MICROSOFT',
        description: 'Vulnerabilidades encontradas em aplicações, produtos e sistemas operacionais.',
        image: 'windows.webp'
    },
    {
        id: 4,
        title: 'PREF. BOQUEIRÃO',
        description: 'Sério vazamento no banco de dados, com grande exposição de informações.',
        image: 'pref.webp'
    },
    {
        id: 5,
        title: 'SMASHING LOGO',
        description: 'Metadados e variáveis manipuláveis, causando grande impacto.',
        image: 'logo.webp'
    },
    {
        id: 6,
        title: 'META',
        description: 'Falhas em serviços e sistemas.',
        image: 'meta.webp'
    },
    {
        id: 7,
        title: 'SIST. NUCLEAR DA RÚSSIA',
        description: 'Falhas em servidores e acessos restritos ao governo.',
        image: 'russia.webp'
    }
];

let currentIndex = 0;
let autoSlideInterval;
let isHovering = false;
const carousel = document.getElementById('carousel');
const indicatorsContainer = document.getElementById('indicators');

let horizontalCurrentIndex = 0;
let horizontalAutoSlideInterval;
let horizontalIsHovering = false;
const horizontalCarousel = document.getElementById('horizontalCarousel');
const horizontalIndicatorsContainer = document.getElementById('horizontalIndicators');

function createCarouselItem(data, index) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    item.dataset.index = index;
    
    const techBadges = data.tech.map(tech => 
        `<span class="tech-badge">${tech}</span>`
    ).join('');
    
    const isUnavailable = data.secondaryAction === 'showAlert';
    
    const buttonsClass = data.singleButton ? 'single-button' : '';
    
    const buttonGrid = data.singleButton ? 
        `<div class="card-buttons ${buttonsClass}">
            <button class="card-cta full-width" onclick="handleCourseAction('${data.action}', '${data.actionParam}')">${data.secondaryText}</button>
        </div>` :
        `<div class="card-buttons ${buttonsClass}">
            <button class="card-cta" onclick="handleCourseAction('${data.action}', '${data.actionParam}')">EMENTA</button>
            <button class="card-cta ${isUnavailable ? 'unavailable' : ''}" 
                    onclick="${isUnavailable ? "alert('EM BREVE!')" : `handleCourseAction('${data.secondaryAction}', '${data.secondaryParam}')`}">
                ${data.secondaryText}
            </button>
        </div>`;
    
    item.innerHTML = `
        <div class="card">
            <div class="card-content">
                <div class="card-number">0${data.id}</div>
                <div class="card-image">
                    <img src="${data.image}" alt="${data.title}">
                    <div style="position: absolute; top: 15px; left: 15px; background: ${data.badgeColor}; color: #000; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: 700;">
                        ${data.badge}
                    </div>
                </div>
                <h3 class="card-title">${data.title}</h3>
                <div class="card-tech">${techBadges}</div>
            </div>
            ${buttonGrid}
        </div>
    `;
    
    item.addEventListener('mouseenter', () => {
        isHovering = true;
        clearInterval(autoSlideInterval);
    });
    
    item.addEventListener('mouseleave', () => {
        isHovering = false;
        startAutoSlide();
    });
    
    return item;
}

function initCarousel() {
    coursesData.forEach((data, index) => {
        const item = createCarouselItem(data, index);
        carousel.appendChild(item);
        
        const indicator = document.createElement('div');
        indicator.className = 'indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    updateCarousel();
    startAutoSlide();
}

function updateCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const totalItems = items.length;
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    
    items.forEach((item, index) => {
        let offset = index - currentIndex;
        
        if (offset > totalItems / 2) {
            offset -= totalItems;
        } else if (offset < -totalItems / 2) {
            offset += totalItems;
        }
        
        const absOffset = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;
        
        item.style.transform = '';
        item.style.opacity = '';
        item.style.zIndex = '';
        item.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        let spacing1 = 400;
        let spacing2 = 600;
        let spacing3 = 750;
        
        if (isMobile) {
            spacing1 = 280;
            spacing2 = 420;
            spacing3 = 550;
        } else if (isTablet) {
            spacing1 = 340;
            spacing2 = 520;
            spacing3 = 650;
        }
        
        if (absOffset === 0) {
            item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
            item.style.opacity = '1';
            item.style.zIndex = '10';
        } else if (absOffset === 1) {
            const translateX = sign * spacing1;
            const rotation = isMobile ? 25 : 30;
            const scale = isMobile ? 0.88 : 0.85;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.8';
            item.style.zIndex = '5';
        } else if (absOffset === 2) {
            const translateX = sign * spacing2;
            const rotation = isMobile ? 35 : 40;
            const scale = isMobile ? 0.75 : 0.7;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-350px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.5';
            item.style.zIndex = '3';
        } else if (absOffset === 3) {
            const translateX = sign * spacing3;
            const rotation = isMobile ? 40 : 45;
            const scale = isMobile ? 0.65 : 0.6;
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-450px) rotateY(${-sign * rotation}deg) scale(${scale})`;
            item.style.opacity = '0.3';
            item.style.zIndex = '2';
        } else {
            item.style.transform = 'translate(-50%, -50%) translateZ(-500px) scale(0.5)';
            item.style.opacity = '0';
            item.style.zIndex = '1';
        }
    });
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide() {
    if (!isHovering) {
        currentIndex = (currentIndex + 1) % coursesData.length;
        updateCarousel();
    }
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + coursesData.length) % coursesData.length;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function createHorizontalCarouselItem(data, index) {
    const item = document.createElement('div');
    item.className = 'horizontal-carousel-item';
    item.dataset.index = index;
    
    item.innerHTML = `
        <div class="card">
            <div class="horizontal-card-number">0${data.id}</div>
            <div class="horizontal-card-image">
                <img src="${data.image}" alt="${data.title}">
            </div>
            <h3 class="horizontal-card-title">${data.title}</h3>
            <p class="horizontal-card-description">${data.description}</p>
        </div>
    `;
    
    item.addEventListener('mouseenter', () => {
        horizontalIsHovering = true;
        clearInterval(horizontalAutoSlideInterval);
    });
    
    item.addEventListener('mouseleave', () => {
        horizontalIsHovering = false;
        startHorizontalAutoSlide();
    });
    
    return item;
}

function initHorizontalCarousel() {
    companiesData.forEach((data, index) => {
        const item = createHorizontalCarouselItem(data, index);
        horizontalCarousel.appendChild(item);
        
        const indicator = document.createElement('div');
        indicator.className = 'horizontal-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.dataset.index = index;
        indicator.addEventListener('click', () => goToHorizontalSlide(index));
        horizontalIndicatorsContainer.appendChild(indicator);
    });
    
    updateHorizontalCarousel();
    startHorizontalAutoSlide();
}

function updateHorizontalCarousel() {
    const items = document.querySelectorAll('.horizontal-carousel-item');
    const indicators = document.querySelectorAll('.horizontal-indicator');
    const totalItems = items.length;
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    items.forEach((item, index) => {
        let offset = index - horizontalCurrentIndex;
        
        if (offset > totalItems / 2) {
            offset -= totalItems;
        } else if (offset < -totalItems / 2) {
            offset += totalItems;
        }
        
        const absOffset = Math.abs(offset);
        const sign = offset < 0 ? -1 : 1;
        
        item.style.transform = '';
        item.style.opacity = '';
        item.style.zIndex = '';
        item.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        let spacing1 = 300;
        let spacing2 = 550;
        let spacing3 = 750;
        
        if (isSmallMobile) {
            spacing1 = 190;
            spacing2 = 350;
            spacing3 = 480;
        } else if (isMobile) {
            spacing1 = 220;
            spacing2 = 400;
            spacing3 = 550;
        } else if (window.innerWidth <= 1024) {
            spacing1 = 280;
            spacing2 = 480;
            spacing3 = 650;
        }
        
        if (absOffset === 0) {
            item.style.transform = 'translate(-50%, -50%) translateZ(0) scale(1)';
            item.style.opacity = '1';
            item.style.zIndex = '10';
        } else if (absOffset === 1) {
            const translateX = sign * spacing1;
            const scale = isSmallMobile ? 0.85 : (isMobile ? 0.85 : 0.9);
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-100px) scale(${scale})`;
            item.style.opacity = '0.8';
            item.style.zIndex = '5';
        } else if (absOffset === 2) {
            const translateX = sign * spacing2;
            const scale = isSmallMobile ? 0.75 : (isMobile ? 0.75 : 0.8);
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-200px) scale(${scale})`;
            item.style.opacity = '0.6';
            item.style.zIndex = '3';
        } else if (absOffset === 3) {
            const translateX = sign * spacing3;
            const scale = isSmallMobile ? 0.65 : (isMobile ? 0.65 : 0.7);
            item.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(-300px) scale(${scale})`;
            item.style.opacity = '0.4';
            item.style.zIndex = '2';
        } else {
            item.style.transform = 'translate(-50%, -50%) translateZ(-400px) scale(0.5)';
            item.style.opacity = '0';
            item.style.zIndex = '1';
        }
    });
    
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === horizontalCurrentIndex);
    });
}

function nextHorizontalSlide() {
    if (!horizontalIsHovering) {
        horizontalCurrentIndex = (horizontalCurrentIndex + 1) % companiesData.length;
        updateHorizontalCarousel();
    }
}

function prevHorizontalSlide() {
    horizontalCurrentIndex = (horizontalCurrentIndex - 1 + companiesData.length) % companiesData.length;
    updateHorizontalCarousel();
}

function goToHorizontalSlide(index) {
    horizontalCurrentIndex = index;
    updateHorizontalCarousel();
}

function startHorizontalAutoSlide() {
    clearInterval(horizontalAutoSlideInterval);
    horizontalAutoSlideInterval = setInterval(nextHorizontalSlide, 4000);
}

function handleCourseAction(action, param) {
    switch(action) {
        case 'openSyllabus':
            openSyllabus(param);
            break;
        case 'openLink':
            window.open(param, '_blank');
            break;
        case 'showAlert':
            alert(param || 'EM BREVE!');
            break;
        default:
            console.log('Ação não reconhecida:', action, param);
    }
}

function openSyllabus(courseType) {
    // Redireciona ebooks para página dedicada
    if (courseType === 'ebooks') {
        window.location.href = '/ebooks';
        return;
    }

    const modal = document.getElementById('syllabusModal');
    
    if (window.innerWidth <= 768) {
        Object.assign(modal.style, {
            display: 'block',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: '10000',
            padding: '0',
            margin: '0'
        });
        
        Object.assign(modal.querySelector('.modal-content').style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '0',
            border: 'none',
            padding: '60px 15px 15px 15px',
            margin: '0',
            transform: 'none',
            overflowY: 'auto',
            background: 'var(--carbon-dark)'
        });
        
        Object.assign(modal.querySelector('.close-modal').style, {
            position: 'fixed',
            top: '15px',
            right: '15px',
            width: '35px',
            height: '35px',
            zIndex: '10001'
        });
    } else {
        modal.style.display = 'block';
    }
    
    if (courseType === 'ebooks') {
        document.getElementById('lojaTabs').style.display = 'none';
        
        let content = `
            <div style="background: rgba(157,0,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #cccccc;">
                <h4 style="color: #cccccc; margin-bottom: 15px;">📚 EBOOKS DISPONÍVEIS</h4>
                <div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/An%C3%A1lise%20de%20malware%20Software%20Livre.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Análise de malware Software Livre</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/OWASP%20TOP%2010%202017%20Portugu%C3%AAs.pdf?download=1" download onclick="downloadEbook(event, this)">📖 OWASP TOP 10 2017 (Português)</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Fundamentos%20do%20Ethical%20Hacking.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Fundamentos do ethical hacking</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Ger%C3%AAncia%20de%20Redes%20de%20Computadores.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Gerência de Redes de Computadores</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Seguran%C3%A7a%20em%20Redes%20sem%20Fio.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Segurança em Redes sem Fio</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Python%20e%20Django.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Python e Django</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Shell%20Script%20Profissional.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Shell Script Profissional</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Black%20Hat%20Python%20Programa%C3%A7%C3%A3o%20para%20Hackers.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Black Hat Python Programação para Hackers</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Wireless%20Hacking.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Wireless Hacking</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Pentest%20em%20redes%20sem%20fio.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Pentest em redes sem fio</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Teste%20de%20invas%C3%A3o%20de%20aplica%C3%A7%C3%B5es%20web.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Teste de invasão de aplicações web</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/The%20Hacker%20Playbook.pdf?download=1" download onclick="downloadEbook(event, this)">📖 The Hacker Playbook</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Hacking-Resources.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Hacking-Resources</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/checklist%20de%20seguran%C3%A7a.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Checklist de segurança</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/guia%20de%20contrata%C3%A7%C3%A3o.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Guia de contratação</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/engenharia%20reversa%20e%20malware.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Engenharia reversa e malware</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/advanced%20penetration%20test.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Advanced penetration test</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/OSCP%20ooffensive%20security.pdf?download=1" download onclick="downloadEbook(event, this)">📖 OSCP offensive security</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Hacking%20Para%20Leigos.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Hacking Para Leigos</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Engenharia%20Social.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Engenharia Social</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Engenharia%20reversa%20de%20c%C3%B3digo%20malicioso.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Engenharia reversa de código malicioso</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Engenharia%20De%20Software%20.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Engenharia De Software</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Comecando%20Com%20o%20Linux%20.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Começando Com o Linux</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Arquitetura%20e%20protocolo%20de%20rede%20TCP-IP.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Arquitetura e protocolo de rede TCP-IP</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/A%20Arte%20de%20Invadir.pdf?download=1" download onclick="downloadEbook(event, this)">📖 A Arte de Invadir</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/10%20Ferramentas%20de%20Varredura%20de%20Portas.pdf?download=1" download onclick="downloadEbook(event, this)">📖 10 Ferramentas de Varredura de Portas</a>
                    </div>
                    <div class="ebook-item">
                        <a href="https://dv5hwsmbrlvue79r.public.blob.vercel-storage.com/Linux%20A%20B%C3%ADblia.pdf?download=1" download onclick="downloadEbook(event, this)">📖 Linux A Bíblia</a>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('syllabusContent').innerHTML = content;
    } else if (courseType === 'dispositivos') {
        document.getElementById('lojaTabs').style.display = 'none';
        
        let content = `
            <div style="background: rgba(157,0,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #cccccc;">
                <h4 style="color: #cccccc; margin-bottom: 15px;">🛠️ DISPOSITIVOS DISPONÍVEIS</h4>
                <div class="device-item" style="cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(0,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                    <a href="jammer-detalhes.html" style="text-decoration: none; color: #cccccc; display: block; padding: 10px;" target="_blank">
                        <strong>BLUETOOTH JAMMER (2.4 GHZ)</strong>
                    </a>
                </div>
            </div>
        `;
        
        document.getElementById('syllabusContent').innerHTML = content;
    } else {
        document.getElementById('lojaTabs').style.display = 'none';
        
        let content = '';
        switch(courseType) {
            case 'free':
                content = `
                    <div style="background: rgba(0,243,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent-green);">
                        <h4 style="color: var(--accent-green); margin-bottom: 20px; font-size: 1.4rem;">🎯 INTRODUÇÃO AO WEB HACKING</h4>
                        
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Instalação do ambiente Kali Linux</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Análise de redes e portas</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Python para hacking</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Vulnerabilidades web</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Web shell e shell reversa</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Enumeração de diretórios</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Python para hacking</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Vulnerabilidades conhecidas</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Web shell e shell reversa</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(0,243,255,0.15); border-radius: 6px; border: 1px solid rgba(0,243,255,0.3);">✅ <strong>Conclusão do curso</strong></li>
                        </ul>

                        <div style="margin-top: 20px; padding: 15px; background: rgba(0,243,255,0.1); border-radius: 8px; border: 1px solid var(--accent-green);">
                            <strong>🎓 CERTIFICAÇÃO INCLUÍDA:</strong> Introdução ao Web Hacking
                        </div>
                    </div>
                `;
                break;
            case 'vip':
                content = `
                    <div style="background: rgba(157,0,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid var(--accent-purple);">
                        <h4 style="color: var(--accent-purple); margin-bottom: 20px; font-size: 1.4rem;">🛡️ A BASE DO HACKING - VIP</h4>
                        
                        <ul style="list-style: none; padding-left: 0;">
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Apresentação</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Download e instalação do Parrot OS</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Atualização e correção</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Comandos e funções</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Introdução a extensões web</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Informações e serviços</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Vulnerabilidades por extensões</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Vulnerabilidades por exploração</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Enumeração de diretórios</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Enumeração de subdomínios</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Introdução ao Bruteforce</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Bruteforce na prática</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Estouro de senhas com John</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Ferramentas para Pentest</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Scan profundo de vulnerabilidades</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Webshells</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Shell reversa</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Port forwarding</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Image poisoning</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Pivoting</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Privilege escalation</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Bug bounty real</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Conclusão do curso</strong></li>
                            <li style="margin-bottom: 6px; padding: 6px; background: rgba(157,0,255,0.15); border-radius: 6px; border: 1px solid rgba(157,0,255,0.3);">✅ <strong>Bônus</strong></li>
                        </ul>

                        <div style="margin-top: 20px; padding: 15px; background: rgba(157,0,255,0.1); border-radius: 8px; border: 1px solid var(--accent-purple);">
                            <strong>🎓 CERTIFICAÇÃO INCLUÍDA:</strong> A Base do Hacking
                        </div>
                    </div>
                `;
                break;
            case 'pro':
                content = `
                    <div style="background: rgba(0,243,255,0.1); padding: 20px; border-radius: 10px;">
                        <h4 style="color: var(--accent-red); margin-bottom: 20px; font-size: 1.4rem;">🔥 SEGURANÇA OFENSIVA PROFISSIONAL <br> <span style="margin-left: 40px;">(EMENTA EM PRODUÇÃO)</span></h4>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 25px; padding: 12px; background: rgba(255,0,51,0.05); border-radius: 8px;">
                            <button onclick="switchProTab('fundamentos')" style="padding: 8px 16px; background: var(--accent-red); border: none; border-radius: 6px; color: white; cursor: pointer; font-family: 'Exo 2', sans-serif; font-size: 0.9rem;">M0-4: FUNDAMENTOS</button>
                            <button onclick="switchProTab('ofensiva')" style="padding: 8px 16px; background: rgba(255,0,51,0.2); border: 1px solid var(--accent-red); border-radius: 6px; color: var(--accent-red); cursor: pointer; font-family: 'Exo 2', sans-serif; font-size: 0.9rem;">M5-8: OFENSIVA</button>
                            <button onclick="switchProTab('avancado')" style="padding: 8px 16px; background: rgba(255,0,51,0.2); border: 1px solid var(--accent-red); border-radius: 6px; color: var(--accent-red); cursor: pointer; font-family: 'Exo 2', sans-serif; font-size: 0.9rem;">M9-12: AVANÇADO</button>
                            <button onclick="switchProTab('final')" style="padding: 8px 16px; background: rgba(255,0,51,0.2); border: 1px solid var(--accent-red); border-radius: 6px; color: var(--accent-red); cursor: pointer; font-family: 'Exo 2', sans-serif; font-size: 0.9rem;">M13-14: PRÁTICA</button>
                        </div>

                        <div id="pro-tab-fundamentos">
                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🎯 MÓDULO 0 — INTRODUÇÃO E FUNDAMENTOS</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅<strong> Por que a FortSec? (visão, diferenciais do curso)</strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> O que é um hacker? </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Tipos de hacker </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Todos podem ser hackers? Perfil e mindset </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Leis sobre hacking — conduta entre profissional e cliente </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Fontes seguras do hacking </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Fontes golpistas do hacking </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Metodologia de ensino e expectativas </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">💻 MÓDULO 1 — AMBIENTE DE TRABALHO E INSTALAÇÃO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Distribuições Linux — panorama </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Qual Linux usar? (recomendação por caso de uso) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Instalação virtualizada — VMware </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Instalação virtualizada — VirtualBox </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Instalação em VPS (configuração inicial) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> WSL (Windows Subsystem for Linux) — instalação e uso </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Transformando o Linux comum com Linux_X </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Acesso via SSH (cliente e servidor) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Raspberry Pi como laboratório — instalação e uso via SSH </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Katoolin3 — configurar ambiente hacker em qualquer Linux </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Conhecendo o terminal e organização do workspace </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Sublime Text — configuração e uso </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">⚡ MÓDULO 2 — FUNDAMENTOS DE PROGRAMAÇÃO PARA OFENSIVA</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Bash scripting </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Python — fundamentos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Python — virtualenv e ambientes </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Python — bs4 (web scraping) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Python — APIs e automação </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Python — AI programming (integração e uso) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> JavaScript — fundamentos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> JavaScript / Node — desenvolvimento de bots e extensões </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> PHP — fundamentos aplicados à web </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> C — fundamentos para exploitation </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> C# — fundamentos aplicados a Windows/desktop </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Golang — criar ferramentas e binários rápidos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Interpretadores vs compiladores </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Expressões regulares </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Adição de "código inútil" (ofuscação deliberada) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Comunicação DuckyScript + apostila </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🔧 MÓDULO 3 — ENGENHARIA DE SOFTWARE SEGURA E TOOLING</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criação de ferramentas do zero </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criar interface (UI) via programação </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Boas práticas para programação sem abertura para falhas </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> APIs e consumo seguro de endpoints </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Automação HID (Human Interface Device) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> msfvenom e Veil framework (geração de payloads) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Insomnia — teste de APIs </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Encoders, hashes & salts </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🔍 MÓDULO 4 — RECONHECIMENTO E COLETA DE INFORMAÇÃO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Reconhecimento ativo vs passivo </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Google hacking (queries avançadas) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ferramentas de pesquisa e fontes públicas </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Shodan — busca por dispositivos e serviços expostos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Sites úteis para hackers (listas e uso) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Extensões e plugins úteis </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Enumeração de diretórios (dirb/wordlists) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Enumeração de subdomínios (ferramentas e técnicas) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Verificação de endpoints </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Enumeração de usuários WordPress</strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Enumeração de usuários SSH </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Detecção de WAFs </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Verificação de plugins vulneráveis </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> O que são as CVEs? </strong></li>
                                </ul>
                            </div>
                        </div>

                        <div id="pro-tab-ofensiva" style="display: none;">
                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🌐 MÓDULO 5 — WEB APPLICATION SECURITY</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> OWASP Top 10 (material e exercícios) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Laboratório DVWA (prática) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Laboratório Mutilidae (prática) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Laboratório OWASP Juice Shop (prática) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Webshells e reverse shells </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Uploads inseguros e manipulação de HTML inseguro </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Fuzzing em aplicações web </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ferramentas: Burp Suite, ZAP, PortSwigger labs </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Laboratórios AttackDefense e PortSwigger (prática guiada) </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">📡 MÓDULO 6 — REDE, PROTOCOLOS E SNIFFING</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Conceitos de redes e protocolos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Análise de status de redes </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Envio e recebimento de dados de rede </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Requisições web (HTTP/HTTPS) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Enumeração de DNS </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Man-in-the-middle (teoria e prática controlada) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Wireshark — captura e análise de tráfego </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Netcat — uso prático </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ngrok — tunelamento </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Portmap — uso prático </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Bore — uso prático </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ataques sincronizados e captura em larga escala </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">💥 MÓDULO 7 — EXPLORAÇÃO, PÓS-EXPLORAÇÃO E ESCALONAMENTO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Webshells e shells reversos (prática) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Cronjobs — descoberta e abuso </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Escalando privilégios em Linux (SUDO / SUID / SGID) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Buffer overflow — conceitos e exercícios práticos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Metasploit — framework e módulos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Exploração EternalBlue (simulada em ambiente controlado) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Active Directory — conceitos e exploração básica </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Escalando privilégios em Windows </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> PowerShell ofensivo e evasão </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Técnicas de injeção invisível para reverse shells </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🦠 MÓDULO 8 — MALWARE, PERSISTÊNCIA E OPERAÇÕES OFENSIVAS</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criação de payloads (macro, binários, Android) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criação de malware — teoria e prática ética em lab controlado </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Persistência de malware (técnicas) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criptografia aplicada a malware (proteção/ofuscação) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ofuscação e encoders </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Binder e fusão de arquivos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Esteganografia — técnica e aplicações </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Botnet — conceito e simulação controlada </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> DDoS — teoria e mitigação </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> DDoS por botnet — estudo de caso (teoria) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Indução de terceiros (engenharia social psicológica) </strong></li>
                                </ul>
                            </div>
                        </div>

                        <div id="pro-tab-avancado" style="display: none;">
                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">📱 MÓDULO 9 — MOBILE, HARDWARE E WIRELESS</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Android hacking — ambiente e ferramentas </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Atacando com Android — técnicas práticas </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criação de payloads para mobile </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Hardware hacking — conceitos e ferramentas </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Eletrônica para hacking </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Manipulação de ondas de comunicação (RF basics) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Wireless hacking — ataques práticos (Wi-Fi) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Phisical hacking — segurança física e bypasses </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🔐 MÓDULO 10 — ENGENHARIA REVERSA E CRIPTOGRAFIA</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Engenharia reversa de binários (ferramentas) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Análise de vulnerabilidades em binários </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Zeroday — definição e implicações </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criptografia aplicada: teoria e prática </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Metadata poisoning e análise de metadados </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Análise e reconhecimento de chaves privadas </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">👻 MÓDULO 11 — OPSEC, ANONIMATO E EVASÃO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Tor — uso e limitações </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Tails e Whonix — aplicações para anonimato </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Anonimato em pesquisa (técnicas de proteção) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Anonimato em exploração (fluxos seguros) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Técnicas de evasão e ofuscação operacional </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Mail spoofing e prevenção </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Phishing — técnicas e defesa </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Cuidados essenciais de OpSec </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">⚙️ MÓDULO 12 — FERRAMENTAS ESSENCIAIS E AUTOMAÇÃO AVANÇADA</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Burp Suite — uso avançado </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Aplicações e ferramentas em GO </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Metasploit e msfvenom — automação de payloads </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Desenvolvimento de extensões e integração com AI </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Criação de frameworks pessoais de pentest </strong></li>
                                </ul>
                            </div>
                        </div>

                        <div id="pro-tab-final" style="display: none;">
                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🏆 MÓDULO 13 — PRÁTICA INTENSIVA E CTFS</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Prática em CTFs (diversos níveis) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Labs: PortSwigger, AttackDefense, Bancocn, Me Owna </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Simulações completas (recon → exploração → pós) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Pivoting em redes internas e persistence exercises </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">📊 MÓDULO 14 — RELATÓRIOS, ÉTICA PROFISSIONAL E MERCADO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Como escrever relatórios técnicos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Como escrever relatórios executivos (sumário para cliente) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Contratos: interno, externo e misto (modelos e riscos) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Métodos de pagamento (legais e off-grid) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Carteira fria — uso e segurança </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Bug bounty — como ganhar dinheiro com o conhecimento </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Certificação final e selo "Curso Definitivo" </strong></li>
                                </ul>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h5 style="color: var(--accent-cyan); margin-bottom: 15px; font-size: 1.2rem;">🚀 CONTEÚDO EXTRA — TEMAS AVANÇADOS / DISCUSSÃO DE MERCADO</h5>
                                <ul style="list-style: none; padding-left: 0;">
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Personalize seu ambiente como quiser </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Técnicas comerciais para converter clientes despreparados </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Falhas necessárias — quando e por que não testar publicamente </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Mercado negro — riscos e limites éticos </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Dupla identidade — prós e contras legais/operacionais </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Quais contratos aceitar e gestão de risco </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Ransomwares e bombas cibernéticas — teoria e implicações legais </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Hacktivismo — análise ética e legal </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Roubo de números de telefone e riscos (SIM swap) </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Perigos das operadoras e vulnerabilidades em chaves Pix </strong></li>
                                    <li style="margin-bottom: 6px; padding: 6px; background: rgba(255,0,51,0.15); border-radius: 6px; border: 1px solid rgba(255,0,51,0.3);">✅ <strong> Cuidados essenciais para todos </strong></li>
                                </ul>
                            </div>
                        </div>

                        <div style="margin-top: 20px; padding: 15px; background: rgba(255,0,51,0.1); border-radius: 8px; border: 1px solid var(--accent-red);">
                            <strong>🎓 CERTIFICAÇÃO INCLUÍDA:</strong> FortSec Offensive Security Professional - Curso Definitivo
                        </div>
                    </div>
                `;
                break;
        }
        document.getElementById('syllabusContent').innerHTML = content;
    }
    
    modal.style.display = 'block';
}

function downloadEbook(event, element) {
    event.preventDefault();
    const url = element.getAttribute('href');
    const filename = element.textContent.replace('📖 ', '') + '.pdf';
    
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.setAttribute('target', '_blank');
    
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    
    const originalText = element.textContent;
    element.textContent = '⬇️ Baixando...';
    element.style.color = '#00ff88';
    
    setTimeout(() => {
        element.textContent = originalText;
        element.style.color = '#cccccc';
    }, 2000);
    
    return false;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function switchProTab(tabName) {
    const tabs = document.querySelectorAll('[id^="pro-tab-"]');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById('pro-tab-' + tabName).style.display = 'block';
    
    const buttons = document.querySelectorAll('#syllabusModal button');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') === `switchProTab('${tabName}')`) {
            btn.style.background = 'var(--accent-red)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'rgba(255,0,51,0.2)';
            btn.style.color = 'var(--accent-red)';
        }
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        this.classList.add('active');
    });
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});

document.getElementById('nextBtn').addEventListener('click', nextSlide);
document.getElementById('prevBtn').addEventListener('click', prevSlide);

document.getElementById('horizontalNextBtn').addEventListener('click', nextHorizontalSlide);
document.getElementById('horizontalPrevBtn').addEventListener('click', prevHorizontalSlide);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        prevHorizontalSlide();
    }
    if (e.key === 'ArrowRight') {
        nextSlide();
        nextHorizontalSlide();
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initCarousel();
        initHorizontalCarousel();
    }, 1500);
});

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}