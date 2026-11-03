import { API_KEY } from './config.js';

const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');

// 1. Συνάρτηση αναζήτησης λίστας ταινιών (&s=)
async function handleSearch() {
    const query = movieInput.value.trim();

    if (query === '') {
        alert('Παρακαλώ γράψε τον τίτλο μιας ταινίας!');
        return;
    }

    resultsDiv.innerHTML = `<p class="loading">Αναζήτηση για "${query}"...</p>`;

    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'False') {
            resultsDiv.innerHTML = `<p class="error">Δεν βρέθηκαν ταινίες. Δοκίμασε άλλον τίτλο!</p>`;
            return;
        }

        // Δημιουργούμε το grid με τις κάρτες και αποθηκεύουμε το imdbID σε data-id
        const moviesHTML = data.Search.map(movie => {
            const posterUrl = movie.Poster !== 'N/A' 
                ? movie.Poster 
                : 'https://via.placeholder.com/300x450?text=No+Poster';

            return `
                <div class="movie-card" data-id="${movie.imdbID}">
                    <img src="${posterUrl}" alt="${movie.Title}">
                    <div class="movie-info">
                        <h3>${movie.Title}</h3>
                        <p class="year">${movie.Year}</p>
                    </div>
                </div>
            `;
        }).join('');

        resultsDiv.innerHTML = `<div class="movies-grid">${moviesHTML}</div>`;

        // Προσθέτουμε κλικ σε κάθε κάρτα ξεχωριστά
        const cards = resultsDiv.querySelectorAll('.movie-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                const imdbID = this.getAttribute('data-id');
                fetchMovieDetails(imdbID); // Καλούμε τη συνάρτηση λεπτομερειών
            });
        });

    } catch (error) {
        console.error('Σφάλμα σύνδεσης:', error);
        resultsDiv.innerHTML = `<p class="error">Προέκυψε σφάλμα σύνδεσης.</p>`;
    }
}

// 2. ΝΕΟ: Συνάρτηση για φόρτωση αναλυτικών στοιχείων μίας ταινίας (&i=)
async function fetchMovieDetails(imdbID) {
    resultsDiv.innerHTML = `<p class="loading">Φόρτωση λεπτομερειών...</p>`;

    try {
        const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === 'False') {
            resultsDiv.innerHTML = `<p class="error">Δεν ήταν δυνατή η φόρτωση των λεπτομερειών.</p>`;
            return;
        }

        // Εμφανίζουμε την πλήρη κάρτα και κουμπί επιστροφής
        resultsDiv.innerHTML = `
            <button id="backBtn" class="back-btn">← Επιστροφή στα αποτελέσματα</button>
            <div class="movie-card-detailed">
                <img src="${data.Poster !== 'N/A' ? data.Poster : ''}" alt="${data.Title}">
                <div class="movie-info-detailed">
                    <h2>${data.Title} (${data.Year})</h2>
                    <p><strong>Βαθμολογία IMDb:</strong> ⭐ ${data.imdbRating}</p>
                    <p><strong>Σκηνοθέτης:</strong> ${data.Director}</p>
                    <p><strong>Ηθοποιοί:</strong> ${data.Actors}</p>
                    <p><strong>Είδος:</strong> ${data.Genre}</p>
                    <p><strong>Περίληψη:</strong> ${data.Plot}</p>
                </div>
            </div>
        `;

        // Λειτουργικότητα κουμπιού επιστροφής (ξανατρέχει την τελευταία αναζήτηση ή καθαρίζει)
        document.getElementById('backBtn').addEventListener('click', handleSearch);

    } catch (error) {
        console.error('Σφάλμα:', error);
        resultsDiv.innerHTML = `<p class="error">Σφάλμα κατά τη φόρτωση της ταινίας.</p>`;
    }
}

searchBtn.addEventListener('click', handleSearch);

movieInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});