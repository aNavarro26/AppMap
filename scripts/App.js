const dropZoneObj = document.querySelector(".dropZone");
let allObjectsList = [];


dropZoneObj.addEventListener("dragover", function (event) {
    event.preventDefault();
});

dropZoneObj.addEventListener("drop", function (event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    loadFile(files);
});

const clearListButton = document.getElementById("clearList");
clearListButton.addEventListener("click", function () {
    document.getElementById("llistat").innerHTML = "No hi ha informació a mostrar";
    document.getElementById("totalElements").textContent = "Total elements: 0";
    allObjectsList = [];
    mapa.borrarPunt();
});


// uso FileReader
const loadFile = function (files) {
    if (files && files.length > 0) {
        const file = files[0];
        const extension = file.name.split(".").pop().toLowerCase();
        if (extension === FILE_EXTENSION) {
            // Crear instancia Excel amb el fitxer
            const excel = new Excel(file);
            excel.readCSV().then(function (rows) {
                let objectsList = [];
                let tipusSet = new Set();
                rows.forEach(function (row) {
                    let tipusLower = "";
                    if (row["tipus"]) {
                        tipusLower = row["tipus"].toLowerCase();
                        tipusSet.add(tipusLower);
                    }
                    let instance;
                    if (tipusLower === "espai") {
                        instance = new PuntInteres(
                            row["codi"],
                            false,
                            row["pais"],
                            row["ciutat"],
                            row["nom"],
                            row["direcció"],
                            row["tipus"],
                            row["latitud"],
                            row["longitud"],
                            parseFloat(row["puntuacio"])
                        );
                    } else if (tipusLower === "atraccio") {
                        instance = new Atraccio(
                            row["codi"],
                            false,
                            row["pais"],
                            row["ciutat"],
                            row["nom"],
                            row["direcció"],
                            row["tipus"],
                            row["latitud"],
                            row["longitud"],
                            parseFloat(row["puntuacio"]),
                            row["horaris"],
                            parseFloat(row["preu"]),
                            row["moneda"]
                        );
                    } else if (tipusLower === "museu") {
                        instance = new Museu(
                            row["codi"],
                            false,
                            row["pais"],
                            row["ciutat"],
                            row["nom"],
                            row["direcció"],
                            row["tipus"],
                            row["latitud"],
                            row["longitud"],
                            parseFloat(row["puntuacio"]),
                            row["horaris"],
                            parseFloat(row["preu"]),
                            row["moneda"],
                            row["descripcio"]
                        );
                    } else {
                        console.warn("Tipus desconegut:", row["tipus"]);
                    }
                    if (instance) {
                        objectsList.push(instance);
                    }
                });
                updateInfoList(objectsList);
                updateTipusDropdown(tipusSet);
                if (objectsList.length > 0) {
                    const primerObjeto = objectsList[0];
                    loadCountryData(primerObjeto.pais, primerObjeto.id, primerObjeto.ciutat);
                }
                allObjectsList = objectsList;
                applyFilters();
            }).catch(function (error) {
                console.error("Error al llegir CSV amb classe Excel:", error);
            });
        } else {
            alert("El fitxer no és csv");
        }
    }
};

// Funció nova per aplicar els filtres, ordenar i filtrar per nom
function applyFilters() {
    let filteredList = allObjectsList.slice();
    const tipusValue = document.getElementById("tipusFilter").value;
    const nomValue = document.getElementById("nomFilter").value.trim().toLowerCase();
    const ordenacioValue = document.getElementById("ordenacioFilter").value;
    if (tipusValue !== "Tots") {
        filteredList = filteredList.filter(item => item.tipus.toLowerCase() === tipusValue.toLowerCase());
    }
    if (nomValue !== "") {
        filteredList = filteredList.filter(item => item.nom.toLowerCase().includes(nomValue));
    }
    filteredList.sort((a, b) => {
        if (a.nom.toLowerCase() < b.nom.toLowerCase()) return -1;
        if (a.nom.toLowerCase() > b.nom.toLowerCase()) return 1;
        return 0;
    });
    if (ordenacioValue === "desc") {
        filteredList.reverse();
    }
    updateInfoList(filteredList);
    updateMapPoints(filteredList);
}


// Event listeners nous per aplicar els filtres
document.getElementById("tipusFilter").addEventListener("change", applyFilters);
document.getElementById("ordenacioFilter").addEventListener("change", applyFilters);
document.getElementById("nomFilter").addEventListener("input", applyFilters);


async function loadCountryData(pais, codi, ciutat) {
    console.log("Valor de codi:", JSON.stringify(codi));
    console.log("URL final:", "https://restcountries.com/v3.1/alpha/" + codi);
    try {
        const response = await fetch("https://restcountries.com/v3.1/alpha/" + codi, { mode: 'cors' });
        if (!response.ok) {
            throw new Error("HTTP error! status: " + response.status);
        }
        const data = await response.json();
        const countryInfo = data[0];
        let flagUrl = "";
        if (countryInfo.flags && countryInfo.flags.png) {
            flagUrl = countryInfo.flags.png;
        } else {
            flagUrl = countryInfo.flags.svg;
        }
        let lat = 0, lon = 0;
        if (countryInfo.capitalInfo && countryInfo.capitalInfo.latlng) {
            lat = countryInfo.capitalInfo.latlng[0];
            lon = countryInfo.capitalInfo.latlng[1];
        }
        const paisInfoDiv = document.getElementById("paisInfo");
        if (paisInfoDiv) {
            let htmlContent = "";
            htmlContent += '<div style="display:flex; align-items:center; gap:10px;">';
            htmlContent += '<span><b>País:</b> ' + pais + '</span>';
            htmlContent += '<img src="' + flagUrl + '" alt="Flag" width="40">';
            htmlContent += '<span><b>Ciutat:</b> ' + ciutat + '</span>';
            htmlContent += '</div>';
            paisInfoDiv.innerHTML = htmlContent;
        }
        if (lat && lon) {
            mapa.actualitzarPosInitMapa(lat, lon);
        }
    } catch (error) {
        console.error("Error cargando información del país:", error);
    }
}

function updateTipusDropdown(tipusSet) {
    const tipusFilter = document.getElementById("tipusFilter");
    tipusFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "Tots";
    allOption.textContent = "Tots";
    tipusFilter.appendChild(allOption);

    const tipusArray = Array.from(tipusSet);
    tipusArray.sort();

    for (let i = 0; i < tipusArray.length; i++) {
        const tipo = tipusArray[i];
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        tipusFilter.appendChild(option);
    }
}


function updateInfoList(objectsList) {
    const llistatDiv = document.getElementById("llistat");
    const totalElementsSpan = document.getElementById("totalElements");
    if (objectsList.length === 0) {
        llistatDiv.textContent = "No hi ha informació a mostrar";
    } else {
        llistatDiv.innerHTML = "";
        objectsList.forEach(function (obj) {
            const container = document.createElement("div");
            container.classList.add("list-container");
            var tipusLower = obj.tipus.toLowerCase();
            var textContent = "";
            var textDiv = document.createElement("div");
            textDiv.style.flex = "1";
            if (tipusLower === "espai") {
                container.classList.add("espai");
                textDiv.style.textAlign = "center";
                textContent = obj.nom + "<br>" + obj.ciutat + " | Tipus: Espai";
            } else if (tipusLower === "atraccio") {
                container.classList.add("atraccio");
                textContent = obj.nom + "<br>" + obj.ciutat + " | Tipus: Atraccio | Horaris: " + obj.horaris + " | Preu: " + obj.preuIva;
            } else if (tipusLower === "museu") {
                container.classList.add("museu");
                textContent = obj.nom + "<br>" + obj.ciutat + " | Tipus: Museu | Horaris: " + obj.horaris + " | Preu: " + obj.preuIva + "<br>";
                if (obj.descripcio) {
                    textContent += obj.descripcio;
                }
            }
            textDiv.innerHTML = textContent;
            container.appendChild(textDiv);
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "delete";
            deleteBtn.classList.add("delete-button");
            deleteBtn.addEventListener("click", function () {
                if (confirm("Estàs segur que vols eliminar el punt d'interès?")) {
                    const index = objectsList.indexOf(obj);
                    if (index !== -1) {
                        objectsList.splice(index, 1);
                        updateInfoList(objectsList);
                        updateMapPoints(objectsList);
                    }
                }
            });
            container.appendChild(deleteBtn);
            llistatDiv.appendChild(container);
        });
    }
    totalElementsSpan.textContent = "Número total: " + objectsList.length;
}


function updateMapPoints(objectsList) {
    mapa.borrarPunt();
    objectsList.forEach(function (obj) {
        const lat = parseFloat(obj.latitud);
        const lon = parseFloat(obj.longitud);
        if (!isNaN(lat) && !isNaN(lon)) {
            var popupContent = "";
            var tipusLower = obj.tipus.toLowerCase();
            if (tipusLower === "espai") {
                popupContent = obj.nom + " - " + obj.ciutat + "<br>Tipus: Espai";
            } else if (tipusLower === "atraccio") {
                popupContent = obj.nom + " - " + obj.ciutat + "<br>Tipus: Atraccio<br>Horaris: " + obj.horaris + "<br>Preu: " + obj.preuIva;
            } else if (tipusLower === "museu") {
                popupContent = obj.nom + " - " + obj.ciutat + "<br>Tipus: Museu<br>Horaris: " + obj.horaris + "<br>Preu: " + obj.preuIva + "<br>";
                if (obj.descripcio) {
                    popupContent += obj.descripcio;
                } else {
                    popupContent += "";
                }
            } else {
                popupContent = obj.nom + " - " + obj.ciutat + "<br>Tipus: " + obj.tipus;
            }
            mapa.mostrarPunt(lat, lon, popupContent);
        }
    });
}

const mapa = new Mapa();