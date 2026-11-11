const API_URL = 'http://localhost:4000/api/albums';

// Elementos del DOM
const albumGrid = document.getElementById('albumGrid');
const modal = document.getElementById('albumModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.getElementById('closeModalBtn');
const albumForm = document.getElementById('albumForm');
const addSongBtn = document.getElementById('addSongBtn');
const songsContainer = document.getElementById('songsContainer');

if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.style.display = 'flex');
}

if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
}
if (addSongBtn && songsContainer) {
    addSongBtn.addEventListener('click', () => {
        const songRow = document.createElement('div');
        songRow.className = 'song-row';
        songRow.style.cssText = "background: #0f172a; padding: 1rem; border-radius: 6px; border: 1px solid #334155; display: flex; flex-direction: column; gap: 0.5rem; position: relative;";
        
        songRow.innerHTML = `
            <input type="text" placeholder="Nombre de la canción" class="song-title" required style="padding: 8px; background: #1e293b; border: 1px solid #334155; color: white; border-radius: 4px;">
            <input type="text" placeholder="Nombre del artista" class="song-artist" required style="padding: 8px; background: #1e293b; border: 1px solid #334155; color: white; border-radius: 4px;">
            
            <div class="drop-zone" style="border: 2px dashed #334155; padding: 15px; text-align: center; border-radius: 4px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem;">
                📁 Arrastra tu archivo de audio/video aquí o <span style="color: var(--accent);">haz clic para seleccionar</span>
                <input type="file" class="file-input" accept="audio/*,video/*" style="display: none;">
            </div>
            
            <div class="file-status" style="font-size: 0.75rem; color: var(--accent);"></div>
            <audio class="song-preview-audio" controls style="width: 100%; height: 30px; display: none; margin-top: 5px;"></audio>
            
            <button type="button" class="remove-song-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; align-self: flex-end; font-size: 0.75rem; margin-top: 5px;">Eliminar</button>
        `;

        const dropZone = songRow.querySelector('.drop-zone');
        const fileInput = songRow.querySelector('.file-input');
        const fileStatus = songRow.querySelector('.file-status');
        const audioElement = songRow.querySelector('.song-preview-audio');
        
        let finalAudioUrl = '';

        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--accent)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#334155';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#334155';
            if (e.dataTransfer.files.length > 0) {
                processMediaFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processMediaFile(e.target.files[0]);
            }
        });

        function processMediaFile(file) {
            fileStatus.innerText = "⏳ Procesando y codificando archivo multimedia...";
            const reader = new FileReader();
            
            reader.onload = function(e) {
                finalAudioUrl = e.target.result;
                audioElement.src = finalAudioUrl;
                audioElement.style.display = 'block';
                audioElement.volume = 1.0;
                fileStatus.innerText = "✅ Archivo listo y guardado en base de datos";
                songRow.dataset.audioUrl = finalAudioUrl;
            };
            
            reader.onerror = function() {
                fileStatus.innerText = "❌ Error al leer el archivo.";
            };

            reader.readAsDataURL(file);
        }

        songRow.querySelector('.remove-song-btn').addEventListener('click', () => songRow.remove());
        songsContainer.appendChild(songRow);
    });
}

// Enviar nuevo álbum al Backend
if (albumForm) {
    albumForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const songRows = document.querySelectorAll('.song-row');
        const songs = [];
        
        songRows.forEach(row => {
            songs.push({
                title: row.querySelector('.song-title').value,
                artist: row.querySelector('.song-artist').value,
                audioUrl: row.dataset.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
            });
        });

        const newAlbum = {
            title: document.getElementById('albumTitle').value,
            releaseDate: document.getElementById('albumReleaseDate').value,
            artist: document.getElementById('albumArtist').value,
            coverImage: document.getElementById('albumCover').value,
            price: parseFloat(document.getElementById('albumPrice').value) || 0,
            songs: songs
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAlbum)
            });
            const data = await res.json();
            if (res.ok) {
                window.location.href = `html/now play.html?id=${data.album._id}`;
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            console.error('Error de red:', err);
        }
    });
} 

async function fetchAlbums() {
    if (!albumGrid) return;
    try {
        const currentUser = JSON.parse(localStorage.getItem('gigamusic_user'));
        let purchasedIds = [];
        
        if (currentUser && currentUser.id) {
            try {
                const userRes = await fetch(`http://localhost:4000/api/auth/profile/${currentUser.id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    purchasedIds = userData.purchasedAlbums ? userData.purchasedAlbums.map(a => (a._id ? a._id.toString() : a.toString())) : [];
                }
            } catch (e) {
                console.warn("No se pudieron cargar los álbumes comprados.");
            }
        }

        const res = await fetch(API_URL);
        const albums = await res.json();
        
        if (!Array.isArray(albums) || albums.length === 0) {
            albumGrid.innerHTML = '<p style="color: var(--text-secondary);">No hay álbumes registrados.</p>';
            return;
        }

        // Función para renderizar el grid según una lista de álbumes (permite filtrar)
        const renderAlbumList = (listToRender) => {
            albumGrid.innerHTML = '';
            if (listToRender.length === 0) {
                albumGrid.innerHTML = '<p style="color: var(--text-secondary);">No se encontraron álbumes coincidentes.</p>';
                return;
            }

            const isAdmin = currentUser && currentUser.rol === 'admin';

            listToRender.forEach(album => {
                const albumIdStr = album._id ? album._id.toString() : '';
                const isPurchased = purchasedIds.includes(albumIdStr);
                
                const card = document.createElement('article');
                card.className = 'album-card';
                
                card.innerHTML = `
                    <div class="album-art-container" style="position: relative;">
                        <a href="html/now play.html?id=${album._id}">
                            <img src="${album.coverImage}" alt="${album.title}" style="width:100%; height:100%; object-fit:cover;">
                        </a>
                        <span class="price-badge">$${(album.price || 0).toFixed(2)}</span>
                        ${isPurchased 
                            ? '<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; color:#10b981; font-weight:bold; font-size:1.1rem; gap: 5px; pointer-events:none;"><span>✔ COMPRADO</span></div>' 
                            : ''}
                    </div>
                    <h4 style="margin-bottom: 4px; color: white;">${album.title}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 10px;">${album.artist}</p>
                    
                    <div style="display: flex; gap: 8px;">
                        <a href="html/now play.html?id=${album._id}" class="btn" style="flex: 1; text-align: center; font-size: 0.75rem; padding: 8px; background: var(--accent-blue, #3b82f6); color: white;">Escuchar</a>
                        ${isAdmin ? `<button class="btn delete-album-btn" data-id="${album._id}" style="background: var(--danger, #ef4444); color: white; font-size: 0.75rem; padding: 8px 12px; border: none; cursor: pointer;">🗑️</button>` : ''}
                    </div>
                `;

                if (isAdmin) {
                    const deleteBtn = card.querySelector('.delete-album-btn');
                    deleteBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        if (confirm(`¿Estás seguro de eliminar permanentemente el álbum "${album.title}"?`)) {
                            try {
                                const delRes = await fetch(`${API_URL}/${album._id}`, { method: 'DELETE' });
                                const delData = await delRes.json();
                                if (delRes.ok && delData.success) {
                                    alert("Álbum eliminado con éxito.");
                                    fetchAlbums();
                                } else {
                                    alert("Error al eliminar: " + (delData.message || "Desconocido"));
                                }
                            } catch (err) {
                                console.error("Error de red al eliminar:", err);
                            }
                        }
                    });
                }

                albumGrid.appendChild(card);
            });
        };

        // Renderizado inicial completo
        renderAlbumList(albums);

        // Activar buscador dinámico
        const searchInput = document.querySelector('input[placeholder*="buscar"], input[type="text"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase().trim();
                const filtered = albums.filter(album => 
                    album.title.toLowerCase().includes(term) || 
                    album.artist.toLowerCase().includes(term)
                );
                renderAlbumList(filtered);
            });
        }

    } catch (err) {
        console.error('Error cargando álbumes:', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchAlbums);