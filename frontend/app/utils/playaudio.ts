
export const playAudioInspection = async(audioname : string) => {
    const audioToPlay = new Audio("/audio/" + audioname)
    audioToPlay.volume = 1
    await audioToPlay.play()
}