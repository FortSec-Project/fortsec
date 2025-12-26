document.addEventListener('DOMContentLoaded', function() {
    const studentNameInput = document.getElementById('studentName');
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const previewContainer = document.getElementById('previewContainer');
    const canvas = document.getElementById('certificateCanvas');
    const ctx = canvas.getContext('2d');
    
    const CERTIFICATE_TEMPLATE_URL = 'https://i.ibb.co/23XN3fnr/CERTIFICADO.png';
    
    const CERTIFICATE_CONFIG = {
        name: {
            x: 600,
            y: 450,
            fontSize: 48,
            fontFamily: "Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif",
            fontWeight: 'bold',
            color: '#a6a6a6',
            maxWidth: 700
        },
        date: {
            x: 320,
            y: 680,
            fontSize: 16,
            fontFamily: "Calibri, 'Gill Sans', 'Trebuchet MS', sans-serif",
            color: '#a6a6a6'
        }
    };
    
    let certificateTemplate = new Image();
    certificateTemplate.crossOrigin = 'anonymous';
    certificateTemplate.src = CERTIFICATE_TEMPLATE_URL;
    
    let templateLoaded = false;
    
    certificateTemplate.onload = function() {
        templateLoaded = true;
        generateBtn.disabled = false;
    };
    
    certificateTemplate.onerror = function() {
        alert('Erro ao carregar template.');
    };
    
    function getCurrentDate() {
        const now = new Date();
        const options = { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'America/Sao_Paulo'
        };
        return now.toLocaleDateString('pt-BR', options);
    }
    
    function capitalizeName(fullName) {
        return fullName.toUpperCase();
    }
    
    function drawCenteredText(context, text, x, y, maxWidth, fontSize, fontFamily, color) {
        context.font = `500 ${fontSize}px ${fontFamily}`;
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const words = text.split(' ');
        let line = '';
        const lines = [];
        const lineHeight = fontSize * 1.2;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i].trim(), x, startY + (i * lineHeight));
        }
    }
    
    function generateCertificate() {
        if (!templateLoaded) {
            alert('Template ainda não carregado.');
            return;
        }
        
        const rawName = studentNameInput.value.trim();
        
        if (!rawName) {
            alert('Digite seu nome completo.');
            studentNameInput.focus();
            return;
        }
        
        if (rawName.length < 3) {
            alert('Nome muito curto.');
            return;
        }
        
        loading.classList.add('active');
        generateBtn.disabled = true;
        generateBtn.textContent = 'GERANDO...';
        
        const formattedName = capitalizeName(rawName);
        const currentDate = getCurrentDate();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(certificateTemplate, 0, 0, canvas.width, canvas.height);
        
        drawCenteredText(
            ctx,
            formattedName,
            CERTIFICATE_CONFIG.name.x,
            CERTIFICATE_CONFIG.name.y,
            CERTIFICATE_CONFIG.name.maxWidth,
            CERTIFICATE_CONFIG.name.fontSize,
            CERTIFICATE_CONFIG.name.fontFamily,
            CERTIFICATE_CONFIG.name.color
        );
        
        ctx.font = `${CERTIFICATE_CONFIG.date.fontSize}px ${CERTIFICATE_CONFIG.date.fontFamily}`;
        ctx.fillStyle = CERTIFICATE_CONFIG.date.color;
        ctx.textAlign = 'left';
        ctx.fillText(currentDate, CERTIFICATE_CONFIG.date.x, CERTIFICATE_CONFIG.date.y);
        
        setTimeout(() => {
            loading.classList.remove('active');
            generateBtn.disabled = false;
            generateBtn.textContent = '🎓 GERAR CERTIFICADO';
            previewContainer.classList.add('active');
            previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
    
    function downloadPNG() {
        const link = document.createElement('a');
        const name = studentNameInput.value.trim() || 'Certificado';
        link.download = `Certificado-FortSec-${name.replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    document.getElementById('downloadPNG').addEventListener('click', downloadPNG);
    
    generateBtn.addEventListener('click', generateCertificate);
    
    studentNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateCertificate();
        }
    });
    
    setTimeout(() => {
        if (!templateLoaded) {
            generateBtn.disabled = true;
            generateBtn.textContent = '⏳ CARREGANDO TEMPLATE...';
        }
    }, 5000);
});