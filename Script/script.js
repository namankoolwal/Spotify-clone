console.log("lets write js")
let currentSong = new Audio();
let songs;
let currFolder;
let currentLogo;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);
    var formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(remainingSeconds).padStart(2, '0');
    var formattedTime = formattedMinutes + ':' + formattedSeconds;

    return formattedTime;
}

async function getSongs(folder) {
    currFolder = folder
    let data = await fetch(`/${folder}/`)
    let response = await data.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `<li> <img src="Img/music.svg" alt="music icon">
                                                <div class="info">
                                                    <div>${decodeURI(song)}</div>
                                                    <div>Naman</div>
                                                </div>
                                                <div class="playnow">
                                                    <span class="playtext">Play Now</span>
                                                    <img src="Img/play.svg" class="invert play2" alt="play">
                                                </div> </li>`;
    }

    // Attach an event listener to each song
    // Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
    //     console.log(e)
    //     e.addEventListener("click", () => {
    //         Array.from(document.querySelectorAll(".play2")).forEach((every)=> {
    //             console.log(every.src)
    //             every.src = "Img/play.svg"
    //         })
    //         e.querySelector(".play2").src = "Img/pause.svg"
    //         playMusic(e.querySelector(".info>div").innerHTML.trim())
    //     })
    // }
    // )

    const songListItems = document.querySelectorAll(".songList li");
    songListItems.forEach((songListItem) => {
        songListItem.addEventListener("click", () => {

            const playButtons = document.querySelectorAll(".play2");
            const playTexts =  document.querySelectorAll(".playtext");
            const listFeatures = document.querySelectorAll(".songList li");
            playButtons.forEach((playButton) => {
                playButton.src = "Img/play.svg";
            });
            playTexts.forEach((playText)=>{
                playText.innerHTML = "Play Now"
            })
            listFeatures.forEach((listFeature)=>{
                listFeature.classList.remove("highlight")
            })

            const currentPlayButton = songListItem.querySelector(".play2");
            currentPlayButton.src = "Img/pause.svg";
            songListItem.classList.add("highlight")
            const currentPlayText = songListItem.querySelector(".playtext")
            currentPlayText.innerHTML = "Playing"
            playMusic(songListItem.querySelector(".info>div").innerHTML.trim());
        });
    });

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = "Img/pause.svg"
    }
    let trackSplit = decodeURI(track).split(".")
    // document.querySelector(".songinfo").innerHTML = trackSplit[0].substring(0, 15) +"..."
    document.querySelector(".songinfo").innerHTML = "<marquee>" + trackSplit[0].substring(0, 30) + "..." + "</marquee>"
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}


// Function to display albums
const displayAlbum = async () => {
    let data = await fetch(`/songs/`)
    let response = await data.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/songs/")[1]
            //    get the metadata of folder
            let data = await fetch(`/songs/${folder}/info.json`)
            let response = await data.json()
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                              <svg width="22" height="22" viewBox="0 0 21 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"
                                fill="black"/>
                                </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Add an event listener to card to change playlist
    document.getElementsByClassName("card")[0].classList.add("highlight")
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            document.querySelectorAll(".card").forEach(e=>{
                e.classList.remove("highlight")
            })
            item.currentTarget.classList.add("highlight")
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            document.querySelectorAll(".play2")[0].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[0].innerHTML = "Playing"
            document.querySelectorAll(".songList li")[0].classList.add("highlight")
            playMusic(songs[0], false)
        })
    })

}

async function main() {

    // get the songs from getSongs function 
    await getSongs('songs/Calming_Acoustic')
    playMusic(songs[0], true)

    displayAlbum()

    // Attach an event listener to play button
    play.addEventListener("click", () => {
        currentLogo = currentSong.src.split(`/${currFolder}/`)[1].toString()
        let currentIndex = songs.indexOf(currentLogo)

        if (currentSong.paused) {
            currentSong.play()
            play.src = "Img/pause.svg"
            document.querySelectorAll(".play2")[currentIndex].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[currentIndex].innerHTML= "Playing"
            document.querySelectorAll(".songList li")[currentIndex].classList.add("highlight")
        }
        else {
            currentSong.pause()
            play.src = "Img/play.svg"
            document.querySelectorAll(".play2")[currentIndex].src = "Img/play.svg"
            document.querySelectorAll(".playtext")[currentIndex].innerHTML = "Paused"

        }
    })

    // listen to time update of song
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)}/${convertSecondsToMinutes(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
        if(currentSong.currentTime == currentSong.duration){
           nextSongPlay()
        }
    })
    // Add an event listener in seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
       
    })

    // Add an event listener in hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add eventListener on close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener on previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            document.querySelectorAll(".play2")[index].src = "Img/play.svg"
            document.querySelectorAll(".play2")[index - 1].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[index].innerHTML= "Play Now"
            document.querySelectorAll(".playtext")[index - 1].innerHTML= "Playing"
            document.querySelectorAll(".songList li")[index].classList.remove("highlight")
            document.querySelectorAll(".songList li")[index - 1].classList.add("highlight")

        }
        else {
            playMusic(songs[songs.length - 1])
            document.querySelectorAll(".play2")[0].src = "Img/play.svg"
            document.querySelectorAll(".play2")[songs.length - 1].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[0].innerHTML= "Play Now"
            document.querySelectorAll(".playtext")[songs.length - 1].innerHTML= "Playing"
            document.querySelectorAll(".songList li")[0].classList.remove("highlight")
            document.querySelectorAll(".songList li")[songs.length - 1].classList.add("highlight")

        }
    })

    // Add an event listener on next button
    next.addEventListener("click", () => nextSongPlay())

    // function to play next Song
    const nextSongPlay = () =>{
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            document.querySelectorAll(".play2")[index].src = "Img/play.svg"
            document.querySelectorAll(".play2")[index + 1].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[index].innerHTML= "Play Now"
            document.querySelectorAll(".playtext")[index + 1].innerHTML= "Playing"
            document.querySelectorAll(".songList li")[index].classList.remove("highlight")
            document.querySelectorAll(".songList li")[index + 1].classList.add("highlight")
        }
        else {
            playMusic(songs[0])
            document.querySelectorAll(".play2")[songs.length - 1].src = "Img/play.svg"
            document.querySelectorAll(".play2")[0].src = "Img/pause.svg"
            document.querySelectorAll(".playtext")[songs.length - 1].innerHTML= "Play Now"
            document.querySelectorAll(".playtext")[0].innerHTML= "Playing"
            document.querySelectorAll(".songList li")[0].classList.add("highlight")
            document.querySelectorAll(".songList li")[songs.length - 1].classList.remove("highlight")
        }
    }

    // Add an event listener for volume range
    document.querySelector("#volrange").addEventListener("change", e => {
        document.querySelector("#volrange").setAttribute("title", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = "Img/volume.svg"
        }

    })
    document.querySelector("#volrange").addEventListener("mouseover", e => {
        document.querySelector("#volrange").setAttribute("title", e.target.value);
    })


    // Add an event listener on volume icon to toggle it
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("Img/volume.svg")) {
            e.target.src = "Img/mute.svg"
            currentSong.volume = 0
            volrange.value = 0
        }
        else {
            e.target.src = "Img/volume.svg"
            currentSong.volume = 0.10
            volrange.value = 10
        }
    })
}
main()