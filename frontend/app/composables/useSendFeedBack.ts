export const useSendFeedBack = async (pseudo : string,mail: string,text : string,type: string) : Promise<any[]> => {

    try {
        await $fetch('/api/feedback', {
            method : 'POST',
            body: {
                message : text,
                mail : mail.trim().length === 0 ? '' : mail,
                pseudo :  pseudo.trim().length === 0 ? '' : pseudo,
                type: type
            }
        })
    } catch (e : any) {
       return [false,e.data.message]
    } 
    return [true,'Votre retour a bien été pris en compte.']
}