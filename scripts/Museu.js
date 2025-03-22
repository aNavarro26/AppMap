class Museu extends PuntInteres {
    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio, horaris, preu, moneda, descripcio) {
        // Invoca el constructor de la clase base
        super(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio);
        this.horaris = horaris;
        this.preu = preu;
        this.moneda = moneda;
        this.descripcio = descripcio;
    }

    // Getter que calcula el preu amb IVA o sense IVA
    get preuIva() {
        if (this.preu === 0) {
            return "Entrada gratuïta";
        }
        // Es busca el factor IVA per al país en la constant IVA_PAISOS
        const ivaFactor = IVA_PAISOS[this.pais];
        let finalPrice;
        if (ivaFactor) {
            finalPrice = this.preu * ivaFactor;
            // Formateem el preu a dos decimals amb coma com a separador i afegim el símbol de la moneda i el text (IVA)
            return finalPrice.toFixed(2).replace('.', ',') + this.moneda + " (IVA)";
        } else {
            // Si no es disposa del factor IVA, es retorna el preu sin IVA
            return this.preu.toFixed(2).replace('.', ',') + this.moneda + " (no IVA)";
        }
    }
}
