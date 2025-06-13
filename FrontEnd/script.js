// On récupère les travaux depuis l'API
async function getWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        const works = await response.json();
        return works;
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
        return [];
    }
}

// On récupère les catégories depuis l'API
async function getCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        return [];
    }
}

// On crée une figure pour chaque image
function createImageFigure(work) {
    const figure = document.createElement('figure');
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    return figure;
}

// On crée les boutons de filtre
function createFilterButtons(categories) {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters';
    
    // Bouton "Tous"
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.className = 'filter-button active';
    allButton.dataset.categoryId = 'all';
    filtersContainer.appendChild(allButton);
    
    // Boutons pour chaque catégorie
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.className = 'filter-button';
        button.dataset.categoryId = category.id;
        filtersContainer.appendChild(button);
    });
    
    return filtersContainer;
}

// On filtre les travaux par catégorie
function filterWorks(works, categoryId) {
    if (categoryId === 'all') {
        return works;
    }
    return works.filter(work => work.categoryId === parseInt(categoryId));
}

// On affiche les travaux filtrés
function displayFilteredWorks(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    
    works.forEach(work => {
        const figure = createImageFigure(work);
        gallery.appendChild(figure);
    });
}

// On initialise les filtres et les travaux
async function initializeGallery() {
    const works = await getWorks();
    const categories = await getCategories();
    
    // On crée et on ajoute les boutons de filtre
    const filtersContainer = createFilterButtons(categories);
    const portfolioSection = document.querySelector('#portfolio');
    portfolioSection.insertBefore(filtersContainer, document.querySelector('.gallery'));
    
    // On affiche tous les travaux par défaut
    displayFilteredWorks(works);
    
    // On ajoute les écouteurs d'événements pour les filtres
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // On met à jour la classe active
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // On filtre et on affiche les travaux
            const filteredWorks = filterWorks(works, button.dataset.categoryId);
            displayFilteredWorks(filteredWorks);
        });
    });
}

// On initialise la galerie au chargement de la page
document.addEventListener('DOMContentLoaded', initializeGallery); 