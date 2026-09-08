
export const usePlayAudio = async(audio : HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.volume = 1;
    await audio.play();
};