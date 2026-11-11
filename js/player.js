const API_URL = 'http://localhost:4000/api/albums';

// Leer parámetro "id" desde la URL (ej: now play.html?id=12345)
const urlParams = new URLSearchParams(window.location.search);
const albumId = urlParams.get('id');

async function loadAlbumDetails() {
    const titleEl = document.getElementById('albumTitleMain');
    const artistEl = document.getElementById('albumArtistMain');
    const dateEl = document.getElementById('albumReleaseDate');
    const coverEl = document.getElementById('albumCoverImg');
    const queueList = document.getElementById('queueList');
    const playerStage = document.querySelector('.player-stage');

    if (!albumId) {
        if (titleEl) titleEl.innerText = "Ningún álbum seleccionado";
        return;
    }

    try {
        // 1. Obtener datos del álbum desde el backend
        const response = await fetch(`${API_URL}/${albumId}`);
        if (!response.ok) throw new Error('No se pudo conectar con la API del álbum');
        const album = await response.json();

        // Rellenar datos principales del álbum
        if (titleEl) titleEl.innerText = album.title;
        if (artistEl) artistEl.innerText = album.artist;
        if (dateEl) dateEl.innerText = `Lanzamiento: ${album.releaseDate}`;
        if (coverEl) coverEl.src = album.coverImage;

        // 2. Verificar si el usuario actual ya lo compró (de forma segura)
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

        // 3. Gestionar botón "Agregar al Carrito" o aviso de compra
        if (!isOwner) {
            let cartBtn = document.getElementById('addToCartBtn');
            if (!cartBtn && playerStage) {
                cartBtn = document.createElement('button');
                cartBtn.id = 'addToCartBtn';
                cartBtn.className = 'btn btn-primary';
                cartBtn.style.cssText = "margin-bottom: 1.5rem; background: var(--accent); color: white; cursor: pointer;";
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
                notice.style.cssText = "background: #10b981; color: white; padding: 8px; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: bold;";
                notice.innerText = "🎉 ¡Ya es tuyo! Disfruta de la música completa.";
                playerStage.prepend(notice);
            }
        }

        // 4. Renderizar listado de canciones (con o sin límite de 1 minuto)
        if (queueList) {
            queueList.innerHTML = '';
            if (album.songs && album.songs.length > 0) {
                album.songs.forEach((song, index) => {
                    const li = document.createElement('li');
                    li.style.cssText = "padding: 10px; background: #0f172a; border-radius: 6px; border: 1px solid #334155; display: flex; justify-content: space-between; align-items: center;";
                    li.innerHTML = `
                        <div>
                            <div style="font-weight: bold; color: white; font-size: 0.9rem;">${index + 1}. ${song.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary);">${song.artist}</div>
                        </div>
                        <audio class="track-audio" controls style="height: 30px; width: 140px;">
                            <source src="${song.audioUrl}" type="audio/mpeg">
                            Tu navegador no soporta audio.
                        </audio>
                    `;
                    
                    const audioEl = li.querySelector('.track-audio');
                    // Si no lo ha comprado, limitar reproducción a 60 segundos
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
                queueList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No hay canciones en este álbum.</p>';
            }
        }

    } catch (error) {
        console.error('Error al cargar los detalles del álbum:', error);
        if (titleEl) titleEl.innerText = "Error al cargar el álbum";
        if (artistEl) artistEl.innerText = "Intenta recargar la página o selecciona otro disco.";
    }
}

document.addEventListener('DOMContentLoaded', loadAlbumDetails);