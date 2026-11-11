const API_URL = 'http://localhost:4000/api/albums';
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('id');

async function loadAlbumDetails() {
    const titleEl = document.getElementById('albumTitleMain');
    const artistEl = document.getElementById('albumArtistMain');
    const dateEl = document.getElementById('albumReleaseDate');
    const coverEl = document.getElementById('albumCoverImg');
    const priceEl = document.getElementById('albumPriceBadge');
    const queueList = document.getElementById('queueList');
    const playerStage = document.getElementById('playerStage') || document.querySelector('.album-action-area');

    if (!albumId) {
        if (titleEl) titleEl.innerText = "Ningún álbum seleccionado";
        return;
    }

    try {
         const response = await fetch(`${API_URL}/${albumId}`);
        if (!response.ok) throw new Error('No se pudo conectar con la API del álbum');
        const album = await response.json();

        if (titleEl) titleEl.innerText = album.title;
        if (artistEl) artistEl.innerText = album.artist;
        if (dateEl) dateEl.innerText = `Lanzamiento: ${album.releaseDate}`;
        if (coverEl) coverEl.src = album.coverImage;
        if (priceEl) priceEl.innerText = `$${(album.price || 0).toFixed(2)}`;

        const currentUser = JSON.parse(localStorage.getItem('gigamusic_user'));
        let isOwner = false;

        if (currentUser && currentUser.id) {
            try {
                const userRes = await fetch(`http://localhost:4000/api/auth/profile/${currentUser.id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    const purchasedIds = userData.purchasedAlbums ? userData.purchasedAlbums.map(a => (a._id ? a._id.toString() : a.toString())) : [];
                    isOwner = purchasedIds.includes(albumId);
                }
            } catch (err) {
                console.error("No se pudo verificar el perfil de compras:", err);
            }
        }

        if (!isOwner) {
            let cartBtn = document.getElementById('addToCartBtn');
            if (!cartBtn && playerStage) {
                cartBtn = document.createElement('button');
                cartBtn.id = 'addToCartBtn';
                cartBtn.className = 'btn btn-primary';
                cartBtn.style.cssText = "width: 100%; margin-top: 1rem;";
                cartBtn.innerText = "🛒 Agregar al Carrito";
                playerStage.prepend(cartBtn);
            }

            if (cartBtn) {
                cartBtn.onclick = () => {
                    if (confirm(`¿Estás seguro de agregar el álbum "${album.title}" al carrito?`)) {
                        let cart = JSON.parse(localStorage.getItem('gigamusic_cart')) || [];
                        const exists = cart.some(item => item._id === album._id);
                        if (!exists) {
                            cart.push(album);
                            localStorage.setItem('gigamusic_cart', JSON.stringify(cart));
                        }
                        if (confirm("¡Álbum agregado al carrito! ¿Deseas ir al carrito de compras ahora?")) {
                            window.location.href = 'develop.html';
                        }
                    }
                };
            }
        } else {
            if (playerStage) {
                const notice = document.createElement('div');
                notice.style.cssText = "background: rgba(16, 185, 129, 0.15); border: 1px solid var(--success); color: var(--success); padding: 10px; border-radius: var(--radius); text-align: center; font-weight: bold; font-size: 0.85rem; width: 100%; margin-top: 1rem;";
                notice.innerText = "🎉 ¡Álbum Adquirido! Disfruta de la música completa.";
                playerStage.prepend(notice);
            }
        }

          if (queueList) {
            queueList.innerHTML = '';
            if (album.songs && album.songs.length > 0) {
                album.songs.forEach((song, index) => {
                    let safeAudioUrl = song.audioUrl;
                    if (!safeAudioUrl || safeAudioUrl.startsWith('blob:')) {
                        safeAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                    }

                    const li = document.createElement('li');
                    li.className = 'track-item';
                    li.innerHTML = `
                        <div class="track-details">
                            <span class="track-name">${index + 1}. ${song.title}</span>
                            <span class="track-artist-sub">${song.artist}</span>
                        </div>
                        <audio class="track-audio" controls style="height: 32px; width: 180px;">
                            <source src="${safeAudioUrl}" type="audio/mpeg">
                            Tu navegador no soporta audio.
                        </audio>
                    `;
                    
                    const audioEl = li.querySelector('.track-audio');
                    audioEl.volume = 1.0; // Forzar volumen al máximo

                    if (!isOwner) {
                        audioEl.addEventListener('timeupdate', () => {
                            if (audioEl.currentTime >= 60) {
                                audioEl.pause();
                                audioEl.currentTime = 0;
                                alert("⚠️ Vista previa limitada a 1 minuto. ¡Compra el álbum para escucharlo completo!");
                            }
                        });
                    }

                    queueList.appendChild(li);
                });
            } else {
                queueList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 10px;">No hay canciones en este álbum.</p>';
            }
        }

    } catch (error) {
        console.error('Error al cargar los detalles del álbum:', error);
        if (titleEl) titleEl.innerText = "Error al cargar el álbum";
        if (artistEl) artistEl.innerText = "Intenta recargar la página o selecciona otro disco.";
    }
}

document.addEventListener('DOMContentLoaded', loadAlbumDetails);