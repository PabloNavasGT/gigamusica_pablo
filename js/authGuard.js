(function () {
    const currentUser = JSON.parse(localStorage.getItem('gigamusic_user'));
    
     if (!currentUser || !currentUser.id) {
        // Como index.html está en la raíz, ajustamos la ruta relativa hacia html/login.html
        window.location.href = 'html/login.html';
    }
})();