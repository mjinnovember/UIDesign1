document.addEventListener("DOMContentLoaded", function() {
    // 1. Variables de UI y Estado
    const container = document.getElementById('cards-container');
    const tagsContainer = document.getElementById('active-filters');
    const filterBtn = document.getElementById('filter-btn');
    const clearBtn = document.getElementById('clear-all');
    const botonUser = document.getElementById('user-btn');
    
    let filtrosActivos = [];
    const colors = ['#FFF292', '#81B377', '#D76B06', '#76B1C7'];

    // 2. Lógica de Sesión (Login/Logout)
    const nombreGuardado = localStorage.getItem('usuarioNombre');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true' && nombreGuardado && botonUser) {
        botonUser.textContent = `HELLO, ${nombreGuardado.toUpperCase()}`;
        const enlace = document.getElementById('login-link');
        if (enlace) enlace.href = "#"; 
        
        botonUser.addEventListener('click', () => {
            if(confirm("¿Logout?")) {
                localStorage.removeItem('isLoggedIn');
                window.location.reload();
            }
        });
    }

    if (isLoggedIn !== 'true') {
        if (container) {
            container.innerHTML = "<h2 style='width:100%; text-align:center; margin-top:50px;'>Please login to see your library</h2>";
        }
        return;
    }

    // 3. Lógica de Filtros (Tags)
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const busqueda = prompt("Add filter (Genre, Author or Title):");
            if (busqueda) {
                const term = busqueda.toLowerCase().trim();
                if (!filtrosActivos.includes(term)) {
                    filtrosActivos.push(term);
                    actualizarInterfaz();
                }
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filtrosActivos = [];
            actualizarInterfaz();
        });
    }

    // Función para eliminar un tag individual
    window.removeFilter = function(filtroAEliminar) {
        filtrosActivos = filtrosActivos.filter(f => f !== filtroAEliminar);
        actualizarInterfaz();
    };

    function actualizarInterfaz() {
        renderTags();
        renderCards();
    }

function renderTags() {
    if (!tagsContainer) return;
    tagsContainer.innerHTML = '';

    // Usamos los mismos colores de las tarjetas para consistencia
    const colors = ['#FFF292', '#81B377', '#D76B06', '#76B1C7'];

    filtrosActivos.forEach((filtro, index) => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        
        // Asignar un color de la paleta basado en el índice
        const colorAzar = colors[index % colors.length];
        tag.style.backgroundColor = colorAzar;

        tag.innerHTML = `
            ${filtro.toUpperCase()} 
            <span onclick="removeFilter('${filtro}')">✕</span>
        `;
        tagsContainer.appendChild(tag);
    });
}

    // 4. Renderizado de Tarjetas
    function renderCards() {
        if (!container) return;
        container.innerHTML = ''; 
        
        let libros = JSON.parse(localStorage.getItem('misLibros')) || [];

        // Lógica de Filtrado Múltiple
        if (filtrosActivos.length > 0) {
            libros = libros.filter(libro => {
                return filtrosActivos.some(filtro => {
                    const enTitulo = libro.titulo?.toLowerCase().includes(filtro);
                    const enAutor = libro.autor?.toLowerCase().includes(filtro);
                    const enGeneros = libro.generosArray?.some(g => g.toLowerCase().includes(filtro));
                    // También buscamos en el campo simple de género por si acaso
                    const enGenSimple = libro.genero?.toLowerCase().includes(filtro);
                    return enTitulo || enAutor || enGeneros || enGenSimple;
                });
            });
        }

        if (libros.length === 0) {
            container.innerHTML = `<p style='width:100%; text-align:center; opacity:0.5; margin-top:50px;'>
                ${filtrosActivos.length > 0 ? 'No results found for these filters.' : 'Your library is empty. Add a book!'}
            </p>`;
            return;
        }

        libros.forEach((libro, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const cardColor = colors[index % colors.length];
            card.style.backgroundColor = cardColor;

            card.onclick = (e) => {
                if (!e.target.closest('.delete-btn')) {
                    window.location.href = `forms.html?editIndex=${index}`;
                }
            };

            // Formatear géneros para mostrar
            const mostrarGeneros = libro.generosArray ? libro.generosArray.join(', ') : (libro.genero || "None");

            card.innerHTML = `
                <div class="paper-clip" style="color: ${cardColor};">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </div>
                <h2>${libro.titulo}</h2>
                <p class="author-text">Author: ${libro.autor}</p>
                <p class="genre-text">Genre: ${mostrarGeneros}</p>
                <div class="delete-container">
                    <button class="delete-btn" type="button">
                        <svg class="circular-text" viewBox="0 0 100 100">
                            <path id="circlePath-${index}" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                            <text><textPath xlink:href="#circlePath-${index}" startOffset="-2%">Everywhere Library</textPath></text>
                        </svg>
                        <div class="trash-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                        </div>
                    </button>
                </div>
            `;

            const delBtn = card.querySelector('.delete-btn');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBook(index);
            });

            container.appendChild(card);
        });
    }

    // 5. Función de Borrado
    window.deleteBook = function(index) {
        if(confirm("Delete this book?")) {
            let libros = JSON.parse(localStorage.getItem('misLibros')) || [];
            libros.splice(index, 1);
            localStorage.setItem('misLibros', JSON.stringify(libros));
            actualizarInterfaz();
        }
    }

    // Inicialización
    actualizarInterfaz();
});
