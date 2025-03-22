class Excel {
    constructor(file) {
        this.file = file;
    }

    async readCSV() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const text = event.target.result;
                // Separar el text en líneas sin procesar res
                const rawLines = text.split(/\r?\n/);
                // Eliminar espais al inici i al final de cada línea
                const trimmedLines = [];
                for (let i = 0; i < rawLines.length; i++) {
                    trimmedLines.push(rawLines[i].trim());
                }

                // Filtrar líneas buidas
                const nonEmptyLines = trimmedLines.filter(function (line) {
                    return line !== "";
                });

                if (nonEmptyLines.length < 2) {
                    resolve([]);
                } else {
                    // Obtener la capçalera i limpiarla
                    const headerParts = nonEmptyLines[0].split(";");
                    const header = [];
                    for (let i = 0; i < headerParts.length; i++) {
                        header.push(headerParts[i].trim());
                    }
                    // Processar les demés líneas para crear objectes
                    const rows = [];
                    const linesToProcess = nonEmptyLines.slice(1);
                    for (let i = 0; i < linesToProcess.length; i++) {
                        const line = linesToProcess[i];
                        const colsParts = line.split(";");
                        const cols = [];
                        for (let j = 0; j < colsParts.length; j++) {
                            cols.push(colsParts[j].trim());
                        }
                        let rowObj = {};
                        for (let k = 0; k < header.length; k++) {
                            if (cols[k]) {
                                rowObj[header[k]] = cols[k];
                            } else {
                                rowObj[header[k]] = "";
                            }
                        }
                        rows.push(rowObj);
                    }
                    this.rows = rows;
                    resolve(rows);
                }
            };

            reader.onerror = (event) => {
                reject(event);
            };

            reader.readAsText(this.file);
        });
    }


    async getInfoCountry() {
        if (!this.rows) {
            this.rows = await this.readCSV();
        }
        if (this.rows.length === 0) {
            throw new Error("No hi ha dades a l'excel");
        }
        const firstRow = this.rows[0];
        const code = firstRow["codi"];
        const city = firstRow["ciutat"];
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const countryInfo = data[0];
        let flag = "";
        if (countryInfo.flags && countryInfo.flags.png) {
            flag = countryInfo.flags.png;
        } else {
            flag = countryInfo.flags.svg;
        }
        let lat = 0, lon = 0;
        if (countryInfo.capitalInfo && countryInfo.capitalInfo.latlng) {
            lat = countryInfo.capitalInfo.latlng[0];
            lon = countryInfo.capitalInfo.latlng[1];
        }
        return { city, flag, lat, lon };
    }
}
