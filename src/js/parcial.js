function getBuildingData() {
    // Limpia lo que haya en la pantalla antes de empezar
    if (window.limpiarEscena) window.limpiarEscena();

    var cant = prompt("¿Cuántos edificios quieres?", "3");
    var n = parseInt(cant);

    for (var i = 0; i < n; i++) {
        var datos = prompt("Edificio " + (i + 1) + "\nIngrese: pisos, color, wireframe", "3,ff0000,false");
        var valores = cleanParamsUI(datos, ",");

        // Llamamos a dibujar
        drawElement(i, valores[0], valores[1], valores[2]);
    }
}

function drawElement(index, pisos, color, wire) {
    var alto = 3;
    var ancho = 5;

    for (var p = 0; p < pisos; p++) {
        // Creamos el cubo
        var geo = new THREE.BoxGeometry(ancho, alto, ancho);
        var mat = new THREE.MeshStandardMaterial({ color: color, wireframe: wire });
        var cubo = new THREE.Mesh(geo, mat);

        // --- POSICIÓN PARA QUE QUEDE SOBRE LA MALLA ---
        var x = index * 10; // Separa los edificios de lado
        var y = (p * alto) + (alto / 2); // Apila hacia arriba desde el suelo
        
        cubo.position.set(x, y, 0);
        window.scene.add(cubo);

        // --- DETALLE: VENTANA (Plane) ---
        var vGeo = new THREE.PlaneGeometry(1.5, 1.5);
        var vMat = new THREE.MeshBasicMaterial({ color: 0xA8C8E3, side: THREE.DoubleSide });
        var ventana = new THREE.Mesh(vGeo, vMat);
        ventana.position.set(x, y, ancho / 2 + 0.01); // Se pega a la cara del frente
        window.scene.add(ventana);
    }
}

function cleanParamsUI(datos, marker) {
    var lista = datos.split(marker);
    
    var p = parseInt(lista[0].trim()); // Pisos
    var c = parseInt("0x" + lista[1].trim().replace("#", ""), 16); // Color (Crea el número HEX)
    var w = (lista[2].trim().toLowerCase() === "true"); // Wireframe
    
    return [p, c, w];
}