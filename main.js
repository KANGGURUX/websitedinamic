const api = 'backend/gallery_api.php';
const albumsDiv = document.getElementById('albums');
const albumView = document.getElementById('album-view');
const albumTitle = document.getElementById('album-title');
const backBtn = document.getElementById('back-btn');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const mediaList = document.getElementById('media-list');

let currentAlbum = '';

function showAlbums() {
    albumView.classList.add('hidden');
    albumsDiv.innerHTML = '<div class="loader"></div>';
    fetch(`${api}?action=list_albums`)
        .then(res => res.json())
        .then(data => {
            albumsDiv.innerHTML = '';
            if (data.albums.length === 0) {
                albumsDiv.innerHTML = '<p>No albums found.</p>';
            } else {
                data.albums.forEach(album => {
                    const frame = document.createElement('div');
                    frame.className = 'album-frame';
                    frame.innerHTML = `<span>${album}</span>`;
                    frame.onclick = () => showAlbum(album);
                    albumsDiv.appendChild(frame);
                });
            }
        });
}

function showAlbum(album) {
    currentAlbum = album;
    albumTitle.textContent = album;
    albumView.classList.remove('hidden');
    albumsDiv.innerHTML = '';
    fetch(`${api}?action=list_files&album=${encodeURIComponent(album)}`)
        .then(res => res.json())
        .then(data => {
            mediaList.innerHTML = '';
            if (data.files && data.files.length > 0) {
                data.files.forEach(file => {
                    const ext = file.split('.').pop().toLowerCase();
                    let el;
                    if (["mp4","mov","avi"].includes(ext)) {
                        el = document.createElement('video');
                        el.src = `${api}?action=media&album=${encodeURIComponent(album)}&filename=${encodeURIComponent(file)}`;
                        el.controls = true;
                    } else {
                        el = document.createElement('img');
                        el.src = `${api}?action=media&album=${encodeURIComponent(album)}&filename=${encodeURIComponent(file)}`;
                        el.alt = file;
                    }
                    el.className = 'media-item';
                    const wrapper = document.createElement('div');
                    wrapper.className = 'media-wrapper';
                    wrapper.appendChild(el);
                    const delBtn = document.createElement('button');
                    delBtn.textContent = 'Delete';
                    delBtn.onclick = () => deleteFile(album, file);
                    wrapper.appendChild(delBtn);
                    mediaList.appendChild(wrapper);
                });
            } else {
                mediaList.innerHTML = '<p>No media in this album.</p>';
            }
        });
}

function deleteFile(album, filename) {
    if (!confirm('Delete this file?')) return;
    const formData = new FormData();
    formData.append('album', album);
    formData.append('filename', filename);
    fetch(`${api}?action=delete`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(() => showAlbum(album));
}

uploadForm.onsubmit = function(e) {
    e.preventDefault();
    if (!fileInput.files.length) return;
    const formData = new FormData();
    formData.append('album', currentAlbum);
    formData.append('file', fileInput.files[0]);
    fetch(`${api}?action=upload`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(() => {
        fileInput.value = '';
        showAlbum(currentAlbum);
    });
};

backBtn.onclick = function() {
    showAlbums();
};

document.addEventListener('DOMContentLoaded', showAlbums);
