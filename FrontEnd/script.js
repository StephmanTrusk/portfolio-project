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

// On crée une figure pour chaque image
function createImageFigure(work) {
    const figure = document.createElement('figure');
    figure.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    return figure;
}

// Fonction pour afficher les travaux dans la galerie
async function displayWorks() {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    
    // Récupérer et afficher les travaux
    const works = await getWorks();
    works.forEach(work => {
        const figure = createImageFigure(work);
        gallery.appendChild(figure);
    });
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', displayWorks); 