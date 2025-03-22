const IVA_PAISOS = {
    'Espanya': 1.21,
    'França': 1.20,
    'Portugal': 1.23,
    'Regne Unit': 1.20
};

class Atraccio extends PuntInteres {
    // Atributs específics de Atraccio
    // horaris: string, preu: decimal, moneda: string

    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda) {
        // Llamada a constructor de la clase base
        super(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
        this.horaris = horaris;
        this.preu = preu;
        this.moneda = moneda;
    }

    // Getter que calcula el preu amb IVA
    get preuIva() {
        // Si el preu es 0, es retorna "Entrada gratuïta"
        if (this.preu === 0) {
            return "Entrada gratuïta";
        }
        const ivaFactor = IVA_PAISOS[this.pais];
        let finalPrice;
        if (ivaFactor) {
            // Si tenim el IVA, es multiplica el preu per el factor
            finalPrice = this.preu * ivaFactor;
            // Es formatea el preu a dos decimals amb coma com a separador decimal
            return finalPrice.toFixed(2).replace('.', ',') + this.moneda + " (IVA)";
        } else {
            // Si no tenim IVA, es mostra el preu sense IVA
            return this.preu.toFixed(2).replace('.', ',') + this.moneda + " (no IVA)";
        }
    }
}
