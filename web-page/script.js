document.addEventListener("DOMContentLoaded", function() {
    // 1. Variables de UI y Estado
    const container = document.getElementById('cards-container');
    const tagsContainer = document.getElementById('active-filters');
    const filterWrapper = document.getElementById('filter-wrapper');
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

    // 3. Lógica de Filtros Personalizados (Género y Autor)
    function inicializarFiltroDesplegable() {
        if (!filterWrapper) return;
        
        let libros = JSON.parse(localStorage.getItem('misLibros')) || [];

        // CASO 1: Biblioteca vacía -> Botón deshabilitado con mensaje requerido
        if (libros.length === 0) {
            filterWrapper.innerHTML = `
                <button class="filter-btn disabled-filter-btn" disabled title="Ingresa libros primero">
                    ingresa libros a tu biblioteca primero para poder usar los filtros
                </button>
            `;
            return;
        }

        // Extraer autores y géneros únicos
        let generosUnicos = new Set();
        let autoresUnicos = new Set();

        libros.forEach(libro => {
            if (libro.autor && libro.autor.trim() !== "") {
                autoresUnicos.add(libro.autor.trim());
            }
            if (libro.generosArray && Array.isArray(libro.generosArray)) {
                libro.generosArray.forEach(g => generosUnicos.add(g.trim()));
            } else if (libro.genero && libro.genero.trim() !== "") {
                generosUnicos.add(libro.genero.trim());
            }
        });

        // CASO 2: Estructura del Botón Original con su SVG + Menú Oculto
        filterWrapper.innerHTML = `
            <button id="filter-btn" class="filter-btn">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M603.5-193.5Q560-237 560-300t43.5-106.5Q647-450 710-450t106.5 43.5Q860-363 860-300t-43.5 106.5Q773-150 710-150t-106.5-43.5Zm156-57Q780-271 780-300t-20.5-49.5Q739-370 710-370t-49.5 20.5Q640-329 640-300t20.5 49.5Q681-230 710-230t49.5-20.5ZM160-260v-80h320v80H160Zm-16.5-293.5Q100-597 100-660t43.5-106.5Q187-810 250-810t106.5 43.5Q400-723 400-660t-43.5 106.5Q313-510 250-510t-106.5-43.5Zm156-57Q320-631 320-660t-20.5-49.5Q279-730 250-730t-49.5 20.5Q180-689 180-660t20.5 49.5Q221-590 250-590t49.5-20.5ZM480-620v-80h320v80H480Zm230 320ZM250-660Z"/>
                </svg>
                Filters
            </button>
            <div id="custom-dropdown" class="dropdown-menu">
                <div class="dropdown-section-title">BY GENRE</div>
                <ul id="genres-list"></ul>
                <div class="dropdown-section-title">BY AUTHOR</div>
                <ul id="authors-list"></ul>
            </div>
        `;

        const genresList = document.getElementById('genres-list');
        const authorsList = document.getElementById('authors-list');

        // Insertar filas de Géneros
        if (generosUnicos.size > 0) {
            generosUnicos.forEach(genre => {
                const li = document.createElement('li');
                li.textContent = genre;
                li.addEventListener('click', () => selectFilter(genre));
                genresList.appendChild(li);
            });
        } else {
            genresList.innerHTML = `<li class="no-options">No genres found</li>`;
        }

        // Insertar filas de Autores
        if (autoresUnicos.size > 0) {
            autoresUnicos.forEach(author => {
                const li = document.createElement('li');
                li.textContent = author;
                li.addEventListener('click', () => selectFilter(author));
                authorsList.appendChild(li);
            });
        } else {
            authorsList.innerHTML = `<li class="no-options">No authors found</li>`;
        }

        // Lógica para abrir/cerrar el menú desplegable personalizado
        const filterBtn = document.getElementById('filter-btn');
        const customDropdown = document.getElementById('custom-dropdown');

        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            customDropdown.classList.toggle('show-menu');
        });

        // Cerrar el menú si se hace click fuera de él
        document.addEventListener('click', () => {
            customDropdown.classList.remove('show-menu');
        });
    }

    function selectFilter(value) {
        const term = value.toLowerCase().trim();
        if (!filtrosActivos.includes(term)) {
            filtrosActivos.push(term);
            actualizarInterfaz();
        }
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filtrosActivos = [];
            actualizarInterfaz();
        });
    }

    window.removeFilter = function(filtroAEliminar) {
        filtrosActivos = filtrosActivos.filter(f => f !== filtroAEliminar);
        actualizarInterfaz();
    };

    function actualizarInterfaz() {
        inicializarFiltroDesplegable(); 
        renderTags();
        renderCards();
    }

    function renderTags() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';

        filtrosActivos.forEach((filtro, index) => {
            const tag = document.createElement('div');
            tag.className = 'filter-tag';
            
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

        if (filtrosActivos.length > 0) {
            libros = libros.filter(libro => {
                return filtrosActivos.some(filtro => {
                    const enTitulo = libro.titulo?.toLowerCase().includes(filtro);
                    const enAutor = libro.autor?.toLowerCase().includes(filtro);
                    const enGeneros = libro.generosArray?.some(g => g.toLowerCase().includes(filtro));
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

    window.deleteBook = function(index) {
        if(confirm("Delete this book?")) {
            let libros = JSON.parse(localStorage.getItem('misLibros')) || [];
            libros.splice(index, 1);
            localStorage.setItem('misLibros', JSON.stringify(libros));
            actualizarInterfaz();
        }
    }

    actualizarInterfaz();
});
