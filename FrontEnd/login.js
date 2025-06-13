// Récupération du formulaire
const loginForm = document.getElementById('login-form');

// Gestion de la soumission du formulaire
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Récupération des valeurs du formulaire
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Envoi de la requête de connexion
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Stockage du token
            localStorage.setItem('token', data.token);
            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
        } else {
            // Affichage du message d'erreur
            const errorMessage = document.createElement('p');
            errorMessage.textContent = "Erreur dans l'identifiant ou le mot de passe";
            errorMessage.style.color = 'red';
            errorMessage.style.marginTop = '10px';
            
            // Suppression de l'ancien message d'erreur s'il existe
            const oldError = document.querySelector('.error-message');
            if (oldError) {
                oldError.remove();
            }
            
            errorMessage.className = 'error-message';
            loginForm.appendChild(errorMessage);
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
    }
}); 