class PuntInteres {
    // Atributs privats
    #id;
    #esManual;

    // Atributs públics
    pais;
    ciutat;
    nom;
    direccio;
    tipus;
    latitud;
    longitud;
    puntuacio;

    // Atribut estàtic per a comptar el total de tasques
    static totalTasques = 0;

    constructor(id, esManual, pais, ciutat, nom, direccio, tipus, latitud, longitud, puntuacio) {
        this.#id = id;
        this.#esManual = esManual;
        this.pais = pais;
        this.ciutat = ciutat;
        this.nom = nom;
        this.direccio = direccio;
        this.tipus = tipus;
        this.latitud = latitud;
        this.longitud = longitud;
        this.puntuacio = puntuacio;

        // Incrementa el comptador de totalTasques al crear una nova instancia
        PuntInteres.totalTasques++;
    }

    // Getters  Setters per a l'atributo id
    get id() {
        return this.#id;
    }
    set id(nouId) {
        this.#id = nouId;
    }

    // Getters i Setters per al atribut esManual
    get esManual() {
        return this.#esManual;
    }
    set esManual(valor) {
        this.#esManual = valor;
    }

    // Método estático para obtener el total de elementos
    static obtenirTotalElements() {
        return PuntInteres.totalTasques;
    }
}
