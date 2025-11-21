// Sistema de sugerencias para el buscador
let searchSuggestions = [];
let currentSuggestions = [];

// Función para obtener sugerencias desde el servidor
async function obtenerSugerencias(query) {
    if (query.length < 2) {
        return [];
    }
    
    try {
        const response = await fetch(`/api/sugerencias?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.sugerencias || [];
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        return [];
    }
}

// Función para mostrar sugerencias
function mostrarSugerencias(sugerencias, inputElement) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    if (sugerencias.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    sugerencias.forEach(sugerencia => {
        const item = document.createElement('div');
        item.className = 'google-suggestion-item';
        
        // Si es un objeto con title, type, section
        if (typeof sugerencia === 'object' && sugerencia.title) {
            item.textContent = sugerencia.title;
            item.onclick = () => {
                // Redirigir a la sección correspondiente según el tipo
                let url = '';
                if (sugerencia.type === 'catalogo') {
                    url = `/catalogo?section=${encodeURIComponent(sugerencia.section)}&search=${encodeURIComponent(sugerencia.title)}`;
                } else if (sugerencia.type === 'newsletter') {
                    url = `/newsletter?search=${encodeURIComponent(sugerencia.title)}`;
                } else if (sugerencia.type === 'proximamente') {
                    url = `/proximamente?search=${encodeURIComponent(sugerencia.title)}`;
                } else {
                    // Por defecto, ir al detalle usando slug
                    const slug = sugerencia.slug || sugerencia.title.toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                    url = `/detalle/${slug}`;
                }
                window.location.href = url;
            };
        } else {
            // Si es solo un string
            item.textContent = sugerencia;
            item.onclick = () => {
                inputElement.value = sugerencia;
                container.style.display = 'none';
                // Disparar búsqueda
                const form = inputElement.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            };
        }
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
}

// Inicializar sugerencias en todos los buscadores
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.uni-search-bar__input');
    
    searchInputs.forEach(input => {
        // Crear contenedor de sugerencias si no existe
        const form = input.closest('form');
        let suggestionsContainer = form.querySelector('#searchSuggestions');
        if (form && !suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'searchSuggestions';
            suggestionsContainer.className = 'google-search-suggestions';
            form.appendChild(suggestionsContainer);
        }
        
        // Event listener para búsqueda en tiempo real
        let timeout;
        input.addEventListener('input', async function() {
            clearTimeout(timeout);
            const query = this.value;
            
            if (query.length < 2) {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                return;
            }
            
            timeout = setTimeout(async () => {
                const sugerencias = await obtenerSugerencias(query);
                mostrarSugerencias(sugerencias, this);
            }, 300);
        });
        
        // Ocultar sugerencias al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!form.contains(e.target)) {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            }
        });
    });
});

