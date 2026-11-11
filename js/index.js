const API_URL = 'http://localhost:4000/api/albums';

// Elementos del DOM
const albumGrid = document.getElementById('albumGrid');
const modal = document.getElementById('albumModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.getElementById('closeModalBtn');
const albumForm = document.getElementById('albumForm');
const addSongBtn = document.getElementById('addSongBtn');
const songsContainer = document.getElementById('songsContainer');

// Control del Modal
if (openBtn && modal) {
    openBtn.addEventListener('click', () => modal.style.display = 'flex');
}

if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
}

// Agregar fila para nueva canción con soporte de Drag & Drop y corte a 1 minuto
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
            fileStatus.innerText = "⏳ Procesando y ajustando archivo a máx. 1 minuto...";
            const tempUrl = URL.createObjectURL(file);
            const tempAudio = document.createElement('audio');
            tempAudio.src = tempUrl;

            tempAudio.addEventListener('loadedmetadata', async () => {
                const duration = tempAudio.duration;

                if (duration > 60) {
                    fileStatus.innerText = `⚠️ El archivo duraba ${Math.floor(duration)}s. Cortando a 60 segundos...`;
                    try {
                        finalAudioUrl = tempUrl;
                        audioElement.src = finalAudioUrl;
                        audioElement.style.display = 'block';
                        
                        audioElement.addEventListener('timeupdate', function() {
                            if (audioElement.currentTime >= 60) {
                                audioElement.pause();
                                audioElement.currentTime = 0;
                            }
                        });
                        fileStatus.innerText = "✅ Archivo listo (Limitado a 1:00 min)";
                    } catch (err) {
                        fileStatus.innerText = "❌ Error al procesar el archivo.";
                    }
                } else {
                    finalAudioUrl = tempUrl;
                    audioElement.src = finalAudioUrl;
                    audioElement.style.display = 'block';
                    fileStatus.innerText = `✅ Archivo cargado (${Math.floor(duration)}s)`;
                }
                songRow.dataset.audioUrl = finalAudioUrl;
            });
        }

        songRow.querySelector('.remove-song-btn').addEventListener('click', () => songRow.remove());
        songsContainer.appendChild(songRow);
    });
}

// Enviar nuevo álbum con su listado de canciones al Backend
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

// Cargar álbumes existentes y validar estado "Comprado"
async function fetchAlbums() {
    if (!albumGrid) return;
    try {
        const currentUser = JSON.parse(localStorage.getItem('gigamusic_user'));
        let purchasedIds = [];
        
        if (currentUser && currentUser.id) {
            const userRes = await fetch(`http://localhost:4000/api/auth/profile/${currentUser.id}`);
            if (userRes.ok) {
                const userData = await userRes.json();
                // Mapear asegurando que sean strings para evitar fallos de comparación
                purchasedIds = userData.purchasedAlbums ? userData.purchasedAlbums.map(a => (a._id ? a._id.toString() : a.toString())) : [];
            }
        }

        const res = await fetch(API_URL);
        const albums = await res.json();
        albumGrid.innerHTML = '';
        
        if (albums.length === 0) {
            albumGrid.innerHTML = '<p style="color: var(--text-secondary);">No hay álbumes registrados.</p>';
            return;
        }
        
        albums.forEach(album => {
            const albumIdStr = album._id ? album._id.toString() : '';
            const isPurchased = purchasedIds.includes(albumIdStr);
            
            const card = document.createElement('article');
            card.className = 'album-card';
            
            // Si ya está comprado, al hacer clic va directamente a la biblioteca/reproductor completo sin pasar por el carrito
            card.innerHTML = `
                <a href="${isPurchased ? 'html/now play.html?id=' + album._id : 'html/now play.html?id=' + album._id}">
                    <div class="album-art-container" style="position: relative;">
                        <img src="${album.coverImage}" alt="${album.title}" style="width:100%; height:100%; object-fit:cover;">
                        <span class="price-badge">$${(album.price || 0).toFixed(2)}</span>
                        ${isPurchased 
                            ? '<div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; color:#10b981; font-weight:bold; font-size:1.1rem; gap: 5px;"><span>✔ COMPRADO</span><span style="font-size:0.75rem; color:white;">Click para escuchar</span></div>' 
                            : '<div class="quick-action">Escuchar / Comprar</div>'}
                    </div>
                    <h4 style="margin-bottom: 4px; color: white;">${album.title}</h4>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">${album.artist}</p>
                </a>
            `;
            albumGrid.appendChild(card);
        });
    } catch (err) {
        console.error('Error cargando álbumes:', err);
    }
}
document.addEventListener('DOMContentLoaded', fetchAlbums);