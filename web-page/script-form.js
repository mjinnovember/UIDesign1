// 1. Variables Globales
const urlParams = new URLSearchParams(window.location.search);
const editIndex = urlParams.get('editIndex');
const bookForm = document.getElementById('book-form');
const photoInput = document.getElementById('photo-input');
const previewImg = document.getElementById('preview-img');
const labelElements = document.querySelectorAll('.upload-box label > *');
const stars = document.querySelectorAll('.star');
const ratingValueText = document.getElementById('rating-value');
let currentRating = 0;
let imagenBase64 = ""; // Variable para guardar la imagen temporalmente

// 2. Al cargar el DOM
document.addEventListener("DOMContentLoaded", function() {
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const botonUser = document.getElementById('user-btn');

    if (isLoggedIn === 'true' && nombreGuardado && botonUser) {
        botonUser.textContent = `HELLO, ${nombreGuardado.toUpperCase()}`;
    }

    if (editIndex !== null) {
        const libros = JSON.parse(localStorage.getItem('misLibros')) || [];
        const libro = libros[editIndex];

        if (libro) {
            document.getElementById('title').value = libro.titulo || "";
            document.getElementById('author').value = libro.autor || "";
            document.getElementById('pages').value = libro.paginas || "";
            document.getElementById('chapters').value = libro.capitulos || "";
            document.getElementById('review-text').value = libro.resena || "";
            document.getElementById('date-from').value = libro.fechaInicio || "";
            document.getElementById('date-to').value = libro.fechaFin || "";

            // --- CARGAR IMAGEN GUARDADA ---
            if (libro.portada) {
                imagenBase64 = libro.portada;
                previewImg.src = libro.portada;
                previewImg.style.display = 'block';
                labelElements.forEach(el => el.style.opacity = '0');
            }

            if (libro.rating) {
                currentRating = libro.rating;
                updateUI(currentRating);
            }

            const todasLasChecks = document.querySelectorAll('input[type="checkbox"]');
            todasLasChecks.forEach(cb => {
                const textoLabel = cb.parentElement.textContent.trim();
                if (libro.generosArray?.includes(textoLabel) || 
                    libro.statusArray?.includes(textoLabel) || 
                    libro.formatArray?.includes(textoLabel)) {
                    cb.checked = true;
                }
            });

            marcarRadio('progress', libro.progreso);
            marcarRadio('diff', libro.dificultad);
            
            const saveBtn = document.querySelector('.save-btn');
            if (saveBtn) saveBtn.textContent = "UPDATE BOOK";
        }
    }
});

function marcarRadio(name, valor) {
    const radios = document.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(r => {
        if (r.parentElement.textContent.trim() === valor) r.checked = true;
    });
}

// 3. Lógica de Estrellas
stars.forEach((star, index) => {
    star.addEventListener('click', () => { currentRating = index + 1; updateUI(currentRating); });
    star.addEventListener('mouseover', () => { updateUI(index + 1); });
    star.addEventListener('mouseleave', () => { updateUI(currentRating); });
});

function updateUI(rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    if (ratingValueText) ratingValueText.textContent = rating;
}

// 4. Lógica de Imagen (CONVERTIR A TEXTO BASE64)
if (photoInput) {
    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagenBase64 = e.target.result; // Aquí se guarda el texto de la imagen
                previewImg.src = imagenBase64;
                previewImg.style.display = 'block';
                labelElements.forEach(el => el.style.opacity = '0');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 5. GUARDAR / ACTUALIZAR
if (bookForm) {
    bookForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const getCheckedInColumn = (colIndex, secIndex) => {
            const selector = `.column:nth-child(${colIndex}) section:nth-child(${secIndex}) input:checked`;
            return Array.from(document.querySelectorAll(selector)).map(cb => cb.parentElement.textContent.trim());
        };

        const libroData = {
            titulo: document.getElementById('title').value.trim() || "Untitled",
            autor: document.getElementById('author').value.trim() || "Unknown",
            paginas: document.getElementById('pages').value || "0",
            capitulos: document.getElementById('chapters').value || "0",
            resena: document.getElementById('review-text').value.trim() || "",
            fechaInicio: document.getElementById('date-from').value,
            fechaFin: document.getElementById('date-to').value,
            rating: currentRating,
            portada: imagenBase64, // <--- GUARDAMOS LA IMAGEN AQUÍ
            progreso: document.querySelector('input[name="progress"]:checked')?.parentElement.textContent.trim() || "",
            dificultad: document.querySelector('input[name="diff"]:checked')?.parentElement.textContent.trim() || "",
            statusArray: getCheckedInColumn(3, 1),
            formatArray: getCheckedInColumn(3, 3),
            generosArray: Array.from(document.querySelectorAll('.scrollable input:checked')).map(cb => cb.parentElement.textContent.trim())
        };

        let listaLibros = JSON.parse(localStorage.getItem('misLibros')) || [];

        if (editIndex !== null) {
            listaLibros[parseInt(editIndex)] = libroData;
        } else {
            listaLibros.push(libroData);
        }

        try {
            localStorage.setItem('misLibros', JSON.stringify(listaLibros));
            window.location.href = 'secon-page-website.html';
        } catch (error) {
            console.error("Error:", error);
            alert("La imagen es muy pesada para el navegador. Intenta con una más pequeña.");
        }
    });
}
