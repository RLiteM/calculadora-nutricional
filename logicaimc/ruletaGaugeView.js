class RuletaGaugeView {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas con ID '${canvasId}' no encontrado.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.scoreCalculator = new ScoreCalculator(); // Instancia del calculador de score
        this.initProperties();
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.draw();
    }

    resizeCanvas() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        const size = Math.min(containerWidth * 0.9, 400);
        this.canvas.width = size;
        this.canvas.height = size;
        this.draw();
    }

    initProperties() {
        // Propiedades de las etiquetas de los segmentos
        this.labelRojo = "SVR";
        this.labelNaranja = "MOD";
        this.labelVerdeCentral = "NORMAL";
        this.labelCeleste = "SPESO";
        this.labelAzul = "OBS";

        this.labelExterior1 = "DESNUTRICIÓN AGUDA";
        this.labelExterior3 = "EXCESO DE PESO";

        // Colores de los segmentos
        this.coloresZ = ["#FF0100", "#FFA501", "#C7EFFC", "#60CAF3"];
        this.colorVerdeCentral = "#B4E6A2";
        this.blanco = "#FFFFFF";
        this.negro = "#000000";
        this.grisOscuro = "#424242";

        this.sweepBlanco = 40;
        this.sweepOtrosColores = 45;
        this.sweepVerdeCentral = 100;

        // Propiedades del dial y la aguja
        this.fondoDialColor = "rgba(0,0,0,0)";
        this.sombraDialColor = "rgba(0, 0, 0, 0.27)";
        this.bordeExteriorColor = "#FFFFFF";
        this.agujaColorStart = "#2196F3";
        this.agujaColorEnd = "#0D47A1";
        this.agujaContornoColor = "#000000";
        this.circuloCentralExteriorColor = "#1976D2";
        this.circuloCentralMedioColor = "#FFFFFF";
        this.circuloCentralInteriorColor = "#42A5F5";

        // Propiedades de animación
        this.anguloActual = 180; 
        this.anguloObjetivo = 0; 
        this.currentScore = null; 

        this.animationStartTime = null;
        this.animationDuration = 1000; 
        this.animationStartAngle = 0;
        this.animationEndAngle = 0;
        this.isAnimating = false;
    }

    girarAScore(score) {
        this.currentScore = score;
        this.animationStartAngle = this.anguloActual;
        this.animationEndAngle = this.scoreCalculator.getAngleForScore(score); // Usamos el ScoreCalculator
        this.animationStartTime = performance.now();
        this.isAnimating = true;
        requestAnimationFrame(this.animate.bind(this));
    }

    animate(currentTime) {
        if (!this.isAnimating) return;

        const elapsedTime = currentTime - this.animationStartTime;
        const progress = Math.min(elapsedTime / this.animationDuration, 1);

        this.anguloActual = this.lerpAngle(this.animationStartAngle, this.animationEndAngle, progress);

        this.draw();

        if (progress < 1) {
            requestAnimationFrame(this.animate.bind(this));
        } else {
            this.isAnimating = false;
        }
    }

    lerpAngle(start, end, progress) {
        let diff = end - start;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return (start + diff * progress + 360) % 360;
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        ctx.shadowColor = this.sombraDialColor;
        ctx.fillStyle = this.fondoDialColor;
        ctx.beginPath();
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxOverallRadius = Math.min(w, h) / 2 * 0.95;
        const exteriorTextPathRadius = maxOverallRadius;

        const outerRadius = exteriorTextPathRadius * 0.8;
        const innerRadius = outerRadius * 0.7;
        const textRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const dialRadius = outerRadius * 1.08;

        ctx.arc(cx, cy, dialRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = this.bordeExteriorColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, dialRadius - ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        const ruletaFixedRotation = 90; 
        ctx.translate(cx, cy);
        ctx.rotate(ruletaFixedRotation * Math.PI / 180);
        ctx.translate(-cx, -cy);

        const arcoRectOuter = { x: cx - outerRadius, y: cy - outerRadius, width: outerRadius * 2, height: outerRadius * 2 };
        const arcoRectInner = { x: cx - innerRadius, y: cy - innerRadius, width: innerRadius * 2, height: innerRadius * 2 };

        let currentAngle = 0;
        this.drawSegment(ctx, this.blanco, "", currentAngle, this.sweepBlanco, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepBlanco;
        this.drawSegment(ctx, this.coloresZ[0], this.labelRojo, currentAngle, this.sweepOtrosColores, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepOtrosColores;
        this.drawSegment(ctx, this.coloresZ[1], this.labelNaranja, currentAngle, this.sweepOtrosColores, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepOtrosColores;
        this.drawSegment(ctx, this.colorVerdeCentral, this.labelVerdeCentral, currentAngle, this.sweepVerdeCentral, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepVerdeCentral;
        this.drawSegment(ctx, this.coloresZ[2], this.labelCeleste, currentAngle, this.sweepOtrosColores, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepOtrosColores;
        this.drawSegment(ctx, this.coloresZ[3], this.labelAzul, currentAngle, this.sweepOtrosColores, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);
        currentAngle += this.sweepOtrosColores;
        this.drawSegment(ctx, this.blanco, "", currentAngle, this.sweepBlanco, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation);

        ctx.restore();

        // Dibujar la aguja
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.anguloActual * Math.PI / 180);
        ctx.translate(-cx, -cy);

        const agujaAncho = outerRadius * 0.08;
        const agujaAlto = outerRadius * 0.6;
        const agujaBaseRadius = outerRadius * 0.12;

        const gradient = ctx.createLinearGradient(cx, cy - agujaAlto, cx, cy);
        gradient.addColorStop(0, this.agujaColorStart);
        gradient.addColorStop(1, this.agujaColorEnd);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.agujaContornoColor;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(cx, cy - agujaAlto);
        ctx.lineTo(cx + agujaAncho / 2, cy - agujaBaseRadius / 2);
        ctx.arc(cx, cy, agujaBaseRadius, Math.PI * 0, Math.PI * 1, false);
        ctx.lineTo(cx - agujaAncho / 2, cy - agujaBaseRadius / 2);
        ctx.closePath();

        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        ctx.shadowColor = "rgba(0, 0, 0, 0.78)";

        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Dibujar círculos centrales
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = this.circuloCentralExteriorColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0.47)";
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = this.circuloCentralMedioColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = this.circuloCentralInteriorColor;
        ctx.fill();

        // Dibujar etiquetas exteriores
        ctx.font = `bold ${exteriorTextPathRadius * 0.1}px sans-serif`;
        ctx.fillStyle = this.grisOscuro;
        ctx.textAlign = 'center';

        const angleDesnutricionAgudaCanvas = 350; 
        const angleMuchaHamburguesaCanvas = 190;

        this.drawTextOnArc(ctx, this.labelExterior1, cx, cy, exteriorTextPathRadius, angleDesnutricionAgudaCanvas, "inverted");
        this.drawTextOnArc(ctx, this.labelExterior3, cx, cy, exteriorTextPathRadius, angleMuchaHamburguesaCanvas, "upright");


        // Dibujar el score actual si está disponible
        if (this.currentScore !== null) {
            ctx.font = `bold ${outerRadius * 0.1}px sans-serif`;
            ctx.fillStyle = this.grisOscuro;
            ctx.textAlign = 'center';
            const scoreText = `Z: ${this.currentScore.toFixed(2)}`;
            const scoreTextOffset = outerRadius * 0.45;
            ctx.fillText(scoreText, cx, cy + scoreTextOffset);
        }
    }

    drawSegment(ctx, color, label, startAngle, sweepAngle, cx, cy, textRadius, arcoRectOuter, arcoRectInner, ruletaFixedRotation) {
        ctx.fillStyle = color;
        ctx.beginPath();

        ctx.arc(cx, cy, arcoRectOuter.width / 2,
            startAngle * Math.PI / 180, (startAngle + sweepAngle) * Math.PI / 180);

        const endAngleRad = (startAngle + sweepAngle) * Math.PI / 180;
        ctx.lineTo(cx + Math.cos(endAngleRad) * (arcoRectInner.width / 2),
            cy + Math.sin(endAngleRad) * (arcoRectInner.width / 2));

        ctx.arc(cx, cy, arcoRectInner.width / 2,
            (startAngle + sweepAngle) * Math.PI / 180, startAngle * Math.PI / 180, true);

        const startAngleRad = startAngle * Math.PI / 180;
        ctx.lineTo(cx + Math.cos(startAngleRad) * (arcoRectInner.width / 2),
            cy + Math.sin(startAngleRad) * (arcoRectInner.width / 2));

        ctx.closePath();
        ctx.fill();

        if (label.length > 0) {
            const centerAngle = startAngle + sweepAngle / 2;
            this.drawSingleCharacterLabel(ctx, label, cx, cy, textRadius, centerAngle, ruletaFixedRotation);
        }
    }

    drawSingleCharacterLabel(ctx, text, cx, cy, textRadius, segmentCenterAngle, ruletaFixedRotation) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(segmentCenterAngle * Math.PI / 180);
        ctx.translate(textRadius, 0);

        ctx.font = `bold ${this.canvas.width * 0.05}px sans-serif`;
        ctx.fillStyle = this.negro;
        ctx.textAlign = 'center';

        const absoluteAngleOnCanvas = (segmentCenterAngle + ruletaFixedRotation) % 360;
        const normalizedAbsoluteAngle = (absoluteAngleOnCanvas + 360) % 360;
        let charRotation;

        if (text === this.labelVerdeCentral) {
            charRotation = 90; 
        } else {
            charRotation = 90;

            if (normalizedAbsoluteAngle > 90 && normalizedAbsoluteAngle < 270) {
                charRotation += 180;
            }
        }

        ctx.rotate(charRotation * Math.PI / 180);
        const textMetrics = ctx.measureText(text);
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
        ctx.fillText(text, 0, textHeight / 2 - textMetrics.actualBoundingBoxDescent);
        ctx.restore();
    }

    drawTextOnArc(ctx, text, cx, cy, radius, angleInCanvasDegrees, orientation = "upright") {
        ctx.save();
        ctx.translate(cx, cy);

        let baseAngle = (angleInCanvasDegrees - 90) * Math.PI / 180;

        ctx.font = `bold ${radius * 0.12}px sans-serif`;
        const totalWidth = ctx.measureText(text).width;
        const anglePerPixel = 1 / radius;
        const totalAngle = totalWidth * anglePerPixel;

        let startAngle = baseAngle - (orientation === "inverted" ? -1 : 1) * totalAngle / 2;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charWidth = ctx.measureText(char).width;
            const charAngle = charWidth * anglePerPixel;
            const middleAngle = startAngle + (orientation === "inverted" ? -1 : 1) * charAngle / 2;

            ctx.save();
            ctx.rotate(middleAngle);
            ctx.translate(0, -radius);

            if (orientation === "inverted") {
                ctx.rotate(Math.PI);
            }

            ctx.fillText(char, 0, 0);
            ctx.restore();

            startAngle += (orientation === "inverted" ? -1 : 1) * charAngle;
        }

        ctx.restore();
    }
}