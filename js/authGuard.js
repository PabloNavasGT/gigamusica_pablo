(function () {
    const currentUser = JSON.parse(localStorage.getItem('gigamusic_user'));
    
    if (!currentUser || !currentUser.id) {
        const isInSubfolder = window.location.pathname.includes('/html/');
        window.location.href = isInSubfolder ? 'login.html' : 'html/login.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro de cerrar sesión en GigaMusic?")) {
                localStorage.removeItem('gigamusic_user');
                localStorage.removeItem('gigamusic_cart');
                
               const path = window.location.pathname;
                if (path.includes('/html/')) {
                    window.location.href = 'login.html';
                } else {
                    window.location.href = 'html/login.html';
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro de cerrar sesión en GigaMusic?")) {
                localStorage.removeItem('gigamusic_user');
                localStorage.removeItem('gigamusic_cart');
                const isInSubfolder = window.location.pathname.includes('/html/');
                window.location.href = isInSubfolder ? '../login.html' : 'login.html';
            }
        });
    }
});