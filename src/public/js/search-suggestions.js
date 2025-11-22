// Sistema de sugerencias para el buscador
let searchSuggestions = [];
let currentSuggestions = [];
let selectedSuggestionIndex = -1;
let currentInputElement = null;

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

// Función para navegar a una sugerencia
function navegarASugerencia(sugerencia, inputElement) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    // Si es un objeto con title, type, section
    if (typeof sugerencia === 'object' && sugerencia.title) {
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
    } else {
        // Si es solo un string
        inputElement.value = sugerencia;
        container.style.display = 'none';
        // Disparar búsqueda
        const form = inputElement.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
}

// Función para mostrar sugerencias
function mostrarSugerencias(sugerencias, inputElement) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    currentSuggestions = sugerencias;
    currentInputElement = inputElement;
    selectedSuggestionIndex = -1;
    
    if (sugerencias.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.innerHTML = '';
    sugerencias.forEach((sugerencia, index) => {
        const item = document.createElement('div');
        item.className = 'google-suggestion-item';
        item.setAttribute('data-index', index);
        
        // Si es un objeto con title, type, section
        if (typeof sugerencia === 'object' && sugerencia.title) {
            item.textContent = sugerencia.title;
        } else {
            // Si es solo un string
            item.textContent = sugerencia;
        }
        
        item.onclick = () => {
            navegarASugerencia(sugerencia, inputElement);
        };
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
}

// Función para actualizar la selección visual
function actualizarSeleccion() {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;
    
    const items = container.querySelectorAll('.google-suggestion-item');
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('suggestion-selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('suggestion-selected');
        }
    });
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
            selectedSuggestionIndex = -1;
            
            if (query.length < 2) {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                return;
            }
            
            timeout = setTimeout(async () => {
                const sugerencias = await obtenerSugerencias(query);
                mostrarSugerencias(sugerencias, this);
            }, 300);
        });
        
        // Event listener para navegación con teclado
        input.addEventListener('keydown', function(e) {
            const container = document.getElementById('searchSuggestions');
            if (!container || container.style.display === 'none') {
                return;
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, currentSuggestions.length - 1);
                actualizarSeleccion();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                actualizarSeleccion();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < currentSuggestions.length) {
                    navegarASugerencia(currentSuggestions[selectedSuggestionIndex], this);
                } else {
                    // Si no hay sugerencia seleccionada, hacer búsqueda normal
                    const form = this.closest('form');
                    if (form) {
                        form.dispatchEvent(new Event('submit'));
                    }
                }
            } else if (e.key === 'Escape') {
                container.style.display = 'none';
                selectedSuggestionIndex = -1;
            }
        });
        
        // Ocultar sugerencias al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!form.contains(e.target)) {
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                selectedSuggestionIndex = -1;
            }
        });
    });
});

