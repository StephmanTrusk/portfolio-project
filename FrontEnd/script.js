async function fetchDataAsync(endpoint) {
    try {
      const response = await fetch(`http://localhost:5678/api/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error;
    }
}

let allProjects = [];

function createFilterButtons(categories) {
    const filtersContainer = document.querySelector('.filters');
    
    filtersContainer.innerHTML = '';
    
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.classList.add('filter-button', 'active');
    allButton.dataset.category = '0';
    filtersContainer.appendChild(allButton);
    
    categories.forEach(category => {
      const button = document.createElement('button');
      button.textContent = category.name;
      button.classList.add('filter-button');
      button.dataset.category = category.id;
      filtersContainer.appendChild(button);
    });
    addFilterEventListeners();
}

function addFilterEventListeners() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        const categoryId = this.dataset.category;
        filterProjects(categoryId);
      });
    });
}

function filterProjects(categoryId) {
    let filteredProjects;
    
    if (categoryId === '0') {
      filteredProjects = allProjects;
    } else {
      filteredProjects = allProjects.filter(project => project.categoryId == categoryId);
    }
    
    displayProjects(filteredProjects);
}

function displayProjects(projects) {
    const gallery = document.querySelector('.gallery');
    
    gallery.innerHTML = '';
    
    projects.forEach(project => {
      const figure = document.createElement('figure');
      
      const img = document.createElement('img');
      img.src = project.imageUrl;
      img.alt = project.title;
      
      const figcaption = document.createElement('figcaption');
      figcaption.textContent = project.title;
      
      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
}

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const loginLink = document.querySelector('nav ul li:nth-child(3) a');
    const filtersContainer = document.querySelector('.filters');
    
    if (token) {
      if (loginLink) {
        loginLink.textContent = 'logout';
        loginLink.href = '#';
        loginLink.addEventListener('click', logout);
      }
      activateEditMode();
      if (filtersContainer) {
        filtersContainer.style.display = 'none';
      }
    } else {
      if (loginLink) {
        loginLink.textContent = 'login';
        loginLink.href = 'login.html';
        loginLink.removeEventListener('click', logout);
      }
      deactivateEditMode();
      if (filtersContainer) {
        filtersContainer.style.display = 'flex';
      }
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    showLogoutNotification();
    setTimeout(() => {
      checkLoginStatus();
    }, 2000);
}

function showLogoutNotification() {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = 'Déconnexion réussie !';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 1500);
}

async function initGallery() {
    try {
      allProjects = await fetchDataAsync('works');
      const categories = await fetchDataAsync('categories');
      createFilterButtons(categories);
      displayProjects(allProjects);
      checkLoginStatus();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la galerie:', error);
    }
}

document.addEventListener('DOMContentLoaded', initGallery);

function activateEditMode() {
    const editBanner = document.querySelector('.edit-banner');
    const editButton = document.querySelector('.edit-button');
    
    editBanner.style.display = 'flex';
    document.body.classList.add('edit-mode');
    editBanner.addEventListener('click', openProjectsModal);
    
    if (editButton) {
        editButton.style.display = 'flex';
        editButton.style.visibility = 'visible';
        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            openProjectsModal();
        });
    }
}

function deactivateEditMode() {
    const editBanner = document.querySelector('.edit-banner');
    editBanner.style.display = 'none';
    document.body.classList.remove('edit-mode');

    const editButton = document.querySelector('.edit-button');
    if (editButton) {
      editButton.style.display = 'none';
      editButton.style.visibility = 'hidden';
    }
}

function openProjectsModal() {
    const modal = document.getElementById('projects-modal');
    modal.style.display = 'flex';
    loadProjectsInModal();
    setupModalEventListeners();
}

async function loadProjectsInModal() {
    const modalGallery = document.querySelector('#projects-modal .modal-gallery');
    modalGallery.innerHTML = '';
    
    try {
      allProjects.forEach(project => {
        const figure = document.createElement('figure');
        figure.dataset.id = project.id;
        
        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        
        const deleteIcon = document.createElement('div');
        deleteIcon.className = 'delete-icon';
        deleteIcon.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteIcon.addEventListener('click', () => deleteProject(project.id));
        
        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        modalGallery.appendChild(figure);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des projets dans la modal:', error);
    }
}

function setupModalEventListeners() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', closeModals);
    });
    
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(modal => {
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          closeModals();
        }
      });
    });
    
    const addPhotoBtn = document.getElementById('add-photo-btn');
    addPhotoBtn.addEventListener('click', openAddPhotoModal);
    
    const backButton = document.querySelector('.back-modal');
    backButton.addEventListener('click', () => {
      document.getElementById('add-photo-modal').style.display = 'none';
      document.getElementById('projects-modal').style.display = 'flex';
    });
    
    const photoUpload = document.getElementById('photo-upload');
    photoUpload.addEventListener('change', previewImage);
    
    const addPhotoForm = document.getElementById('add-photo-form');
    addPhotoForm.addEventListener('submit', submitNewProject);
    
    loadCategoriesInSelect();

    const validateBtn = document.getElementById('validate-photo-btn');
    const photoTitle = document.getElementById('photo-title');
    const photoCategory = document.getElementById('photo-category');

    function validateForm() {
      const hasImage = photoUpload.files.length > 0;
      const hasTitle = photoTitle.value.trim() !== '';
      const hasCategory = photoCategory.value !== '';
      validateBtn.disabled = !(hasImage && hasTitle && hasCategory);
    }

    photoUpload.addEventListener('change', validateForm);
    photoTitle.addEventListener('input', validateForm);
    photoCategory.addEventListener('change', validateForm);

    validateBtn.disabled = true;
}

function closeModals() {
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    const addPhotoForm = document.getElementById('add-photo-form');
    if (addPhotoForm) {
      addPhotoForm.reset();
      document.getElementById('preview-image').style.display = 'none';
      document.getElementById('photo-preview').style.display = 'flex';
    }
}

function openAddPhotoModal() {
    document.getElementById('projects-modal').style.display = 'none';
    document.getElementById('add-photo-modal').style.display = 'flex';
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const previewImage = document.getElementById('preview-image');
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        document.getElementById('photo-preview').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
}

async function loadCategoriesInSelect() {
    const categorySelect = document.getElementById('photo-category');
    categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    
    try {
      const categories = await fetchDataAsync('categories');
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
}

async function submitNewProject(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const newProject = await response.json();
      allProjects.push(newProject);
      displayProjects(allProjects);
      closeModals();
      showSuccessNotification('Projet ajouté avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
      showErrorNotification('Erreur lors de l\'ajout du projet');
    }
}

async function deleteProject(projectId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      allProjects = allProjects.filter(project => project.id !== projectId);
      displayProjects(allProjects);
      loadProjectsInModal();
      showSuccessNotification('Projet supprimé avec succès !');
    } 
    catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      showErrorNotification('Erreur lors de la suppression du projet');
    }
}

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 2000);
} 