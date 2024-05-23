document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const audio = document.getElementById('audio');
    const playPauseButton = document.getElementById('playPauseButton');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const shuffleButton = document.getElementById('shuffleButton');
    const repeatButton = document.getElementById('repeatButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedSlider = document.getElementById('speedSlider');
    const volumeLabel = document.getElementById('volumeLabel');
    const speedLabel = document.getElementById('speedLabel');
    const playlistElement = document.getElementById('playlist');
    const nowPlaying = document.getElementById('nowPlaying');
    const rewindButton = document.getElementById('rewindButton');
    const forwardButton = document.getElementById('forwardButton');
    const newPlaylistButton = document.getElementById('newPlaylistButton');
    const tabs = document.getElementById('tabs');

    let playlists = [{ name: '初期プレイリスト', files: [] }];
    let currentPlaylistIndex = 0;
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;

    $(playlistElement).sortable({
        update: function (event, ui) {
            const newPlaylist = [];
            const items = playlistElement.getElementsByTagName('li');
            Array.from(items).forEach((item) => {
                const fileName = item.getAttribute('data-file-name');
                const file = playlists[currentPlaylistIndex].files.find(file => file.name === fileName);
                newPlaylist.push(file);
            });
            playlists[currentPlaylistIndex].files = newPlaylist;
        }
    });

    newPlaylistButton.addEventListener('click', function () {
        const playlistName = prompt("Enter playlist name:");
        if (playlistName) {
            playlists.push({ name: playlistName, files: [] });
            const newIndex = playlists.length - 1;
            const tab = createTab(playlistName, newIndex);
            tabs.appendChild(tab);
            switchPlaylist(newIndex);
        }
    });

    fileInput.addEventListener('change', function () {
        const files = Array.from(fileInput.files);
        if (files.length > 0) {
            playlists[currentPlaylistIndex].files = playlists[currentPlaylistIndex].files.concat(files);
            loadPlaylist();
        }
    });

    playPauseButton.addEventListener('click', function () {
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    });

    prevButton.addEventListener('click', function () {
        if (currentTrackIndex > 0) {
            currentTrackIndex--;
            loadTrack(currentTrackIndex);
            audio.play();
        }
    });

    nextButton.addEventListener('click', function () {
        if (currentTrackIndex < playlists[currentPlaylistIndex].files.length - 1) {
            currentTrackIndex++;
            loadTrack(currentTrackIndex);
            audio.play();
        }
    });

    rewindButton.addEventListener('click', function () {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
    });

    forwardButton.addEventListener('click', function () {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    });

    shuffleButton.addEventListener('click', function () {
        isShuffle = !isShuffle;
        shuffleButton.textContent = isShuffle ? '🔀 On' : '🔀';
    });

    repeatButton.addEventListener('click', function () {
        isRepeat = !isRepeat;
        repeatButton.textContent = isRepeat ? '🔁 On' : '🔁';
    });

    volumeSlider.addEventListener('input', function () {
        audio.volume = volumeSlider.value;
        volumeLabel.textContent = `${Math.round(volumeSlider.value * 100)}%`;
    });

    speedSlider.addEventListener('input', function () {
        audio.playbackRate = speedSlider.value;
        speedLabel.textContent = `${Math.round(speedSlider.value * 100)}%`;
    });

    audio.addEventListener('play', function () {
        isPlaying = true;
        playPauseButton.textContent = '⏸️';
        updateNowPlaying();
    });

    audio.addEventListener('pause', function () {
        isPlaying = false;
        playPauseButton.textContent = '▶️';
    });

    audio.addEventListener('ended', function () {
        if (isRepeat) {
            audio.play();
        } else if (isShuffle) {
            currentTrackIndex = Math.floor(Math.random() * playlists[currentPlaylistIndex].files.length);
            loadTrack(currentTrackIndex);
            audio.play();
        } else if (currentTrackIndex < playlists[currentPlaylistIndex].files.length - 1) {
            currentTrackIndex++;
            loadTrack(currentTrackIndex);
            audio.play();
        }
    });

    function loadTrack(index) {
        const file = playlists[currentPlaylistIndex].files[index];
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio.load();
        updatePlaylistUI();
        updateNowPlaying();
    }

    function loadPlaylist() {
        playlistElement.innerHTML = '';
        playlists[currentPlaylistIndex].files.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.setAttribute('data-file-name', file.name);
            li.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                audio.play();
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                playlists[currentPlaylistIndex].files.splice(index, 1);
                if (index === currentTrackIndex) {
                    if (isPlaying) {
                        if (currentTrackIndex === playlists[currentPlaylistIndex].files.length) {
                            currentTrackIndex--;
                        }
                        loadTrack(currentTrackIndex);
                        audio.play();
                    } else {
                        if (currentTrackIndex === playlists[currentPlaylistIndex].files.length) {
                            currentTrackIndex = 0;
                            audio.src = '';
                            updateNowPlaying();
                        }
                    }
                } else if (index < currentTrackIndex) {
                    currentTrackIndex--;
                }
                loadPlaylist();
            });

            li.appendChild(deleteButton);
            playlistElement.appendChild(li);
        });
    }

    function updatePlaylistUI() {
        const items = playlistElement.getElementsByTagName('li');
        Array.from(items).forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function updateNowPlaying() {
        if (playlists[currentPlaylistIndex].files[currentTrackIndex]) {
            nowPlaying.textContent = ` ${playlists[currentPlaylistIndex].files[currentTrackIndex].name}`;
        } else {
            nowPlaying.textContent = 'なし';
        }
    }

    function switchPlaylist(index) {
        currentPlaylistIndex = index;
        currentTrackIndex = 0;
        loadPlaylist();
        const tabButtons = tabs.getElementsByTagName('button');
        Array.from(tabButtons).forEach((button, i) => {
            if (i === index) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        if (playlists[currentPlaylistIndex].files.length > 0) {
            loadTrack(currentTrackIndex);
        } else {
            audio.src = '';
            nowPlaying.textContent = 'なし';
        }
    }

    function createTab(playlistName, index) {
        const tab = document.createElement('button');
        tab.classList.add('playlist-tab');
        const span = document.createElement('span');
        span.textContent = playlistName;
        tab.appendChild(span);

        const editButton = document.createElement('button');
        editButton.textContent = '✏️';
        editButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const newName = prompt('Enter new playlist name:', playlistName);
            if (newName) {
                playlists[index].name = newName;
                span.textContent = newName;
            }
        });
        tab.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const confirmDelete = confirm('Are you sure you want to delete this playlist?');
            if (confirmDelete) {
                playlists.splice(index, 1);
                tabs.removeChild(tab);
                if (index === currentPlaylistIndex) {
                    if (playlists.length > 0) {
                        switchPlaylist(0);
                    } else {
                        currentPlaylistIndex = 0;
                        currentTrackIndex = 0;
                        audio.src = '';
                        playlistElement.innerHTML = '';
                        nowPlaying.textContent = 'なし';
                    }
                } else if (index < currentPlaylistIndex) {
                    currentPlaylistIndex--;
                }
            }
        });
        tab.appendChild(deleteButton);

        tab.addEventListener('click', function () {
            switchPlaylist(index);
        });

        return tab;
    }

    playlists.forEach((playlist, index) => {
        const tab = createTab(playlist.name, index);
        tabs.appendChild(tab);
    });

    switchPlaylist(0);
});
