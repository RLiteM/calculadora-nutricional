class ScoreCalculator {
    constructor() {
        this.SCORE_VERDE_MIN = -1.99;
        this.SCORE_VERDE_MAX = 1.99;

        this.SCORE_NARANJA_MIN = -2.99;
        this.SCORE_NARANJA_MAX = -2.0;

        this.SCORE_CELESTE_MIN = 2.0;
        this.SCORE_CELESTE_MAX = 2.99;

        this.SCORE_ROJO_MIN = -3.5;
        this.SCORE_ROJO_MAX = -3.0;

        this.SCORE_AZUL_MIN = 3.0;
        this.SCORE_AZUL_MAX = 3.5;

        this.sweepBlanco = 40;
        this.sweepOtrosColores = 45;
        this.sweepVerdeCentral = 100;
    }


    getAngleForScore(score) {
        let targetAngle;

        if (score >= this.SCORE_VERDE_MIN && score <= this.SCORE_VERDE_MAX) {
            const anguloInicioVisual = -this.sweepVerdeCentral / 2;
            const rangoAngulo = this.sweepVerdeCentral;
            const rangoScore = this.SCORE_VERDE_MAX - this.SCORE_VERDE_MIN;
            targetAngle = anguloInicioVisual + (score - this.SCORE_VERDE_MIN) / rangoScore * rangoAngulo;
        } else if (score >= this.SCORE_NARANJA_MIN && score <= this.SCORE_NARANJA_MAX) {
            const anguloInicioSegmentoOriginal = 85; 
            const anguloBaseVisualParaAguja = (anguloInicioSegmentoOriginal - 180 + 360) % 360; 
            const rangoAngulo = this.sweepOtrosColores;
            const rangoScore = this.SCORE_NARANJA_MAX - this.SCORE_NARANJA_MIN;
            targetAngle = anguloBaseVisualParaAguja + (score - this.SCORE_NARANJA_MIN) / rangoScore * rangoAngulo;
        } else if (score >= this.SCORE_CELESTE_MIN && score <= this.SCORE_CELESTE_MAX) {
            const anguloInicioSegmentoOriginal = 230; 
            const anguloBaseVisualParaAguja = (anguloInicioSegmentoOriginal - 180 + 360) % 360;
            const rangoAngulo = this.sweepOtrosColores;
            const rangoScore = this.SCORE_CELESTE_MAX - this.SCORE_CELESTE_MIN;
            targetAngle = anguloBaseVisualParaAguja + (score - this.SCORE_CELESTE_MIN) / rangoScore * rangoAngulo;
        } else if (score >= this.SCORE_ROJO_MIN && score <= this.SCORE_ROJO_MAX) {
            const anguloInicioSegmentoOriginal = 40; 
            const anguloBaseVisualParaAguja = (anguloInicioSegmentoOriginal - 180 + 360) % 360;
            const rangoAngulo = this.sweepOtrosColores;
            const rangoScore = this.SCORE_ROJO_MAX - this.SCORE_ROJO_MIN;
            targetAngle = anguloBaseVisualParaAguja + (score - this.SCORE_ROJO_MIN) / rangoScore * rangoAngulo;
        } else if (score >= this.SCORE_AZUL_MIN && score <= this.SCORE_AZUL_MAX) {
            const anguloInicioSegmentoOriginal = 275; 
            const anguloBaseVisualParaAguja = (anguloInicioSegmentoOriginal - 180 + 360) % 360;
            const rangoAngulo = this.sweepOtrosColores;
            const rangoScore = this.SCORE_AZUL_MAX - this.SCORE_AZUL_MIN;
            targetAngle = anguloBaseVisualParaAguja + (score - this.SCORE_AZUL_MIN) / rangoScore * rangoAngulo;
        } else {
     
            targetAngle = 180;
        }

        return (targetAngle + 360) % 360;
    }
}