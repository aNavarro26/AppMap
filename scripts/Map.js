class Mapa {
    #map;
    #currentLat;
    #currentLon;

    constructor() {
        this.#getPosicioActual().then(({ lat, lon }) => {
            this.#currentLat = lat;
            this.#currentLon = lon;
            const mapCenter = [lat, lon];
            const zoomLevel = 13;
            // Inicialitza el mapa amb el centre i nivell de zoom definits
            this.#map = L.map('map', {
                center: mapCenter,
                zoom: zoomLevel
            });
            // Afegeix la capa de tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.#map);
            // Crea un layerGroup per a gestionar els marcadors i facilitar el seu borrat
            this.markerGroup = L.layerGroup().addTo(this.#map);
            // Mostra el marcador inicial amb "Estàs aquí"
            this.mostrarPuntInicial(lat, lon);
        }).catch((error) => {
            console.error("Error en la geolocalización:", error);
            // En cas d'error, inicialitza el mapa amb un valor per defecte
            const mapCenter = [41.3851, 2.1734];
            const zoomLevel = 13;
            this.#map = L.map('map', {
                center: mapCenter,
                zoom: zoomLevel
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.#map);
            this.markerGroup = L.layerGroup().addTo(this.#map);
        });
    }
    // Mostra el punt inicial en el mapa, afegint un marcador amb el missatge "Estàs aquí"
    mostrarPuntInicial(lat, lon) {
        const marker = L.marker([lat, lon]).addTo(this.markerGroup);
        marker.bindPopup("Estàs aquí").openPopup();
    }
    // Actualitza la vista del mapa a noves coordenades (lat, lon)
    actualitzarPosInitMapa(lat, lon) {
        this.#map.setView([lat, lon], 4);
    }
    // Mostra un punt en el mapa amb la descripció opcional 'desc'
    mostrarPunt(lat, lon, desc = "") {
        const marker = L.marker([lat, lon]).addTo(this.markerGroup);
        if (desc) {
            marker.bindPopup(desc);
        }
        return marker;
    }
    // Borra tots els punts del mapa
    borrarPunt() {
        this.markerGroup.clearLayers();
    }
    // Métode privat que obté la posició actual
    #getPosicioActual() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                }, (error) => {
                    reject(error);
                });
            } else {
                reject(new Error("Geolocalización no soportada"));
            }
        });
    }

}
