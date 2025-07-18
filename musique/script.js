const songs = [
    // Personnalise ce tableau avec tous tes sons/projets/singles/feats/clips
    // {title, artist, cover, type, date, link}
    {
        title: "Afrodisiaque",
        artist: "Noslow",
        cover: "img/.jpg",
        type: "projet",
        date: "2024-07-15",
        link: "afrodisiaque/index.html",
    },
    {
        title: "Sexy Gyal",
        artist: "Noslow",
        cover: "img/.jpg",
        type: "single",
        date: "2024-07-10",
        link: "single/shawty.html",
        produced_by_me: true
    },
    {
        title: "Together",
        artist: "Melda",
        cover: "img/together.jpg",
        type: "feat",
        date: "2025-04-10",
        link: "single/together.html"
    },
    {
        title: "Zombie",
        artist: "Noslow",
        cover: "img/zombie.jpg",
        type: "single",
        date: "2024-01-05",
        link: "single/zombie.html"
    },
    {
        title: "Salimah",
        artist: "Noslow",
        cover: "img/salimah.png",
        type: "single",
        date: "2025-01-24",
        link: "single/salimah.html",
        produced_by_me: true
    },
    {
        title: "Shawty",
        artist: "Noslow",
        cover: "img/shawty.jpg",
        type: "single",
        date: "2024-05-17",
        link: "single/shawty.html",
        produced_by_me: true
    },
    {
        title: "Insomniaque",
        artist: "Noslow ft. Melda",
        cover: "img/insomniaque.jpg",
        type: "single",
        date: "2025-05-21",
        link: "single/insomniaque.html",
        produced_by_me: true
    },
    {
        title: "Valentine",
        artist: "Noslow",
        cover: "img/valentine.jpg",
        type: "single",
        date: "2024-02-14",
        link: "single/valentine.html",
    },
    {
        title: "Gangsta Activity",
        artist: "Noslow",
        cover: "img/gangsta_actvity.jpg",
        type: "single",
        date: "2024-04-12",
        link: "single/gangsta_activity.html",
    },
    {
        title: "ON VA LEUR MONTRER",
        artist: "Noslow",
        cover: "img/ovlm.jpg",
        type: "single",
        date: "2024-11-10",
        link: "single/ovlm.html",
        produced_by_me: true
    },
    {
        title: "Une dernière fois",
        artist: "Mayefa",
        cover: "img/udf.jpg",
        type: "feat",
        date: "2025-01-01",
        link: "single/udf.html"
    },
    {
        title: "Night",
        artist: "Noslow",
        cover: "img/night.jpg",
        type: "single",
        date: "2023-11-24",
        link: "single/night.html",
        produced_by_me: true
    },
    {
        title: "Echange",
        artist: "Melda",
        cover: "img/echange.jpg",
        type: "feat",
        date: "2024-05-10",
        link: "single/echange.html",
        produced_by_me: true
    },
    {
        title: "Son pas de moi",
        artist: "Rappeur",
        cover: "img/.jpg",
        type: "prod",
        date: "2024-05-10",
        link: "single/echange.html",
        produced_by_me: true
    },
    {
        title: "Feelings",
        artist: "Noslow",
        cover: "img/feelings.jpg",
        type: "single",
        date: "2024-04-19",
        link: "single/feelings.html",
        produced_by_me: true
    }
    // Ajoute d'autres sons ici !
];

// FILTRES & RECHERCHE
let currentFilter = "all";
let currentSort = "date";
let currentSearch = "";

function displaySongs() {
    let filtered = songs.filter(song => {
        // Filtre type
        if (currentFilter === "prod" && !song.produced_by_me) return false;
            if (currentFilter !== "all" && currentFilter !== "prod" && song.type !== currentFilter) return false;

        // Recherche
        if (currentSearch) {
            const match = (song.title + " " + song.artist).toLowerCase().includes(currentSearch.toLowerCase());
            if (!match) return false;
        }
        return true;
    });

    // Tri
    if (currentSort === "alpha") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === "type") {
        filtered.sort((a, b) => a.type.localeCompare(b.type));
    } else { // date (par défaut, plus récent en premier)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const grid = document.getElementById("musicGrid");
    grid.innerHTML = "";
    filtered.forEach(song => {
        const div = document.createElement("div");
        div.className = "card";
        div.onclick = () => window.location.href = song.link;
        div.innerHTML = `
            <img class="cover" src="${song.cover}" alt="${song.title}">
            <div class="card-body">
                <div class="song-title">${song.title}</div>
                <div class="song-type">${formatType(song.type)}</div>
                <div class="artist">${song.artist}</div>
                ${song.produced_by_me ? '<div class="prod-badge" title="Produit par Noslow">🎹</div>' : ''}
            </div>
        `;
        grid.appendChild(div);
    });
}

function formatType(type) {
    switch(type) {
        case "projet": return "Projet";
        case "single": return "Single";
        case "feat": return "Featuring";
        case "clip": return "Clip Vidéo";
        case "prod": return "Produced by Noslow"
        default: return "";
    }
}

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.getAttribute("data-filter");
        displaySongs();
    });
});

document.getElementById("sortSelect").addEventListener("change", function() {
    currentSort = this.value;
    displaySongs();
});

document.getElementById("searchInput").addEventListener("input", function() {
    currentSearch = this.value;
    displaySongs();
});

window.onload = displaySongs;
